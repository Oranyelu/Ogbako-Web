"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MemberActions } from "./member-actions"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Member = {
    id: string
    name: string
    email: string
    role: "OWNER" | "ADMIN" | "MEMBER"
    status: "ACTIVE" | "PENDING" | "SUSPENDED"
    lastActive: string
}

export const columns: ColumnDef<Member>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string;
            return <Badge variant="outline">{role}</Badge>
        }
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const color = status === 'ACTIVE' ? 'default' : status === 'PENDING' ? 'secondary' : 'destructive';

            return <Badge variant={color}>{status}</Badge>
        }
    },
    {
        accessorKey: "lastActive",
        header: "Last Active",
    },
    {
        id: "actions",
        cell: ({ row }) => <MemberActions member={row.original} />,
    },
]
