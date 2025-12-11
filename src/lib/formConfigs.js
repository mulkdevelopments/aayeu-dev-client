import { User, Lock, Phone, Calendar, FileText, Mail } from "lucide-react";

export const signUpFormConfig = {
  fields: [
    {
      name: "name",
      label: "Name",
      type: "text",
      placeholder: "Enter your name",
      icon: User,
      section: "account",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email",
      icon: Mail,
      section: "account",
    },
    {
      name: "phone",
      label: "Phone",
      type: "tel",
      placeholder: "Enter phone number",
      icon: Phone,
      section: "account",
    },
    {
      name: "age",
      label: "Age",
      type: "number",
      placeholder: "Enter age",
      icon: Calendar,
      section: "details",
    },
    {
      name: "gender",
      label: "Gender",
      type: "radio",
      section: "details",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
      ],
    },
    {
      name: "signupType",
      label: "Signup Type",
      type: "select",
      section: "details",
      options: [
        { label: "User", value: "user" },
        { label: "Doctor", value: "doctor" },
        { label: "Admin", value: "admin" },
      ],
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter password",
      icon: Lock,
      section: "security",
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "Confirm password",
      icon: Lock,
      section: "security",
    },
    {
      name: "resume",
      label: "Upload Resume",
      type: "file",
      icon: FileText,
      section: "files",
    },
    {
      name: "notifications",
      label: "Enable Notifications",
      type: "switch",
      section: "settings",
    },
  ],
  sections: [
    { id: "account", title: "Account Info", layout: "1" },
    { id: "details", title: "User Details", layout: "1" },
    { id: "security", title: "Security", layout: "1" },
    { id: "files", title: "Documents", layout: "1" },
    { id: "settings", title: "Preferences", layout: "1" },
  ],
};

export const loginFormConfig = {
  fields: [
    {
      name: "email",
      label: "Email address",
      type: "email",
      icon: Mail,
      placeholder: "you@example.com",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      icon: Lock,
      placeholder: "Enter your password",
      showPasswordToggle: true, // ✅ handled inside FormBuilder
    },
    {
      name: "loginFor",
      label: "Login For",
      type: "select",
      options: [
        { label: "Staff", value: "staff" },
        { label: "Student", value: "student" },
        // { label: "Admin", value: "admin" },
      ],
    },
  ],
  sections: [],
};

export const forgotPasswordFormConfig = {
  fields: [
    {
      name: "email",
      label: "Email address",
      type: "email",
      placeholder: "you@example.com",
      icon: Mail,
    },
  ],
  sections: [],
};

export const resetPasswordFormConfig = {
  fields: [
    {
      name: "password",
      label: "New Password",
      type: "password",
      placeholder: "Enter new password",
      icon: Lock,
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "Re-enter new password",
      icon: Lock,
    },
  ],
  sections: [],
};

export const editProfileFormConfig = {
  fields: [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter your full name",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter email address",
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "text",
      placeholder: "Enter phone number",
    },
  ],
  sections: [],
};

export const changePasswordFormConfig = {
  fields: [
    {
      name: "oldPassword",
      label: "Old Password",
      type: "password",
      placeholder: "Enter Old password",
    },
    {
      name: "newPassword",
      label: "New Password",
      type: "password",
      placeholder: "Enter new password",
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "Confirm new password",
    },
  ],
  sections: [],
};

const formConfigs = {
  // auth forms
  signUp: signUpFormConfig,
  login: loginFormConfig,
  forgotPassword: forgotPasswordFormConfig,
  resetPassword: resetPasswordFormConfig,
  editProfile: editProfileFormConfig,
  changePassword: changePasswordFormConfig,
};

export default formConfigs;
