"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/admin/data-table-view-options"
import { DataTableFacetedFilter } from "@/components/admin/data-table-faceted-filter"

type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"

const LEVELS = [
  {
    label: "Начинающий",
    value: "BEGINNER",
  },
  {
    label: "Средний",
    value: "INTERMEDIATE",
  },
  {
    label: "Продвинутый",
    value: "ADVANCED",
  },
]

const STATUSES = [
  {
    label: "Опубликован",
    value: "true",
  },
  {
    label: "Черновик",
    value: "false",
  },
]

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Поиск курсов..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("level") && (
          <DataTableFacetedFilter
            column={table.getColumn("level")}
            title="Уровень"
            options={LEVELS}
          />
        )}
        {table.getColumn("published") && (
          <DataTableFacetedFilter
            column={table.getColumn("published")}
            title="Статус"
            options={STATUSES}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Сбросить
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
} 