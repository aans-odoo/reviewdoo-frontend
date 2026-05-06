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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Plus, MoreVertical, Pencil, Trash2, RotateCw, UserCheck, UserX } from "lucide-react";
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

  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "member">("member");
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditName(user.name);
    setEditRole(user.role);
    setEditError("");
    setEditOpen(true);
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setEditing(true);
    setEditError("");
    try {
      // Only send role if it changed
      const updates: { role?: "admin" | "member" } = {};
      if (editRole !== editingUser.role) {
        updates.role = editRole;
      }
      
      if (Object.keys(updates).length > 0) {
        await api.put(`/users/${editingUser.id}`, updates);
      }
      
      setEditOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setEditError(axErr.response?.data?.error?.message ?? "Failed to update user");
    } finally {
      setEditing(false);
    }
  };

  const openDeleteDialog = (user: User) => {
    setDeletingUser(user);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    
    setDeleting(true);
    try {
      await api.delete(`/users/${deletingUser.id}`);
      setDeleteOpen(false);
      setDeletingUser(null);
      await fetchUsers();
      setError("");
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(axErr.response?.data?.error?.message ?? "Failed to delete user");
      setDeleteOpen(false);
      setDeletingUser(null);
    } finally {
      setDeleting(false);
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
      render: (row) => (
        <span className="capitalize">{row.role}</span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (row) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => {
        const isLastAdmin = row.role === "admin" && row.isActive && activeAdminCount <= 1;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditDialog(row)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              
              {!row.isActive && (
                <DropdownMenuItem 
                  onClick={() => handleReinvite(row.id)}
                  disabled={reinviting === row.id}
                >
                  <RotateCw className={`mr-2 h-4 w-4 ${reinviting === row.id ? "animate-spin" : ""}`} />
                  {reinviting === row.id ? "Sending..." : "Reinvite"}
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem 
                onClick={() => handleStatusToggle(row)}
                disabled={isLastAdmin && row.isActive}
              >
                {row.isActive ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => openDeleteDialog(row)}
                disabled={isLastAdmin}
                className="text-theme-danger focus:text-theme-danger"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
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

      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) { setEditError(""); setEditingUser(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and role.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 p-5">
            {editError && (
              <div className="rounded-sm bg-theme-danger/10 border border-theme-danger/25 px-3 py-2 text-sm text-theme-danger">{editError}</div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={editEmail} disabled className="opacity-60" />
              <p className="text-xs text-theme-text-muted">Email cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} disabled className="opacity-60" />
              <p className="text-xs text-theme-text-muted">Name cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as "admin" | "member")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={editing}>{editing ? "Updating..." : "Update User"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete User"
        description={`Are you sure you want to delete ${deletingUser?.name} (${deletingUser?.email})? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </div>
  );
}
