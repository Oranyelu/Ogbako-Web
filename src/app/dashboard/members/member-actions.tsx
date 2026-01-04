"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Pen, Trash, UserX } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Member } from "./columns" // Import type from columns

interface MemberActionsProps {
    member: Member
}

export function MemberActions({ member }: MemberActionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(member.id)}
                >
                    Copy Member ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Pen className="mr-2 h-4 w-4" />
                    Edit details
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <UserX className="mr-2 h-4 w-4" />
                    Suspend member
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete member
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
