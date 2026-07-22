import { tool } from "@langchain/core/tools";
import { z } from "zod";
import crypto from "crypto";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

export const cryptotool = tool(
  async ({
    action,
    text,
    algorithm,
    length,
    use_uppercase,
    use_lowercase,
    use_digits,
    use_symbols,
  }) => {
    try {
      switch (action) {
        case "hash": {
          if (!text) return "Error: text is required for hash action";
          const alg = algorithm || "sha256";
          const supported = ["md5", "sha1", "sha256", "sha384", "sha512"];
          if (!supported.includes(alg)) {
            return `Error: Unsupported algorithm. Use: ${supported.join(", ")}`;
          }
          const hash = crypto.createHash(alg).update(text).digest("hex");
          return `${alg}: ${hash}`;
        }

        case "generate_password": {
          const len = Math.min(Math.max(length || 16, 4), 128);
          let chars = "";
          if (use_uppercase !== false) chars += UPPERCASE;
          if (use_lowercase !== false) chars += LOWERCASE;
          if (use_digits !== false) chars += DIGITS;
          if (use_symbols !== false) chars += SYMBOLS;
          if (!chars) chars = UPPERCASE + LOWERCASE + DIGITS;

          const bytes = crypto.randomBytes(len);
          let password = "";
          for (let i = 0; i < len; i++) {
            password += chars[bytes[i] % chars.length];
          }

          const checks = [];
          if (use_uppercase !== false && !/[A-Z]/.test(password)) checks.push("uppercase");
          if (use_lowercase !== false && !/[a-z]/.test(password)) checks.push("lowercase");
          if (use_digits !== false && !/[0-9]/.test(password)) checks.push("digit");
          if (use_symbols !== false && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password))
            checks.push("symbol");

          if (checks.length > 0) {
            const bytes2 = crypto.randomBytes(len);
            password = "";
            for (let i = 0; i < len; i++) {
              password += chars[bytes2[i] % chars.length];
            }
          }

          return `Generated password (${len} chars): ${password}`;
        }

        case "uuid": {
          return crypto.randomUUID();
        }

        case "base64_encode": {
          if (!text) return "Error: text is required for base64_encode";
          return Buffer.from(text).toString("base64");
        }

        case "base64_decode": {
          if (!text) return "Error: text is required for base64_decode";
          return Buffer.from(text, "base64").toString("utf-8");
        }

        default:
          return `Unknown action: ${action}`;
      }
    } catch (err: any) {
      return `Crypto error: ${err.message}`;
    }
  },
  {
    name: "crypto_tool",
    description:
      "Generate passwords, compute hashes (MD5, SHA1, SHA256, SHA384, SHA512), generate UUIDs, and encode/decode Base64.",
    schema: z.object({
      action: z
        .enum(["hash", "generate_password", "uuid", "base64_encode", "base64_decode"])
        .describe("Operation to perform"),
      text: z
        .string()
        .optional()
        .describe("Input text for hash, base64_encode, or base64_decode actions"),
      algorithm: z
        .string()
        .optional()
        .describe("Hash algorithm: md5, sha1, sha256, sha384, sha512 (default: sha256)"),
      length: z.number().optional().describe("Password length (default: 16, max: 128)"),
      use_uppercase: z
        .boolean()
        .optional()
        .describe("Include uppercase letters in password (default: true)"),
      use_lowercase: z
        .boolean()
        .optional()
        .describe("Include lowercase letters in password (default: true)"),
      use_digits: z.boolean().optional().describe("Include digits in password (default: true)"),
      use_symbols: z.boolean().optional().describe("Include symbols in password (default: true)"),
    }),
  },
);
