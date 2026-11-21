export interface MaskPiiResult {
  masked: string;
  counts: Record<"email" | "phone" | "nik" | "nim" | "link" | "address", number>;
  contacts: {
    emails: string[];
    phones: string[];
    links: string[];
  };
}

export function maskPii(text: string): MaskPiiResult {
  if (!text) {
    return {
      masked: "",
      counts: { email: 0, phone: 0, nik: 0, nim: 0, link: 0, address: 0 },
      contacts: { emails: [], phones: [], links: [] },
    };
  }

  const counts: Record<"email" | "phone" | "nik" | "nim" | "link" | "address", number> = {
    email: 0,
    phone: 0,
    nik: 0,
    nim: 0,
    link: 0,
    address: 0,
  };

  const contacts = {
    emails: [] as string[],
    phones: [] as string[],
    links: [] as string[],
  };

  let masked = text;

  // 1. Email (e.g. raka.pratama@example.com)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  masked = masked.replace(emailRegex, (match) => {
    counts.email++;
    contacts.emails.push(match);
    return "[EMAIL]";
  });

  // 2. URL / Links (e.g. https://linkedin.com/in/raka, www.github.com/raka, linkedin.com/in/raka)
  const linkRegex = /(?:https?:\/\/[^\s,]+|www\.[^\s,]+|(?:linkedin\.com|github\.com)\/[^\s,]+)/gi;
  masked = masked.replace(linkRegex, (match) => {
    // Strip trailing punctuation like period or comma if matched
    const cleaned = match.replace(/[.,;)]+$/, "");
    counts.link++;
    contacts.links.push(cleaned);
    const suffix = match.slice(cleaned.length);
    return "[LINK]" + suffix;
  });

  // 3. NIK (16 digit standalone number)
  // Lookbehind and lookahead to ensure exactly 16 digits
  const nikRegex = /(?<!\d)\d{16}(?!\d)/g;
  masked = masked.replace(nikRegex, () => {
    counts.nik++;
    return "[NIK]";
  });

  // 4. NIM / NPM berlabel (8-12 digits after NIM or NPM)
  const nimRegex = /(\b(?:NIM|NPM)\s*[:.]?\s*)(\d{8,12})(?!\d)/gi;
  masked = masked.replace(nimRegex, (_full, prefix) => {
    counts.nim++;
    return `${prefix}[NIM]`;
  });

  // 5. Telepon (Nomor seluler Indonesia: +62, 62, 08..., min 9 digits, max 15 digits)
  // Avoids matching standalone 4-digit years (2020), GPA (3.68), or year ranges (2020-2024)
  const phoneRegex = /(?<!\d)(?:(?:\+62|62|0)8[0-9\s-]{7,13}[0-9]|(?:\+62|62|0)[2-9][0-9\s-]{7,12}[0-9])(?!\d)/g;
  masked = masked.replace(phoneRegex, (match) => {
    // Count digits inside match
    const digitCount = match.replace(/\D/g, "").length;
    if (digitCount >= 9 && digitCount <= 14) {
      counts.phone++;
      contacts.phones.push(match.trim());
      return "[TELEPON]";
    }
    return match;
  });

  // 6. Alamat berlabel (sisa baris setelah Alamat: / Domisili:)
  const addressRegex = /(\b(?:Alamat|Domisili)\s*:\s*)([^\n\r]+)/gi;
  masked = masked.replace(addressRegex, (_full, prefix, addrText) => {
    if (addrText.trim().length > 0 && !addrText.includes("[ALAMAT]")) {
      counts.address++;
      return `${prefix}[ALAMAT]`;
    }
    return `${prefix}${addrText}`;
  });

  return {
    masked,
    counts,
    contacts,
  };
}
