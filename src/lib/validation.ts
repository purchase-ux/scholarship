import { z } from "zod";

// Documents are uploaded directly from the browser to Supabase Storage
// (see src/app/apply/actions.ts + src/app/apply/page.tsx) before this schema
// ever runs — routing the raw file bytes through this Server Action instead
// hits Vercel's hard ~4.5MB request body limit for any real 2-3 document
// submission, no matter how high next.config.ts's own bodySizeLimit is set.
// So by the time this validates, a file field is just the storage path it
// was uploaded to.
function requiredPath(label: string) {
  return z.string().trim().min(1, `${label} is required`);
}

// z.coerce.number() turns an empty string into 0 (Number("") === 0), not NaN —
// so a required numeric field left blank would silently pass as a real 0
// instead of failing validation. Normalize "" to undefined first so it fails
// the way an actually-missing value does.
function requiredNumber<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((v) => (v === "" ? undefined : v), schema);
}

export const applicationSchema = z.object({
  full_name: z.string().trim().min(2, "Enter the applicant's full name"),
  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter date of birth as YYYY-MM-DD")
    .refine((value) => {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day &&
        // Compare with a day of slack, not the exact instant: the entered
        // date is a calendar day with no timezone of its own (built via
        // Date.UTC), but the applicant's local "today" can already be
        // tomorrow in UTC terms (e.g. IST is UTC+5:30) — without this, a
        // student entering their real local "today" during the first ~5-6
        // hours of the UTC day would be wrongly rejected as "in the future".
        date.getTime() <= Date.now() + 24 * 60 * 60 * 1000
      );
    }, "Enter a valid date of birth"),
  mobile_number: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email("Enter a valid email address"),
  address: z.string().trim().min(5, "Enter the full address"),
  state: z.string().min(1, "Select a state"),
  district: z.string().trim().min(2, "Enter the district"),

  class10_percentage: requiredNumber(
    z.coerce.number().min(0).max(100, "Percentage must be between 0 and 100")
  ),
  class10_marksheet_path: requiredPath("10th class marksheet"),
  class12_percentage: requiredNumber(
    z.coerce.number().min(0).max(100, "Percentage must be between 0 and 100")
  ),
  class12_marksheet_path: requiredPath("12th class marksheet"),
  graduation_percentage: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.coerce.number().min(0).max(100).optional()
  ),
  final_semester_marksheet_path: z.string().trim().optional(),
  future_field_of_study: z.string().trim().min(2, "This field is required"),

  amount_requested_per_month: z.coerce
    .number()
    .positive("Enter the amount requested per month"),
  requested_months: z.string().trim().min(1, "This field is required"),
  father_name: z.string().trim().min(2, "Father's name is required"),
  father_contact: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  mother_name: z.string().trim().min(2, "Mother's name is required"),
  parent_annual_income: requiredNumber(
    z.coerce.number().min(0, "Enter the annual family income")
  ),

  future_goals: z
    .string()
    .trim()
    .min(20, "Please share at least a few sentences"),
  aadhaar_document_path: requiredPath("Aadhaar card"),

  eligibility_confirmed: z.preprocess(
    (v) => v === "on" || v === true,
    z.literal(true, { message: "You must confirm your eligibility to submit" })
  ),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
