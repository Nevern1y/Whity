"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/admin/data-table-column-header"
import { DataTableRowActions } from "@/components/admin/roles/data-table-row-actions"
import { UserAvatar } from "@/components/user-avatar"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"

export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  lastActive: string | null
}

const ROLES = {
  ADMIN: {
    label: "Администратор",
    variant: "destructive" as const,
  },
  MANAGER: {
    label: "Менеджер",
    variant: "default" as const,
  },
  USER: {
    label: "Пользователь",
    variant: "secondary" as const,
  },
}

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Выбрать все"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Выбрать строку"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Пользователь" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <UserAvatar
            user={{
              name: row.original.name,
              image: row.original.image,
            }}
            className="h-8 w-8 mr-2"
          />
          <div className="flex flex-col">
            <span className="font-medium">
              {row.original.name || "Без имени"}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.email}
            </span>
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Роль" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as keyof typeof ROLES
      const { label, variant } = ROLES[role] || ROLES.USER

      return <Badge variant={variant}>{label}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "lastActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Последняя активность" />
    ),
    cell: ({ row }) => {
      const lastActive = row.getValue("lastActive") as string | null

      if (!lastActive) return <span className="text-muted-foreground">Никогда</span>

      return (
        <span className="text-muted-foreground">
          {formatDistanceToNow(new Date(lastActive), {
            addSuffix: true,
            locale: ru,
          })}
        </span>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
] 