import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Application } from "@/lib/types";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#1a2420" },
  header: { marginBottom: 16, borderBottom: "2 solid #0f6355", paddingBottom: 10 },
  trustName: { fontSize: 14, fontWeight: 700, color: "#0a3f38" },
  trustSub: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  refNumber: { fontSize: 11, fontWeight: 700, color: "#0f6355", marginTop: 6 },
  applicantName: { fontSize: 16, fontWeight: 700, marginBottom: 10 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0a3f38",
    marginBottom: 6,
    borderBottom: "0.5 solid #d1d5db",
    paddingBottom: 3,
  },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 160, color: "#6b7280" },
  value: { flex: 1, fontWeight: 500 },
  goalsText: { lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: "#9ca3af",
    borderTop: "0.5 solid #e5e7eb",
    paddingTop: 6,
  },
});

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function ApplicationPdfDocument({ application }: { application: Application }) {
  return (
    <Document title={`Application #${application.application_number} - ${application.full_name}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.trustName}>
            Shrimati Ramadevi Omprakash Kejriwal Family Private Trust
          </Text>
          <Text style={styles.trustSub}>Jhunjhunu, Rajasthan 333001, India</Text>
          <Text style={styles.refNumber}>
            Application #{application.application_number}
          </Text>
        </View>

        <Text style={styles.applicantName}>{application.full_name}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applicant Details</Text>
          <Row label="Date of Birth" value={application.date_of_birth} />
          <Row label="Mobile Number" value={application.mobile_number} />
          <Row label="Email" value={application.email} />
          <Row label="Address" value={application.address} />
          <Row label="District, State" value={`${application.district}, ${application.state}`} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Records</Text>
          <Row label="Class 10th %" value={`${application.class10_percentage}%`} />
          <Row label="Class 12th %" value={`${application.class12_percentage}%`} />
          <Row
            label="Graduation %"
            value={application.graduation_percentage != null ? `${application.graduation_percentage}%` : "N/A"}
          />
          <Row label="Future Field of Study" value={application.future_field_of_study} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial &amp; Family Details</Text>
          <Row label="Amount Requested / Month" value={`Rs. ${application.amount_requested_per_month}`} />
          <Row label="Requested Months" value={application.requested_months} />
          <Row label="Father's Name" value={application.father_name} />
          <Row label="Father's Contact" value={application.father_contact} />
          <Row label="Mother's Name" value={application.mother_name} />
          <Row label="Parent Annual Income" value={`Rs. ${application.parent_annual_income}`} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Future Goals</Text>
          <Text style={styles.goalsText}>{application.future_goals}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <Row label="Current Status" value={application.status.replace("_", " ")} />
          {application.admin_notes && <Row label="Admin Notes" value={application.admin_notes} />}
        </View>

        <Text style={styles.footer}>
          Submitted {new Date(application.created_at).toLocaleString("en-IN")} · Generated
          {" "}
          {new Date().toLocaleString("en-IN")} · Uploaded identity and marksheet documents are not
          embedded in this PDF for file-size and privacy reasons — view them in the admin dashboard.
        </Text>
      </Page>
    </Document>
  );
}
