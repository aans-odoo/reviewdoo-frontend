import { useState, useEffect, useMemo, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Plus, RotateCw } from "lucide-react";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
  isActive: boolean;
  createdAt: string;
}

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "member">("member");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const [reinviting, setReinviting] = useState<string | null>(null);

  const activeAdminCount = useMemo(
    () => users.filter((u) => u.role === "admin" && u.isActive).length,
    [users]
  );

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data.users ?? res.data);
      setError("");
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      await api.post("/users", { email: newEmail, name: newName, role: newRole });
      setCreateOpen(false);
      setNewEmail("");
      setNewName("");
      setNewRole("member");
      await fetchUsers();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setCreateError(axErr.response?.data?.error?.message ?? "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId: string, role: "admin" | "member") => {
    try {
      await api.put(`/users/${userId}`, { role });
      await fetchUsers();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Failed to update role");
    }
  };

  const handleStatusToggle = async (user: User) => {
    try {
      await api.put(`/users/${user.id}`, { isActive: !user.isActive });
      await fetchUsers();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Failed to update status");
    }
  };

  const handleReinvite = async (userId: string) => {
    setReinviting(userId);
    try {
      await api.post(`/users/${userId}/reinvite`);
      setError("");
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Failed to resend invitation");
    } finally {
      setReinviting(null);
    }
  };

  const columns: Column<User & Record<string, unknown>>[] = [
    { key: "email", header: "Email", sortable: true },
    { key: "name", header: "Name", sortable: true },
    {
      key: "role",
      header: "Role",
      render: (row) => {
        const isLastAdmin = row.role === "admin" && row.isActive && activeAdminCount <= 1;
        return (
          <Select
            value={row.role}
            onValueChange={(v) => handleRoleChange(row.id, v as "admin" | "member")}
            disabled={isLastAdmin}
          >
            <SelectTrigger className="w-28" title={isLastAdmin ? "Cannot change role — this is the only admin" : undefined}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      key: "isActive",
      header: "Status",
      render: (row) => {
        const isLastAdmin = row.role === "admin" && row.isActive && activeAdminCount <= 1;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStatusToggle(row)}
            disabled={isLastAdmin && row.isActive}
            title={isLastAdmin && row.isActive ? "Cannot deactivate the only admin" : undefined}
            className="h-auto px-1 py-0"
          >
            <StatusBadge status={row.isActive ? "active" : "inactive"} />
          </Button>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleReinvite(row.id)}
          disabled={reinviting === row.id}
          aria-label={`Reinvite ${row.email}`}
        >
          <RotateCw className={`mr-1 h-4 w-4 ${reinviting === row.id ? "animate-spin" : ""}`} />
          {reinviting === row.id ? "Sending..." : "Reinvite"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-theme-text">User Management</h2>
          <p className="mt-1 text-sm text-theme-text-muted">Manage user accounts, roles, and invitations.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Invite User
        </Button>
      </div>

      {error && (
        <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">{error}</div>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-theme-text-muted">Loading...</div>
      ) : (
        <DataTable
          columns={columns}
          data={users as (User & Record<string, unknown>)[]}
          keyExtractor={(row) => row.id}
          emptyMessage="No users found"
        />
      )}

      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setCreateError(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>Send an invitation email to a new user. They will set their password on first login.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 p-5">
            {createError && (
              <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">{createError}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" type="email" placeholder="user@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-name">Name</Label>
              <Input id="user-name" placeholder="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as "admin" | "member")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating}>{creating ? "Sending..." : "Send Invite"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
