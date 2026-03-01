import { useState } from "react";
import { Mail, Bell, Eye, EyeOff, Users, Plus, Pencil, Trash2, Shield, UserCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth, UserProfile, Role } from "@/contexts/AuthContext";

// ── Constants ────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<Role, string> = {
  Admin:        "bg-destructive/10 text-destructive border-destructive/20",
  "HR Manager": "bg-primary/10 text-primary border-primary/20",
  Recruiter:    "bg-accent/10 text-accent border-accent/20",
  Viewer:       "bg-muted text-muted-foreground border-border",
};

const EMPTY_FORM = {
  name: "", email: "", role: "Recruiter" as Role,
  status: "Active" as "Active" | "Inactive", password: "",
};

// ── Component ────────────────────────────────────────────────────────────────

export default function Settings() {
  const { toast } = useToast();
  const { users, setUsers, user: currentUser } = useAuth();

  // ── Notification state ──────────────────────────────────────────────────
  const [settings, setSettings] = useState({
    applicantEmails: true, hrNotifications: true,
    statusChangeEmails: false, weeklyDigest: true,
  });
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; setting: keyof typeof settings; newValue: boolean;
  } | null>(null);

  const handleToggle = (setting: keyof typeof settings, value: boolean) => {
    if (setting === "applicantEmails" || setting === "hrNotifications") {
      setConfirmDialog({ open: true, setting, newValue: value });
    } else {
      updateSetting(setting, value);
    }
  };

  const updateSetting = (setting: keyof typeof settings, value: boolean) => {
    setSettings({ ...settings, [setting]: value });
    toast({ title: "Settings Updated", description: "Your notification preferences have been saved." });
  };

  const confirmChange = () => {
    if (confirmDialog) { updateSetting(confirmDialog.setting, confirmDialog.newValue); setConfirmDialog(null); }
  };

  // ── User profiles state ─────────────────────────────────────────────────
  const [userDialog, setUserDialog] = useState<{ open: boolean; mode: "add" | "edit"; user?: UserProfile } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<typeof EMPTY_FORM>>({});
  const [showPassword, setShowPassword] = useState(false);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setShowPassword(false);
    setUserDialog({ open: true, mode: "add" });
  };

  const openEdit = (u: UserProfile) => {
    setForm({ name: u.name, email: u.email, role: u.role, status: u.status, password: u.password });
    setFormErrors({});
    setShowPassword(false);
    setUserDialog({ open: true, mode: "edit", user: u });
  };

  const validateForm = () => {
    const errors: Partial<typeof EMPTY_FORM> = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Enter a valid email.";
    if (!form.password.trim()) errors.password = "Password is required.";
    else if (form.password.length < 6) errors.password = "Password must be at least 6 characters.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = () => {
    if (!validateForm()) return;

    if (userDialog?.mode === "add") {
      // Check duplicate email
      if (users.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) {
        setFormErrors((e) => ({ ...e, email: "This email is already in use." }));
        return;
      }
      const newUser: UserProfile = {
        id: Date.now().toString(),
        name: form.name.trim(), email: form.email.trim(),
        role: form.role, status: form.status,
        password: form.password.trim(),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setUsers((prev) => [...prev, newUser]);
      toast({ title: "User Added", description: `${newUser.name} has been added successfully.` });
    } else if (userDialog?.user) {
      // Check duplicate email excluding self
      if (users.some((u) => u.email.toLowerCase() === form.email.toLowerCase() && u.id !== userDialog.user!.id)) {
        setFormErrors((e) => ({ ...e, email: "This email is already in use." }));
        return;
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userDialog.user!.id
            ? { ...u, name: form.name.trim(), email: form.email.trim(), role: form.role, status: form.status, password: form.password.trim() }
            : u
        )
      );
      toast({ title: "User Updated", description: `${form.name} has been updated.` });
    }
    setUserDialog(null);
  };

  const handleDeleteUser = () => {
    if (!deleteTarget) return;
    if (deleteTarget.id === currentUser?.id) {
      toast({ title: "Not allowed", description: "You cannot delete your own account.", variant: "destructive" });
      setDeleteTarget(null);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    toast({ title: "User Removed", description: `${deleteTarget.name} has been removed.`, variant: "destructive" });
    setDeleteTarget(null);
  };

  // ── Email templates ─────────────────────────────────────────────────────
  const emailTemplates = [
    { name: "Application Received", description: "Sent to applicants when their application is submitted", preview: `Dear {{applicant_name}},\n\nThank you for applying to {{job_title}} at Mini ATS. We have received your application and will review it shortly.\n\nBest regards,\nThe HR Team` },
    { name: "Interview Invitation", description: "Sent when an applicant is invited for an interview", preview: `Dear {{applicant_name}},\n\nCongratulations! We would like to invite you for an interview for the {{job_title}} position.\n\nPlease reply to schedule a convenient time.\n\nBest regards,\nThe HR Team` },
    { name: "Application Status Update", description: "Sent when an applicant's status changes", preview: `Dear {{applicant_name}},\n\nWe wanted to update you on the status of your application for {{job_title}}.\n\nYour current status: {{status}}\n\nBest regards,\nThe HR Team` },
  ];

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure notifications, email templates, and user profiles</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="users">User Profiles</TabsTrigger>
        </TabsList>

        {/* ── Notifications (unchanged) ── */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-primary" />Email Notifications</CardTitle>
              <CardDescription>Configure which email notifications are sent to applicants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="applicantEmails" className="font-medium">Enable Applicant Emails</Label>
                  <p className="text-sm text-muted-foreground">Send automated emails to applicants about their application status</p>
                </div>
                <Switch id="applicantEmails" checked={settings.applicantEmails} onCheckedChange={(v) => handleToggle("applicantEmails", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="statusChangeEmails" className="font-medium">Status Change Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify applicants when their status is updated</p>
                </div>
                <Switch id="statusChangeEmails" checked={settings.statusChangeEmails} onCheckedChange={(v) => handleToggle("statusChangeEmails", v)} />
              </div>
            </CardContent>
          </Card>
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-accent" />HR Notifications</CardTitle>
              <CardDescription>Configure notifications for HR team members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="hrNotifications" className="font-medium">Enable HR Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications about new applications and status changes</p>
                </div>
                <Switch id="hrNotifications" checked={settings.hrNotifications} onCheckedChange={(v) => handleToggle("hrNotifications", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weeklyDigest" className="font-medium">Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary of recruitment activity</p>
                </div>
                <Switch id="weeklyDigest" checked={settings.weeklyDigest} onCheckedChange={(v) => handleToggle("weeklyDigest", v)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Email Templates (unchanged) ── */}
        <TabsContent value="templates" className="space-y-6">
          {emailTemplates.map((template, index) => (
            <Card key={index} className="animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-2" />Preview</Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground whitespace-pre-wrap font-mono">{template.preview}</pre>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── User Profiles ── */}
        <TabsContent value="users" className="space-y-6">
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />User Profiles</CardTitle>
                  <CardDescription>Manage who has access to the system and their roles</CardDescription>
                </div>
                <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add User</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <UserCircle className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">No users yet. Add one to get started.</p>
                </div>
              )}
              {users.map((u) => (
                <div key={u.id} className={`flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors ${u.id === currentUser?.id ? "ring-1 ring-primary/30" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight">
                        {u.name}
                        {u.id === currentUser?.id && <span className="ml-1.5 text-xs text-muted-foreground font-normal">(you)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`text-xs hidden sm:inline-flex ${ROLE_COLORS[u.role]}`}>
                      {u.role === "Admin" && <Shield className="h-3 w-3 mr-1" />}
                      {u.role}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${u.status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}`}>
                      {u.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(u)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(u)}
                        disabled={u.id === currentUser?.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Role legend */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />Role Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { role: "Admin",      desc: "Full access to all features and settings" },
                  { role: "HR Manager", desc: "Manage jobs, applicants, and reports" },
                  { role: "Recruiter",  desc: "View and update applicant statuses" },
                  { role: "Viewer",     desc: "Read-only access to jobs and applicants" },
                ].map(({ role, desc }) => (
                  <div key={role} className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/30 border border-border">
                    <Badge variant="outline" className={`text-xs mt-0.5 flex-shrink-0 ${ROLE_COLORS[role as Role]}`}>{role}</Badge>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Notification confirm dialog ── */}
      <Dialog open={confirmDialog?.open ?? false} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to {confirmDialog?.newValue ? "enable" : "disable"} this setting? This will affect how notifications are sent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button onClick={confirmChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit user dialog ── */}
      <Dialog open={userDialog?.open ?? false} onOpenChange={(open) => !open && setUserDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{userDialog?.mode === "add" ? "Add User" : "Edit User"}</DialogTitle>
            <DialogDescription>
              {userDialog?.mode === "add" ? "Create a new user profile and assign a role." : "Update the user's details, role, or password."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="u-name">Full Name</Label>
              <Input id="u-name" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-email">Email Address</Label>
              <Input id="u-email" type="email" placeholder="user@codaflem.mw" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-password">Password</Label>
              <div className="relative">
                <Input id="u-password" type={showPassword ? "text" : "password"} placeholder="Min. 6 characters"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pr-10" />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && <p className="text-xs text-destructive">{formErrors.password}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-role">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger id="u-role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="HR Manager">HR Manager</SelectItem>
                  <SelectItem value="Recruiter">Recruiter</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as "Active" | "Inactive" })}>
                <SelectTrigger id="u-status"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDialog(null)}>Cancel</Button>
            <Button onClick={handleSaveUser}>{userDialog?.mode === "add" ? "Add User" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <span className="font-medium text-foreground">{deleteTarget?.name}</span>? They will no longer be able to log in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteUser}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
