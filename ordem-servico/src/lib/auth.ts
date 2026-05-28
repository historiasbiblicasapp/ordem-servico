import { User } from "@/types";
import { db } from "./db";

const SESSION_KEY = "os:session";

export function login(email: string, senha: string): User | null {
  const users = db.list<User>("users");
  const user = users.find((u) => u.email === email && u.senha === btoa(senha));
  if (!user) return null;
  const { senha: _, ...safe } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, loginAt: Date.now() }));
  return user;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): { userId: string } | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getCurrentUser(): User | null {
  const session = getSession();
  if (!session) return null;
  return db.get<User>("users", session.userId) || null;
}
