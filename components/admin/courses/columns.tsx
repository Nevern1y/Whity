"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/admin/data-table-column-header"
import { DataTableRowActions } from "@/components/admin/courses/data-table-row-actions"
import { Level } from "@prisma/client"

const LEVELS = {
  BEGINNER: {
    label: "Начинающий",
    variant: "default",
  },
  INTERMEDIATE: {
    label: "Средний",
    variant: "secondary",
  },
  ADVANCED: {
    label: "Продвинутый",
    variant: "destructive",
  },
} as const

export interface Course {
  id: string
  title: string
  description: string
  image: string | null
  published: boolean
  level: Level
  duration: string
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name: string | null
    email: string | null
  }
  lessonsCount: number
  studentsCount: number
  ratingsCount: number
}

export const columns: ColumnDef<Course>[] = [
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
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Название" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("title")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "level",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Уровень" />
    ),
    cell: ({ row }) => {
      const level = row.getValue("level") as Level
      const { label, variant } = LEVELS[level]

      return <Badge variant={variant}>{label}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "published",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Статус" />
    ),
    cell: ({ row }) => {
      const isPublished = row.getValue("published") as boolean

      return (
        <Badge variant={isPublished ? "default" : "secondary"}>
          {isPublished ? "Опубликован" : "Черновик"}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "lessonsCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Уроков" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          {row.getValue("lessonsCount")}
        </div>
      )
    },
  },
  {
    accessorKey: "studentsCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Студентов" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          {row.getValue("studentsCount")}
        </div>
      )
    },
  },
  {
    accessorKey: "ratingsCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Отзывов" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-[100px] items-center">
          {row.getValue("ratingsCount")}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
] 