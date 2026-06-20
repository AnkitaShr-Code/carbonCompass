import { describe, it, expect } from "vitest";
import { sanitizeString, sanitizeNumber, validateActivityInput } from "../lib/sanitize";

describe("CarbonCompass Data Layer — sanitize Tests", () => {
  describe("sanitizeString", () => {
    it("should strip tags from '<script>alert(\"xss\")</script>'", () => {
      const clean = sanitizeString('<script>alert("xss")</script>', 100);
      expect(clean).toBe('alert("xss")');
    });

    it("should trim and truncate '  hello world  ' to 'hello'", () => {
      const clean = sanitizeString("  hello world  ", 5);
      expect(clean).toBe("hello");
    });

    it("should leave 'normal text' unchanged with large limit", () => {
      const clean = sanitizeString("normal text", 100);
      expect(clean).toBe("normal text");
    });

    it("should keep empty string as empty", () => {
      const clean = sanitizeString("", 50);
      expect(clean).toBe("");
    });
  });

  describe("sanitizeNumber", () => {
    it("should parse '5' and return 5", () => {
      expect(sanitizeNumber("5", 0, 100)).toBe(5);
    });

    it("should clamp '150' to max 100", () => {
      expect(sanitizeNumber("150", 0, 100)).toBe(100);
    });

    it("should clamp '-5' to min 0", () => {
      expect(sanitizeNumber("-5", 0, 100)).toBe(0);
    });

    it("should return null for 'abc'", () => {
      expect(sanitizeNumber("abc", 0, 100)).toBeNull();
    });

    it("should return null for undefined", () => {
      expect(sanitizeNumber(undefined, 0, 100)).toBeNull();
    });
  });

  describe("validateActivityInput", () => {
    it("should validate valid complete input", () => {
      const input = {
        timestamp: "2026-06-20T12:00:00Z",
        category: "transport",
        subtype: "car_petrol",
        quantity: 10,
      };

      const result = validateActivityInput(input);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.sanitized).toBeDefined();
      expect(result.sanitized?.co2e).toBe(2.1);
    });

    it("should report error for missing category", () => {
      const input = {
        timestamp: "2026-06-20T12:00:00Z",
        subtype: "car_petrol",
        quantity: 10,
      };

      const result = validateActivityInput(input);
      expect(result.valid).toBe(false);
      const errorsStr = result.errors.join(" ");
      expect(errorsStr).toContain("category is required");
    });

    it("should report error for quantity = 0", () => {
      const input = {
        timestamp: "2026-06-20T12:00:00Z",
        category: "transport",
        subtype: "car_petrol",
        quantity: 0,
      };

      const result = validateActivityInput(input);
      expect(result.valid).toBe(false);
      const errorsStr = result.errors.join(" ");
      expect(errorsStr).toContain("quantity must be greater than 0");
    });

    it("should report error for subtype not in EMISSION_FACTORS for its category", () => {
      const input = {
        timestamp: "2026-06-20T12:00:00Z",
        category: "transport",
        subtype: "helicopter",
        quantity: 10,
      };

      const result = validateActivityInput(input);
      expect(result.valid).toBe(false);
      const errorsStr = result.errors.join(" ");
      expect(errorsStr).toContain("invalid subtype");
    });

    it("should return multiple errors for completely empty object", () => {
      const result = validateActivityInput({});
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
