import { z } from "zod";

function requiredPath(label: string) {
  return z.string().trim().min(1, `${label} is required`);
}

function requiredNumber<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((v) => (v === "" ? undefined : v), schema);
}

export const applicationSchema = z.object({
  full_name: z.string().trim().min(2, "Enter the applicant's full name"),
  date_of_birth: z.string().min(1, "Date of birth is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Enter date of birth as YYYY-MM-DD").refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day && date.getTime() <= Date.now() + 24 * 60 * 60 * 1000;
  }, "Enter a valid date of birth"),
  mobile_number: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email("Enter a valid email address"),
  address: z.string().trim().min(5, "Enter the full address"),
  state: z.string().min(1, "Select a state"),
  district: z.string().trim().min(2, "Enter the district"),

  class10_percentage: requiredNumber(z.coerce.number().min(0).max(100, "Percentage must be between 0 and 100")),
  class10_marksheet_path: requiredPath("10th class marksheet"),
  class12_percentage: requiredNumber(z.coerce.number().min(0).max(100, "Percentage must be between 0 and 100")),
  class12_marksheet_path: requiredPath("12th class marksheet"),
  graduation_percentage: z.preprocess((v) => (v === "" ? undefined : v), z.coerce.number().min(0).max(100).optional()),
  final_semester_marksheet_path: z.string().trim().optional(),
  future_field_of_study: z.string().trim().min(2, "This field is required"),

  amount_requested_per_month: z.coerce.number().positive("Enter the amount requested per month"),
  requested_months: z.string().trim().min(1, "This field is required"),
  father_name: z.string().trim().min(2, "Father's name is required"),
  father_contact: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  mother_name: z.string().trim().min(2, "Mother's name is required"),
  parent_annual_income: requiredNumber(z.coerce.number().min(0, "Enter the annual family income")),

  future_goals: z.string().trim().min(20, "Please share at least a few sentences"),
  aadhaar_document_path: requiredPath("Student Aadhaar card"),
  parent_aadhaar_document_path: requiredPath("Parent Aadhaar card"),

  eligibility_confirmed: z.preprocess((v) => v === "on" || v === true, z.literal(true, { message: "You must confirm the Terms & Conditions to submit" })),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
