import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_qvign7g";
const STAFF_INVITATION_TEMPLATE_ID = "template_7yh37aw";
const PUBLIC_KEY = "-V8JLH2rrqpisLs9Z";

interface StaffInvitationParams {
  email: string;
  staff_name: string;
  staff_email: string;
  temporary_password: string;
}

export const sendStaffInvitationEmail = async ({
  email,
  staff_name,
  staff_email,
  temporary_password,
}: StaffInvitationParams) => {
  return emailjs.send(
    SERVICE_ID,
    STAFF_INVITATION_TEMPLATE_ID,
    {
      email,
      staff_name,
      staff_email,
      temporary_password,
    },
    {
      publicKey: PUBLIC_KEY,
    }
  );
};