import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().nonempty("Mobile number is required"),
});

const signinSchema = z.object({
  email: z.string().email("Invalid email"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const editProfileSchema = z.object({
  full_name: z.string().nullable().optional(),
  email: z.string().email("Invalid email"),
  phone: z.string().nullable().optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  dob: z.any().nullable().optional(), // ⭐ store as string
});

const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(6, "Old password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const contactSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(5, "Phone is required"),
  reason: z.string().min(1, "Please select a reason"),
  message: z.string().min(5, "Message is required"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree before submitting",
  }),
});

const formSchemas = {
  // auth
  signUp: signupSchema,
  signIn: signinSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  editProfile: editProfileSchema,
  changePassword: changePasswordSchema,

  // contact
  contact: contactSchema,
};

export default formSchemas;
