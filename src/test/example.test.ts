import { describe, it, expect } from "vitest";
import { messageSchema, loginSchema, searchQuerySchema, nameSchema } from "@/lib/validation";

describe("Validation Schemas", () => {
  describe("messageSchema", () => {
    it("should accept valid messages", () => {
      const result = messageSchema.safeParse({ content: "Salam, necəsən?" });
      expect(result.success).toBe(true);
    });

    it("should reject empty messages", () => {
      const result = messageSchema.safeParse({ content: "" });
      expect(result.success).toBe(false);
    });

    it("should reject whitespace-only messages", () => {
      const result = messageSchema.safeParse({ content: "   " });
      expect(result.success).toBe(false);
    });

    it("should reject messages over 2000 characters", () => {
      const result = messageSchema.safeParse({ content: "a".repeat(2001) });
      expect(result.success).toBe(false);
    });

    it("should trim whitespace from valid messages", () => {
      const result = messageSchema.safeParse({ content: "  Salam  " });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.content).toBe("Salam");
      }
    });
  });

  describe("loginSchema", () => {
    it("should accept valid email and password", () => {
      const result = loginSchema.safeParse({ email: "test@example.com", password: "123456" });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = loginSchema.safeParse({ email: "not-an-email", password: "123456" });
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const result = loginSchema.safeParse({ email: "test@example.com", password: "12345" });
      expect(result.success).toBe(false);
    });

    it("should reject password over 128 characters", () => {
      const result = loginSchema.safeParse({ email: "test@example.com", password: "a".repeat(129) });
      expect(result.success).toBe(false);
    });
  });

  describe("searchQuerySchema", () => {
    it("should accept normal search queries", () => {
      const result = searchQuerySchema.safeParse("Əli");
      expect(result.success).toBe(true);
    });

    it("should strip SQL wildcards for safety", () => {
      const result = searchQuerySchema.safeParse("test%_injection");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("testinjection");
      }
    });

    it("should reject queries over 100 characters", () => {
      const result = searchQuerySchema.safeParse("a".repeat(101));
      expect(result.success).toBe(false);
    });
  });

  describe("nameSchema", () => {
    it("should accept valid names", () => {
      const result = nameSchema.safeParse("Əli");
      expect(result.success).toBe(true);
    });

    it("should reject empty names", () => {
      const result = nameSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("should reject names over 100 characters", () => {
      const result = nameSchema.safeParse("a".repeat(101));
      expect(result.success).toBe(false);
    });
  });
});
