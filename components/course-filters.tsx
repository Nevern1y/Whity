"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface CourseFiltersProps {
  className?: string
}

export function CourseFilters({ className }: CourseFiltersProps) {
  return (
    <div className={cn("flex flex-col md:flex-row gap-2", className)}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Поиск курсов..." 
          className="pl-10"
        />
      </div>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Уровень сложности" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все уровни</SelectItem>
          <SelectItem value="BEGINNER">Начальный</SelectItem>
          <SelectItem value="INTERMEDIATE">Средний</SelectItem>
          <SelectItem value="ADVANCED">Продвинутый</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
} 