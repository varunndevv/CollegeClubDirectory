import { z } from "zod";

export const validateRequest = (schema) => (req, res, next) => {
  try {
    const parsedData = schema.parse(req.body);
    req.body = parsedData; // Replace body with strictly sanitized data
    next();
  } catch (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.errors?.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }
};

// ========================
// Auth Schemas
// ========================
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long").trim(),
  email: z.string().email("Invalid email").refine(val => val.endsWith("@bmsce.ac.in"), {
    message: "Email must be from @bmsce.ac.in domain",
  }).trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters").regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.*[0-9]).{6,}$/, "Password must contain at least one uppercase letter, one special character, and one number."),
  usn: z.string().min(1, "USN is required").trim().toUpperCase(),
  yearOfStudy: z.enum(['1', '2', '3', '4', '5', '1st', '2nd', '3rd', '4th', 'Alumni', 'Faculty'], { errorMap: () => ({ message: "Invalid year of study" }) }),
  phoneNumber: z.string().regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number"),
  otp: z.string().optional(),
}).strict();

export const loginSchema = z.object({
  email: z.string().email("Invalid email").refine(val => val.endsWith("@bmsce.ac.in"), {
    message: "Email must be from @bmsce.ac.in domain",
  }).trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
  otp: z.string().optional(),
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email").refine(val => val.endsWith("@bmsce.ac.in"), {
    message: "Email must be from @bmsce.ac.in domain",
  }).trim().toLowerCase(),
}).strict();

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email").refine(val => val.endsWith("@bmsce.ac.in"), {
    message: "Email must be from @bmsce.ac.in domain",
  }).trim().toLowerCase(),
  otp: z.string().min(1, "OTP is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters").regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.*[0-9]).{6,}$/, "Password must contain at least one uppercase letter, one special character, and one number."),
}).strict();
