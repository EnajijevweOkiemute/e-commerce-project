import { PasswordResetEmail, PasswordResetToken, StoredUser, User } from "../types";
import { passwordRules } from "../component/auth/passwordRules";

const USERS_KEY = "users";
const TOKENS_KEY = "passwordResetTokens";
const EMAILS_KEY = "passwordResetEmails";

export function getStoredUsers(): StoredUser[] {
  return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

export function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function sanitizeUser(user: StoredUser): User {
  const { password, ...safeUser } = user;
  void password;
  return safeUser;
}

export function validatePasswordComplexity(password: string) {
  const trimmedPassword = password.trim();
  const failedRule = passwordRules.find((rule) => !rule.test(trimmedPassword));
  return failedRule ? failedRule.label : "";
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: User["role"];
}) {
  const users = getStoredUsers();
  const normalizedEmail = input.email.trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return { error: "An account with this email already exists." };
  }

  const passwordError = validatePasswordComplexity(input.password);
  if (passwordError) {
    return { error: passwordError };
  }

  const newUser: StoredUser = {
    id: String(Date.now()),
    name: input.name.trim(),
    email: normalizedEmail,
    password: input.password.trim(),
    role: input.role,
  };

  saveStoredUsers([...users, newUser]);

  return { user: newUser };
}

export function authenticateUser(email: string, password: string) {
  return getStoredUsers().find(
    (user) =>
      user.email.toLowerCase() === email.trim().toLowerCase() &&
      user.password === password,
  );
}

function getResetTokens(): PasswordResetToken[] {
  return JSON.parse(localStorage.getItem(TOKENS_KEY) || "[]");
}

function saveResetTokens(tokens: PasswordResetToken[]) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function getResetEmails(): PasswordResetEmail[] {
  return JSON.parse(localStorage.getItem(EMAILS_KEY) || "[]");
}

function saveResetEmails(emails: PasswordResetEmail[]) {
  localStorage.setItem(EMAILS_KEY, JSON.stringify(emails));
}

export function createPasswordResetRequest(email: string) {
  const user = getStoredUsers().find(
    (storedUser) => storedUser.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!user) {
    return { error: "No account was found for that email address." };
  }

  const token = `${user.id}-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();
  const resetLink = `${window.location.origin}/reset-password?token=${encodeURIComponent(token)}`;
  const resetToken: PasswordResetToken = {
    token,
    userId: user.id,
    email: user.email,
    createdAt,
    expiresAt,
  };
  const emailRecord: PasswordResetEmail = {
    id: `mail-${Date.now()}`,
    to: user.email,
    subject: "Reset your Kyklos password",
    resetLink,
    createdAt,
  };

  const activeTokens = getResetTokens().filter(
    (item) => item.userId !== user.id || item.usedAt,
  );

  saveResetTokens([resetToken, ...activeTokens]);
  saveResetEmails([emailRecord, ...getResetEmails()].slice(0, 10));

  return { user, resetLink, expiresAt };
}

export function getPasswordResetToken(token: string) {
  return getResetTokens().find((item) => item.token === token) || null;
}

export function resetPassword(token: string, password: string) {
  const passwordError = validatePasswordComplexity(password);
  if (passwordError) {
    return { error: passwordError };
  }

  const resetToken = getPasswordResetToken(token);
  if (!resetToken) {
    return { error: "This reset link is invalid." };
  }

  if (resetToken.usedAt) {
    return { error: "This reset link has already been used." };
  }

  if (new Date(resetToken.expiresAt).getTime() < Date.now()) {
    return { error: "This reset link has expired. Request a new one." };
  }

  const users = getStoredUsers();
  const userIndex = users.findIndex((user) => user.id === resetToken.userId);

  if (userIndex === -1) {
    return { error: "This reset link is no longer valid." };
  }

  const nextUsers = [...users];
  nextUsers[userIndex] = {
    ...nextUsers[userIndex],
    password: password.trim(),
  };
  saveStoredUsers(nextUsers);

  saveResetTokens(
    getResetTokens().map((item) =>
      item.token === token ? { ...item, usedAt: new Date().toISOString() } : item,
    ),
  );

  return { user: nextUsers[userIndex] };
}
