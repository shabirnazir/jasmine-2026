const normalizeEmail = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const getAdminEmails = () => {
  const raw = process.env.ADMIN_EMAILS || "[]";

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(normalizeEmail).filter(Boolean);
    }
  } catch (error) {
    // Fallback to comma-separated support for easier local setup.
  }

  return raw.split(",").map(normalizeEmail).filter(Boolean);
};

export const isAdminEmail = (email) =>
  getAdminEmails().includes(normalizeEmail(email));
