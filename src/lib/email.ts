import { Resend } from "resend";

// Notifies the Trust admin that a new application arrived. Failure here must
// never block a student's submission — callers should fire-and-forget this
// inside a try/catch after the application row is safely saved. Silently
// no-ops (with a server-log warning) until RESEND_API_KEY and
// ADMIN_NOTIFICATION_EMAIL are configured, so the app keeps working without
// email set up — it just won't notify anyone yet.
export async function notifyAdminOfNewApplication(details: {
  applicantName: string;
  email: string;
  mobileNumber: string;
  state: string;
  district: string;
  class10Percentage: number;
  class12Percentage: number;
  amountRequestedPerMonth: number;
  applicationUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  const fromAddress = process.env.NOTIFICATION_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!apiKey || !adminEmail) {
    console.warn(
      "[email] Skipping admin notification: RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL is not set."
    );
    return;
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: `Scholarship Portal <${fromAddress}>`,
    to: adminEmail,
    subject: `New scholarship application: ${details.applicantName}`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0f6355;">New Scholarship Application</h2>
        <p><strong>${escapeHtml(details.applicantName)}</strong> just submitted an application.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 4px 0; color: #64748b;">Email</td><td>${escapeHtml(details.email)}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Mobile</td><td>${escapeHtml(details.mobileNumber)}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Location</td><td>${escapeHtml(details.district)}, ${escapeHtml(details.state)}</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Class 10th</td><td>${details.class10Percentage}%</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Class 12th</td><td>${details.class12Percentage}%</td></tr>
          <tr><td style="padding: 4px 0; color: #64748b;">Requested / month</td><td>₹${details.amountRequestedPerMonth}</td></tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="${details.applicationUrl}" style="background: #0f6355; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Review application
          </a>
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[email] Failed to send admin notification:", error.message);
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
