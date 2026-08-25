"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  FormSection,
  TextField,
  TextAreaField,
  SelectField,
  FileField,
} from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { Reveal } from "@/components/motion";
import { INDIAN_STATES } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import {
  detectRealFileType,
  MAX_FILE_BYTES,
  GENERIC_UPLOAD_ERROR,
  INVALID_FILE_CONTENT_ERROR,
  HEIC_FILE_CONTENT_ERROR,
} from "@/lib/fileSniff";
import { submitApplication, createUploadUrl, type ApplyState, type UploadFolder } from "./actions";

const initialState: ApplyState = {};

const UPLOAD_FIELDS: { field: string; pathField: string; folder: UploadFolder }[] = [
  { field: "aadhaar_document", pathField: "aadhaar_document_path", folder: "aadhaar" },
  { field: "parent_aadhaar_document", pathField: "parent_aadhaar_document_path", folder: "parent-aadhaar" },
  { field: "class10_marksheet", pathField: "class10_marksheet_path", folder: "class10" },
  { field: "class12_marksheet", pathField: "class12_marksheet_path", folder: "class12" },
  { field: "final_semester_marksheet", pathField: "final_semester_marksheet_path", folder: "final-semester" },
];

async function uploadDocuments(formEl: HTMLFormElement): Promise<Record<string, string>> {
  const formData = new FormData(formEl);
  const supabase = createClient();
  const paths: Record<string, string> = {};

  try {
    for (const { field, pathField, folder } of UPLOAD_FIELDS) {
      const file = formData.get(field);
      if (!(file instanceof File) || file.size === 0) continue;

      if (file.size > MAX_FILE_BYTES) {
        throw new Error("One of your files is larger than 10MB. Please choose a smaller file and try again.");
      }

      const real = await detectRealFileType(file);
      if (real === "heic") throw new Error(HEIC_FILE_CONTENT_ERROR);
      if (!real) throw new Error(INVALID_FILE_CONTENT_ERROR);

      const { path, token } = await createUploadUrl(folder, real.ext);
      const { error } = await supabase.storage
        .from("documents")
        .uploadToSignedUrl(path, token, file, { contentType: real.mime });
      if (error) throw new Error(GENERIC_UPLOAD_ERROR);

      paths[pathField] = path;
    }
  } catch (err) {
    const alreadyUploaded = Object.values(paths);
    if (alreadyUploaded.length > 0) {
      await supabase.storage.from("documents").remove(alreadyUploaded).catch(() => {});
    }
    throw err;
  }

  return paths;
}

const STEPS = [
  { title: "Applicant Details", description: "Who you are and how to reach you." },
  { title: "Identity Documents", description: "Student and parent identity documents for verification." },
  { title: "Academic Records", description: "Your results and marksheets." },
  { title: "Financial & Family", description: "Support requested and family details." },
  { title: "Goals & Confirmation", description: "Your aspirations and final sign-off." },
] as const;

const TOTAL_STEPS = STEPS.length;

