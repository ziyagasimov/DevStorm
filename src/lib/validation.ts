import { z } from "zod";

/**
 * Shared Zod validation schemas for input sanitization across the app.
 * These schemas enforce length limits, format rules, and type safety
 * to prevent injection attacks and ensure data integrity.
 */

/** Message content validation — prevents empty/oversized messages */
export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: "Mesaj boş ola bilməz" })
    .max(2000, { message: "Mesaj 2000 simvoldan çox ola bilməz" }),
});

/** Login form validation */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Düzgün email daxil edin" })
    .max(255, { message: "Email 255 simvoldan çox ola bilməz" }),
  password: z
    .string()
    .min(6, { message: "Şifrə minimum 6 simvol olmalıdır" })
    .max(128, { message: "Şifrə 128 simvoldan çox ola bilməz" }),
});

/** Generic profile text field — reusable for names, descriptions, etc. */
export const profileFieldSchema = z
  .string()
  .trim()
  .max(500, { message: "Sahə 500 simvoldan çox ola bilməz" });

/** Name validation — required, trimmed, max 100 chars */
export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Bu sahə mütləqdir" })
  .max(100, { message: "Ad 100 simvoldan çox ola bilməz" });

/** URL validation — optional, must be valid URL if provided */
export const optionalUrlSchema = z
  .string()
  .trim()
  .url({ message: "Düzgün URL daxil edin" })
  .max(500)
  .or(z.literal(""))
  .optional();

/** Signup base schema — shared across all roles */
export const signupBaseSchema = z.object({
  email: loginSchema.shape.email,
  password: loginSchema.shape.password,
  role: z.enum(["user", "speaker", "mentor", "catering", "community"]),
});

/** User search query — sanitized for safe database queries */
export const searchQuerySchema = z
  .string()
  .trim()
  .max(100, { message: "Axtarış 100 simvoldan çox ola bilməz" })
  .transform((val) => val.replace(/[%_]/g, "")); // Strip SQL wildcards for safety

export type MessageInput = z.infer<typeof messageSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
