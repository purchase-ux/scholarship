export type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected";

export interface Application {
  id: string;
  application_number: number;
  created_at: string;
  updated_at: string;

  full_name: string;
  date_of_birth: string;
  mobile_number: string;
  email: string;
  address: string;
  state: string;
  district: string;

  class10_percentage: number;
  class10_marksheet_path: string;
  class12_percentage: number;
  class12_marksheet_path: string;
  graduation_percentage: number | null;
  final_semester_marksheet_path: string | null;
  future_field_of_study: string;

  amount_requested_per_month: number;
  requested_months: string;
  father_name: string;
  father_contact: string;
  mother_name: string;
  parent_annual_income: number;

  future_goals: string;
  aadhaar_document_path: string;
  parent_aadhaar_document_path: string | null;

  eligibility_confirmed: boolean;
  status: ApplicationStatus;
  admin_notes: string | null;
}

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
] as const;
