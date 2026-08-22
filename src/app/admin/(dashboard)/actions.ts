"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export type UpdateStatusState = { error?: string; success?: boolean };

const VALID_STATUSES = ["pending", "under_review", "approved", "rejected"];

export async function updateStatusAction(
  _prevState: UpdateStatusState,
  formData: FormData
): Promise<UpdateStatusState> {
  const applicationId = String(formData.get("application_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const adminNotes = String(formData.get("admin_notes") ?? "").trim();

  if (!applicationId || !VALID_STATUSES.includes(status)) {
    return { error: "Invalid request." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { error } = await supabase
    .from("applications")
    .update({ status, admin_notes: adminNotes || null })
    .eq("id", applicationId);

  if (error) {
    return { error: "Could not update the application. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/applications/${applicationId}`);
  return { success: true };
}

export async function deleteApplicationAction(
  applicationId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  // RLS ("Admins can read applications") only lets an admin session find this
  // row at all, so this fetch doubles as the authorization check for the
  // privileged delete below — a non-admin session gets "not found" here and
  // never reaches the service-role client.
  const { data: application, error: fetchError } = await supabase
    .from("applications")
    .select(
      "aadhaar_document_path, class10_marksheet_path, class12_marksheet_path, final_semester_marksheet_path"
    )
    .eq("id", applicationId)
    .maybeSingle();

  if (fetchError || !application) {
    return { error: "Application not found." };
  }

  // The applications/documents RLS policies only grant admins select/update,
  // not delete. Rather than adding delete-specific policies, use the
  // service-role client for the actual delete now that the fetch above has
  // already confirmed this session belongs to a real admin.
  const admin = createAdminClient();
  const paths = [
    application.aadhaar_document_path,
    application.class10_marksheet_path,
    application.class12_marksheet_path,
    application.final_semester_marksheet_path,
  ].filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await admin.storage.from("documents").remove(paths);
  }

  const { error: deleteError } = await admin
    .from("applications")
    .delete()
    .eq("id", applicationId);

  if (deleteError) {
    return { error: "Could not delete the application. Please try again." };
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function subscribeToPush(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      admin_user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    throw new Error("Could not save your notification subscription.");
  }
}

export async function unsubscribeFromPush(endpoint: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("push_subscriptions")
    .delete()
    .eq("admin_user_id", user.id)
    .eq("endpoint", endpoint);
}
