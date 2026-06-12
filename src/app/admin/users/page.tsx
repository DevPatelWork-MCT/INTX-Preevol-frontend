"use client"

import * as React from "react"
import { ProtectedLayout } from "@/components/protected-layout"
import { useAdminApi } from "@/hooks/useAdminApi"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { IconCheck, IconX } from "@tabler/icons-react"

export default function AdminUsersPage() {
  const { listUsers, approveUser, rejectUser, loading } = useAdminApi()
  const [users, setUsers] = React.useState<any[]>([])

  const fetchUsers = React.useCallback(async () => {
    try { const res = await listUsers(); setUsers(res?.data || []) } catch {}
  }, [listUsers])
  React.useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleApprove = async (id: string) => { try { await approveUser(id, { roleId: null, grantAdmin: false }); fetchUsers() } catch {} }
  const handleReject = async (id: string) => { if (!confirm("Reject this user?")) return; try { await rejectUser(id); fetchUsers() } catch {} }

  return (
    <ProtectedLayout>
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Company</TableHead><TableHead>Status</TableHead><TableHead>Role</TableHead><TableHead>Admin</TableHead><TableHead className="w-[200px]">Actions</TableHead></TableRow></TableHeader>
        <TableBody>{users.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No users found</TableCell></TableRow> : users.map((u) => (
          <TableRow key={u.id}>
            <TableCell>{u.firstName} {u.lastName || ""}</TableCell>
            <TableCell>{u.email}</TableCell>
            <TableCell>{u.company || "-"}</TableCell>
            <TableCell>
              <Badge variant={u.accountStatus === "approved" ? "default" : u.accountStatus === "pending" ? "secondary" : "destructive"}>
                {u.accountStatus}
              </Badge>
            </TableCell>
            <TableCell>{u.role?.roleName || "-"}</TableCell>
            <TableCell>{u.isAdmin ? "Yes" : "No"}</TableCell>
            <TableCell>
              {u.accountStatus === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(u.id)}><IconCheck className="h-4 w-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(u.id)}><IconX className="h-4 w-4" /></Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}</TableBody>
      </Table>
    </div>
    </ProtectedLayout>
  )
}
