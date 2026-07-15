export const adminEmails = [
  "miguelnandisouza@gmail.com",
];

export function isAdminEmail(email?: string) {
  return Boolean(email && adminEmails.includes(email.toLowerCase()));
}
