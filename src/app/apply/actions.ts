"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { applicationSchema } from "@/lib/validation";
import { notifyAdminOfNewApplication } from "@/lib/email";
import { notifyAdminsOfNewApplicationByPush } from "@/lib/push";
import { GENERIC_UPLOAD_ERROR } from "@/lib/fileSniff";

export type ApplyState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const GENERIC_SAVE_ERROR =
  "We couldn't save your application. Please try again in a moment.";
const GENERIC_UNEXPECTED_ERROR =
  "Something went wrong submitting your application. Please try again.";

export type UploadFolder = "aadhaar" | "class10" | "class12" | "final-semester";
const UPLOAD_FOLDERS: UploadFolder[] = ["aadhaar", "class10", "class12", "final-semester"];

// Documents are uploaded directly from the browser straight to Supabase
// Storage (see src/app/apply/page.tsx), never through this — or any — Server
// Action body. Vercel's serverless functions hard-cap request bodies at
// ~4.5MB regardless of next.config.ts's own bodySizeLimit, and a real
// submission's 2-3 required documents routinely exceed that on their own.
// This action only ever hands out a short-lived signed upload URL (the
// caller still needs the private `documents` bucket's service-role access to
// get one, since the bucket has no public insert policy) — the actual bytes
// never pass through our server.
export async function createUploadUrl(folder: UploadFolder, ext: "pdf" | "jpg" | "png") {
  if (!UPLOAD_FOLDERS.includes(folder)) {
    throw new Error("Invalid upload folder");
  }

  try {
    const supabase = createAdminClient();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { data, error } = await supabase.storage.from("documents").createSignedUploadUrl(path);

    if (error || !data) {
      console.error(`[apply] Failed to create signed upload url for ${folder}:`, error?.message);
      throw new Error(GENERIC_UPLOAD_ERROR);
    }

    return { path, token: data.token };
  } catch (err) {
    if (err instanceof Error && err.message === GENERIC_UPLOAD_ERROR) throw err;
    console.error(`[apply] Unexpected error creating signed upload url for ${folder}:`, err);
    throw new Error(GENERIC_UPLOAD_ERROR);
  }
}

export async function submitApplication(
  _prevState: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  const parsed = applicationSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (err) {
    console.error("[apply] Failed to create Supabase admin client:", err);
    return { error: GENERIC_UNEXPECTED_ERROR };
  }

  const uploadedPaths = [
    data.aadhaar_document_path,
    data.class10_marksheet_path,
    data.class12_marksheet_path,
    data.final_semester_marksheet_path,
  ].filter((p): p is string => Boolean(p));

  try {
    const { data: inserted, error: insertError } = await supabase
      .from("applications")
      .insert({
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        mobile_number: data.mobile_number,
        email: data.email,
        address: data.address,
        state: data.state,
        district: data.district,
        class10_percentage: data.class10_percentage,
        class10_marksheet_path: data.class10_marksheet_path,
        class12_percentage: data.class12_percentage,
        class12_marksheet_path: data.class12_marksheet_path,
        graduation_percentage: data.graduation_percentage ?? null,
        final_semester_marksheet_path: data.final_semester_marksheet_path ?? null,
        future_field_of_study: data.future_field_of_study,
        amount_requested_per_month: data.amount_requested_per_month,
        requested_months: data.requested_months,
        father_name: data.father_name,
        father_contact: data.father_contact,
        mother_name: data.mother_name,
        parent_annual_income: data.parent_annual_income,
        future_goals: data.future_goals,
        aadhaar_document_path: data.aadhaar_document_path,
        eligibility_confirmed: data.eligibility_confirmed,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("[apply] Insert failed:", insertError?.message);
      // The documents already made it to storage but no row references them —
      // clean them up rather than leaving orphaned PII behind.
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("documents").remove(uploadedPaths);
      }
      return { error: GENERIC_SAVE_ERROR };
    }

    // Best-effort notifications — a failure here must never stop a student's
    // submission from succeeding, since the application is already saved.
    const host = (await headers()).get("host") ?? "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const applicationUrl = `${protocol}://${host}/admin/applications/${inserted.id}`;

    try {
      await notifyAdminOfNewApplication({
        applicantName: data.full_name,
        email: data.email,
        mobileNumber: data.mobile_number,
        state: data.state,
        district: data.district,
        class10Percentage: data.class10_percentage,
        class12Percentage: data.class12_percentage,
        amountRequestedPerMonth: data.amount_requested_per_month,
        applicationUrl,
      });
    } catch (notifyError) {
      console.error("[email] Admin notification threw unexpectedly:", notifyError);
    }

    try {
      await notifyAdminsOfNewApplicationByPush({
        title: "New scholarship application",
        body: `${data.full_name} · ${data.district}, ${data.state}`,
        url: applicationUrl,
      });
    } catch (pushError) {
      console.error("[push] Admin push notification threw unexpectedly:", pushError);
    }
  } catch (err) {
    console.error("[apply] Unexpected error saving application:", err);
    if (uploadedPaths.length > 0) {
      await supabase.storage.from("documents").remove(uploadedPaths);
    }
    return { error: GENERIC_UNEXPECTED_ERROR };
  }

  redirect("/success");
}
