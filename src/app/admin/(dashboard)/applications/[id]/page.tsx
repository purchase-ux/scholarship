import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Application } from "@/lib/types";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { StatusForm } from "./StatusForm";
import { DeleteApplicationButton } from "./DeleteApplicationButton";

const SIGNED_URL_TTL_SECONDS = 60 * 10;

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5"><dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt><dd className="text-sm text-slate-800">{value}</dd></div>;
}

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: application } = await supabase.from("applications").select("*").eq("id", id).maybeSingle<Application>();
  if (!application) notFound();

  const documentEntries: { label: string; path: string | null }[] = [
    { label: "Student Aadhaar Card", path: application.aadhaar_document_path },
    { label: "Parent Aadhaar Card", path: application.parent_aadhaar_document_path },
    { label: "10th Class Marksheet", path: application.class10_marksheet_path },
    { label: "12th Class Marksheet", path: application.class12_marksheet_path },
    { label: "Final Semester Marksheet", path: application.final_semester_marksheet_path },
  ];

  const documents = await Promise.all(documentEntries.map(async (doc) => {
    if (!doc.path) return { ...doc, url: null };
    const { data } = await supabase.storage.from("documents").createSignedUrl(doc.path, SIGNED_URL_TTL_SECONDS);
    return { ...doc, url: data?.signedUrl ?? null };
  }));

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"><span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>Back to applications</Link>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Reveal delay={0}><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-elevated)]"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-gold-700">Application #{application.application_number}</p><h1 className="font-display text-xl font-bold text-brand-950">{application.full_name}</h1></div><a href={`/admin/applications/${application.id}/pdf`} className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-800">↓ Download / Share PDF</a></div><div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"><InfoRow label="Date of Birth" value={application.date_of_birth} /><InfoRow label="Mobile Number" value={<a href={`tel:+91${application.mobile_number}`} className="font-medium text-brand-700 hover:underline">{application.mobile_number}</a>} /><InfoRow label="Email" value={<a href={`mailto:${application.email}`} className="font-medium text-brand-700 hover:underline">{application.email}</a>} /><InfoRow label="Location" value={`${application.district}, ${application.state}`} /><div className="sm:col-span-2"><InfoRow label="Address" value={application.address} /></div></div></section></Reveal>

          <Reveal delay={0.08}><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-elevated)]"><h2 className="font-display text-base font-semibold text-brand-950">Academic Records</h2><div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"><InfoRow label="Class 10th %" value={`${application.class10_percentage}%`} /><InfoRow label="Class 12th %" value={`${application.class12_percentage}%`} /><InfoRow label="Graduation %" value={application.graduation_percentage != null ? `${application.graduation_percentage}%` : "—"} /><InfoRow label="Future Field of Study" value={application.future_field_of_study} /></div></section></Reveal>

          <Reveal delay={0.16}><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-elevated)]"><h2 className="font-display text-base font-semibold text-brand-950">Financial &amp; Family Details</h2><div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"><InfoRow label="Amount Requested / Month" value={`₹${application.amount_requested_per_month}`} /><InfoRow label="Requested Months" value={application.requested_months} /><InfoRow label="Father's Name" value={application.father_name} /><InfoRow label="Father's Contact" value={<a href={`tel:+91${application.father_contact}`} className="font-medium text-brand-700 hover:underline">{application.father_contact}</a>} /><InfoRow label="Mother's Name" value={application.mother_name} /><InfoRow label="Parent Annual Income" value={`₹${application.parent_annual_income}`} /></div></section></Reveal>

          <Reveal delay={0.24}><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-elevated)]"><h2 className="font-display text-base font-semibold text-brand-950">Future Goals</h2><p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{application.future_goals}</p></section></Reveal>

          <Reveal delay={0.32}><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-elevated)]"><h2 className="font-display text-base font-semibold text-brand-950">Documents</h2><StaggerContainer className="mt-3 flex flex-col gap-2">{documents.map((doc) => <StaggerItem key={doc.label}><div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-2.5 text-sm transition-colors hover:bg-brand-50/50"><span className="text-slate-700">{doc.label}</span>{doc.url ? <a href={doc.url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 transition-colors hover:text-brand-900 hover:underline">View</a> : <span className="text-slate-400">Not provided</span>}</div></StaggerItem>)}</StaggerContainer></section></Reveal>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit"><Reveal delay={0.2} direction="left"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-elevated)]"><h2 className="font-display text-base font-semibold text-brand-950">Review</h2><p className="mt-1 text-xs text-slate-500">Submitted {new Date(application.created_at).toLocaleString("en-IN")}</p><div className="mt-4"><StatusForm applicationId={application.id} currentStatus={application.status} currentNotes={application.admin_notes} /></div><DeleteApplicationButton applicationId={application.id} /></section></Reveal></aside>
      </div>
    </div>
  );
}
