import { createContext, useContext, useState, ReactNode } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export type Role = "Admin" | "HR Manager" | "Recruiter" | "Viewer";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Inactive";
  password: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

// ── Permissions ──────────────────────────────────────────────────────────────

export type Permission =
  | "view:dashboard"
  | "view:jobs"
  | "view:applicants"
  | "view:reports"
  | "view:settings"
  | "edit:jobs"
  | "edit:applicants";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Admin: [
    "view:dashboard", "view:jobs", "view:applicants",
    "view:reports", "view:settings", "edit:jobs", "edit:applicants",
  ],
  "HR Manager": [
    "view:dashboard", "view:jobs", "view:applicants",
    "view:reports", "edit:jobs", "edit:applicants",
  ],
  Recruiter: [
    "view:dashboard", "view:jobs", "view:applicants",
    "edit:jobs", "edit:applicants",
  ],
  Viewer: [
    "view:dashboard", "view:jobs", "view:applicants",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// ── Seed users ───────────────────────────────────────────────────────────────

export const DEFAULT_USERS: UserProfile[] = [
  { id: "1", name: "Jane Doe",    email: "admin@codaflem.mw",  role: "Admin",      status: "Active",   password: "admin123", createdAt: "2025-01-10" },
  { id: "2", name: "John Banda",  email: "john@codaflem.mw",   role: "HR Manager", status: "Active",   password: "hr1234",   createdAt: "2025-02-14" },
  { id: "3", name: "Grace Phiri", email: "grace@codaflem.mw",  role: "Recruiter",  status: "Active",   password: "recruit1", createdAt: "2025-03-01" },
  { id: "4", name: "Peter Nkosi", email: "peter@codaflem.mw",  role: "Viewer",     status: "Inactive", password: "viewer1",  createdAt: "2025-03-20" },
];

// ── Context ──────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  can: (permission: Permission) => boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<UserProfile[]>(DEFAULT_USERS);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    await new Promise((r) => setTimeout(r, 700));

    const match = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!match) return { success: false, error: "Invalid email or password." };
    if (match.status === "Inactive")
      return { success: false, error: "Your account is inactive. Contact an administrator." };

    setUser({ id: match.id, name: match.name, email: match.email, role: match.role });
    return { success: true };
  };

  const logout = () => setUser(null);
  const can = (permission: Permission) => (user ? hasPermission(user.role, permission) : false);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, can, login, logout, users, setUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
