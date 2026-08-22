import { renderToBuffer } from "@react-pdf/renderer";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/types";
import { ApplicationPdfDocument } from "@/lib/ApplicationPdfDocument";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS-scoped client: only returns a row if the caller is a signed-in admin
  // (enforced by is_admin() in supabase/schema.sql), same as the detail page.
  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .maybeSingle<Application>();

  if (!application) {
    notFound();
  }

  const buffer = await renderToBuffer(
    ApplicationPdfDocument({ application }) as Parameters<typeof renderToBuffer>[0]
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="application-${application.application_number}-${application.full_name.replace(/[^a-z0-9]+/gi, "-")}.pdf"`,
    },
  });
}
