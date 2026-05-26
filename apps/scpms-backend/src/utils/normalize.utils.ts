export const normalizeText = (value: string): string => {
  return value.trim().replace(/\s+/g, " ");
};

export const normalizeEmails = (email: string): string => {
  return normalizeText(email).toLowerCase();
};

export const normalizeName = (name: string): string => {
  return normalizeText(name)
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const normalizeCompanyName = (company: string): string => {
  return normalizeText(company)
    .split(" ")
    .map((word) => {
      if (word === word.toUpperCase() && word.length <= 5) {
        return word;
      }

      const lower = word.toLowerCase();

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
};

export const normalizePhone = (phone: string): string => {
  return phone.replace(/\D/g, "");
};

export const normalizeUniversityName = (university: string): string => {
  return normalizeText(university)
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const normalizeUrl = (url: string): string => {
  const cleaned = normalizeText(url);

  try {
    const parsed = new URL(cleaned);

    parsed.hostname = parsed.hostname.toLowerCase();

    return parsed.toString();
  } catch {
    return cleaned;
  }
};

export const normalizeDepartmentName = (name: string): string => {
  const cleaned = name.trim().replace(/\s+/g, " ");

  const upperSet = ["CSE", "ECE", "EEE", "IT", "MBA", "MCA", "BCA", "AI", "DS"];

  return cleaned
    .split(" ")
    .map((word) => {
      const upper = word.toUpperCase();

      if (upperSet.includes(upper)) return upper;

      if (word === "&") return "&";

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};

export const normalizeSkillName = (skill: string) => {
  const known = new Set(["SQL", "AWS", "HTML", "CSS", "JS", "TS"]);

  return skill
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      const upper = word.toUpperCase();

      if (known.has(upper)) return upper;

      const lower = word.toLowerCase();

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
};
