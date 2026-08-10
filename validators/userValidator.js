import * as z from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(3).max(30),

  age: z.number().min(10).max(100).optional(),

  email: z.preprocess(
    (value) => (typeof value == "string" ? value.trim().toLowerCase() : ""),
    z.email("Email Must Be Valid"),
  ),

  password: z
    .string()
    .min(8, "password must be minimum 8 character")
    .max(30)
    .regex(/[a-z]/, "your password should have atleat one lower letter")
    .regex(/[A-Z]/, "your password should have atleat one upper letter")
    .regex(/[0-9]/, "your password should have atleat 1 Number")
    .regex(
      /[@#$%^&*!<>?":{}|~]/,
      "your password should have atleat one special character",
    ),
});

export const loginSchema = z.object({
  email: z.preprocess(
    (value) => (typeof value == "string" ? value.trim().toLowerCase() : ""),
    z.email(),
  ),

  pasword: z
    .string()
    .min(8)
    .max(30)
    .regex(/[a-z]/, "your password should have atleat one upper letter")
    .regex(/[A-Z]/, "your password should have atleat one lower letter")
    .regex(/[0-9]/, "your password should have atleat 1 Number")
    .regex(
      /[@#$%^&*!<>?":{}|~]/,
      "your password should have atleat one special character",
    ),
});