export default function ApplyPage() {
  const [state, formAction] = useActionState(submitApplication, initialState);
  const errors = state.fieldErrors ?? {};
  const [step, setStep] = useState(0);
  const wizardTopRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const readyToSubmitRef = useRef(false);
  const submittingRef = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedPaths, setUploadedPaths] = useState<Record<string, string>>({});
  const [filesConsumed, setFilesConsumed] = useState(false);

  useEffect(() => {
    if (!filesConsumed) return;
    const form = formRef.current;
    if (!form) return;
    if (typeof form.requestSubmit === "function") {
      form.requestSubmit();
    } else {
      startTransition(() => formAction(new FormData(form)));
    }
  }, [filesConsumed, formAction]);

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (readyToSubmitRef.current) return;
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setUploadError(null);
    setUploading(true);
    try {
      const paths = await uploadDocuments(event.currentTarget);
      setUploadedPaths(paths);
      readyToSubmitRef.current = true;
      setFilesConsumed(true);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : GENERIC_UPLOAD_ERROR);
      submittingRef.current = false;
    } finally {
      setUploading(false);
    }
  }

  const [handledFieldErrors, setHandledFieldErrors] = useState(state.fieldErrors);
  if (state.fieldErrors !== handledFieldErrors) {
    setHandledFieldErrors(state.fieldErrors);
    if (state.fieldErrors) {
      const erroredStep = STEP_FIELD_MAP.findIndex((fields) =>
        fields.some((field) => state.fieldErrors?.[field]?.length)
      );
      if (erroredStep !== -1) setStep(erroredStep);
    }
  }

  useEffect(() => {
    wizardTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function goToStep(target: number) {
    for (let i = step; i < target; i++) {
      const container = document.getElementById(`step-panel-${i}`);
      const invalid = container?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(":invalid");
      if (invalid) {
        setStep(i);
        requestAnimationFrame(() => invalid.reportValidity());
        return;
      }
    }
    setStep(Math.min(Math.max(target, 0), TOTAL_STEPS - 1));
  }

  function handleSubmitClick(event: React.MouseEvent<HTMLButtonElement>) {
    for (let i = 0; i < TOTAL_STEPS; i++) {
      const container = document.getElementById(`step-panel-${i}`);
      const invalid = container?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(":invalid");
      if (invalid) {
        event.preventDefault();
        setStep(i);
        requestAnimationFrame(() => invalid.reportValidity());
        return;
      }
    }
  }

  const progress = (step / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-brand-50/40 via-[var(--background)] to-[var(--background)]">
      <PublicHeader variant="minimal" />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-24 pt-10">
        <div ref={wizardTopRef} className="scroll-mt-24">
          <Reveal>
            <h1 className="font-display text-3xl font-bold text-brand-950 sm:text-4xl">Scholarship Application</h1>
            <p className="mt-2 text-sm text-slate-500">Shrimati Ramadevi Omprakash Kejriwal Family Private Trust · Jhunjhunu, Rajasthan</p>
          </Reveal>
          <Reveal delay={0.1} className="mt-6 rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-900">
            <p className="font-semibold">Before you apply</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Only candidates with 95% or higher marks should apply.</li>
              <li>Answers may be written in Hindi, English, or any language you prefer.</li>
              <li>Have your student Aadhaar card, parent Aadhaar card, and all marksheets ready to upload (PDF/JPG/PNG, max 10MB each).</li>
              <li>You will be informed within seven days of submitting the form.</li>
              <li>The final decision rests with the Trust.</li>
            </ul>
          </Reveal>
        </div>

        <div className="sticky top-16 z-30 mt-8 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-[var(--shadow-elevated)] backdrop-blur-md sm:p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-sm font-semibold text-brand-900">Step {step + 1} of {TOTAL_STEPS} · {STEPS[step].title}</span>
            <span className="text-xs font-medium text-slate-400">{Math.round(progress)}%</span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700" animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }} />
          </div>
          <div className="mt-3 hidden justify-between sm:flex">
            {STEPS.map((s, i) => (
              <button key={s.title} type="button" onClick={() => goToStep(i)} className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${i === step ? "text-brand-700" : i < step ? "text-brand-500" : "text-slate-300"}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] transition-colors ${i <= step ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-400"}`}>{i < step ? "✓" : i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        <form ref={formRef} action={formAction} onSubmit={handleFormSubmit} className="mt-6 flex flex-col gap-6">
          {(uploadError || state.error) && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{uploadError || state.error}</div>}

          <div id="step-panel-0" className={step === 0 ? "block animate-fade-in" : "hidden"}>
            <FormSection title={STEPS[0].title} description={STEPS[0].description}>
              <TextField label="Applicant's Name" name="full_name" required errors={errors.full_name} />
              <TextField label="Date of Birth" name="date_of_birth" type="date" required errors={errors.date_of_birth} />
              <TextField label="Mobile Number" name="mobile_number" type="tel" required errors={errors.mobile_number} hint="10-digit Indian mobile number" />
              <TextField label="Email" name="email" type="email" required errors={errors.email} />
              <div className="sm:col-span-2"><TextAreaField label="Applicant's Address" name="address" required errors={errors.address} /></div>
              <SelectField label="State" name="state" required options={INDIAN_STATES} errors={errors.state} />
              <TextField label="District" name="district" required errors={errors.district} />
            </FormSection>
          </div>

          <div id="step-panel-1" className={step === 1 ? "block animate-fade-in" : "hidden"}>
            <FormSection title={STEPS[1].title} description={STEPS[1].description}>
              <div className="sm:col-span-2">
                <FileField label="Upload Student Aadhaar Card" name="aadhaar_document" required disabled={filesConsumed} errors={errors.aadhaar_document_path} />
                {uploadedPaths.aadhaar_document_path && <input type="hidden" name="aadhaar_document_path" value={uploadedPaths.aadhaar_document_path} />}
              </div>
              <div className="sm:col-span-2">
                <FileField label="Upload Parent Aadhaar Card" name="parent_aadhaar_document" required disabled={filesConsumed} errors={errors.parent_aadhaar_document_path} hint="PDF, JPG, or PNG. Max 10MB." />
                {uploadedPaths.parent_aadhaar_document_path && <input type="hidden" name="parent_aadhaar_document_path" value={uploadedPaths.parent_aadhaar_document_path} />}
              </div>
            </FormSection>
          </div>

          <div id="step-panel-2" className={step === 2 ? "block animate-fade-in" : "hidden"}>
            <FormSection title={STEPS[2].title} description={STEPS[2].description}>
              <TextField label="Class 10th Result (%)" name="class10_percentage" type="number" required errors={errors.class10_percentage} />
              <div><FileField label="10th Class Marksheet" name="class10_marksheet" required disabled={filesConsumed} errors={errors.class10_marksheet_path} />{uploadedPaths.class10_marksheet_path && <input type="hidden" name="class10_marksheet_path" value={uploadedPaths.class10_marksheet_path} />}</div>
              <TextField label="Class 12th Result (%)" name="class12_percentage" type="number" required errors={errors.class12_percentage} />
              <div><FileField label="12th Class Marksheet" name="class12_marksheet" required disabled={filesConsumed} errors={errors.class12_marksheet_path} />{uploadedPaths.class12_marksheet_path && <input type="hidden" name="class12_marksheet_path" value={uploadedPaths.class12_marksheet_path} />}</div>
              <TextField label="Graduation Marks / Percentage" name="graduation_percentage" type="number" errors={errors.graduation_percentage} hint="Leave blank if not applicable" />
              <div><FileField label="Final Semester Marksheet" name="final_semester_marksheet" disabled={filesConsumed} errors={errors.final_semester_marksheet_path} hint="PDF, JPG, or PNG. Max 10MB. Leave blank if not applicable." />{uploadedPaths.final_semester_marksheet_path && <input type="hidden" name="final_semester_marksheet_path" value={uploadedPaths.final_semester_marksheet_path} />}</div>
              <div className="sm:col-span-2"><TextField label="Which field of education do you wish to pursue in the future?" name="future_field_of_study" required errors={errors.future_field_of_study} /></div>
            </FormSection>
          </div>

          <div id="step-panel-3" className={step === 3 ? "block animate-fade-in" : "hidden"}>
            <div className="flex flex-col gap-6">
              <FormSection title="Education cost & amount requested">
                <TextField label="Total Amount Requested Per Month (₹)" name="amount_requested_per_month" type="number" required errors={errors.amount_requested_per_month} />
                <TextField label="Requested Months" name="requested_months" required errors={errors.requested_months} placeholder="e.g. July 2026 – April 2027" />
              </FormSection>
              <FormSection title="Family details">
                <TextField label="Father's Name" name="father_name" required errors={errors.father_name} />
                <TextField label="Father's Contact Number" name="father_contact" type="tel" required errors={errors.father_contact} />
                <TextField label="Mother's Name" name="mother_name" required errors={errors.mother_name} />
                <TextField label="Mother/Father's Annual Income (₹)" name="parent_annual_income" type="number" required errors={errors.parent_annual_income} />
              </FormSection>
            </div>
          </div>

          <div id="step-panel-4" className={step === 4 ? "block animate-fade-in" : "hidden"}>
            <div className="flex flex-col gap-6">
              <FormSection title="Your goals">
                <div className="sm:col-span-2"><TextAreaField label="Your thoughts regarding serving the country / society in the future after attaining higher education" name="future_goals" required rows={5} errors={errors.future_goals} /></div>
              </FormSection>

              <FormSection title="Terms & Conditions">
                <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  <ol className="list-decimal space-y-2 pl-5">
                    <li>All information and documents provided by the student must be true, accurate, complete, and authentic.</li>
                    <li>The Trust reserves the right to verify the information and documents submitted by the student through background verification or any other verification process.</li>
                    <li>If any information or document is found to be false, incorrect, misleading, incomplete, or inaccurate during verification, the Trust may immediately cancel or withdraw the scholarship without prior notice.</li>
                    <li>The Trust reserves all rights regarding the scholarship and may cancel, withdraw, or discontinue the scholarship at any time at its discretion, subject to applicable law.</li>
                    <li>Submission of an application does not guarantee approval or continuation of a scholarship. The final decision rests with the Trust.</li>
                  </ol>
                </div>
              </FormSection>

              <FormSection title="Eligibility & Declaration">
                <div className="sm:col-span-2 flex items-start gap-3">
                  <input id="eligibility_confirmed" name="eligibility_confirmed" type="checkbox" required className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600" />
                  <label htmlFor="eligibility_confirmed" className="text-sm leading-6 text-slate-700">
                    I confirm that my marks are 95% or higher, that all information and documents submitted by me are true and correct, and that I have read, understood, and agree to the Terms & Conditions above. I understand that the Trust may verify the information and may immediately cancel or withdraw the scholarship if any information is found to be false or incorrect.
                  </label>
                </div>
                {errors.eligibility_confirmed && <p className="sm:col-span-2 text-xs font-medium text-red-600">{errors.eligibility_confirmed[0]}</p>}
              </FormSection>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <motion.button type="button" onClick={() => goToStep(step - 1)} whileHover={step === 0 ? undefined : { x: -2 }} disabled={step === 0 || uploading} className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-400 disabled:invisible">← Back</motion.button>
            {step < TOTAL_STEPS - 1 ? (
              <motion.button type="button" onClick={() => goToStep(step + 1)} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(15,99,85,0.55)] transition-colors hover:bg-brand-800">Continue →</motion.button>
            ) : (
              <SubmitButton fullWidthOnMobile={false} onClick={handleSubmitClick} busy={uploading} busyLabel="Uploading documents…" />
            )}
          </div>
        </form>
      </main>
      <PublicFooter />
    </div>
  );
}

const STEP_FIELD_MAP: readonly string[][] = [
  ["full_name", "date_of_birth", "mobile_number", "email", "address", "state", "district"],
  ["aadhaar_document_path", "parent_aadhaar_document_path"],
  ["class10_percentage", "class10_marksheet_path", "class12_percentage", "class12_marksheet_path", "graduation_percentage", "final_semester_marksheet_path", "future_field_of_study"],
  ["amount_requested_per_month", "requested_months", "father_name", "father_contact", "mother_name", "parent_annual_income"],
  ["future_goals", "eligibility_confirmed"],
];
