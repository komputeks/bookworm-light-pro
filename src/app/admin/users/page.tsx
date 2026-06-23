"use client";
import { useState, useEffect } from "react";
import { getBrowserClient } from "@lib/supabase";
import type { Profile } from "@types";

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => {
    const supabase = getBrowserClient();
    const { data } = await supabase.from("bookworm_profiles").select("*").order("created_at", { ascending: false });
    setUsers((data as Profile[]) ?? []);
    setLoading(false);
  };

  const toggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "author" : "admin";
    const supabase = getBrowserClient();
    await supabase.from("bookworm_profiles").update({ role: newRole }).eq("id", id);
    fetchUsers();
  };

  if (loading) return <div className="skeleton h-96 w-full" />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-dark dark:text-white">Users ({users.length})</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-theme-light dark:bg-gray-800"><tr><th className="p-3 text-left">Username</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Role</th><th className="p-3 text-left">Sheet</th><th className="p-3 text-left">Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border dark:border-gray-700">
                <td className="p-3 font-semibold text-text-dark dark:text-white">{u.username}</td>
                <td className="p-3 text-text">{u.email}</td>
                <td className="p-3"><span className="badge badge-primary">{u.role}</span></td>
                <td className="p-3 text-text">{u.sheet_initialized ? "✅" : "❌"}</td>
                <td className="p-3"><button onClick={() => toggleRole(u.id, u.role)} className="text-primary hover:underline">Toggle Admin</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
