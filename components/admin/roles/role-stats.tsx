"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { Shield, TrendingUp, Users, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"

interface RoleStats {
  totalChanges: number
  roleDistribution: {
    ADMIN: number
    MANAGER: number
    USER: number
  }
  recentChanges: {
    date: string
    count: number
  }[]
  topChangers: {
    id: string
    name: string
    count: number
  }[]
  averageTimeInRole: number
}

interface RoleStatsProps {
  stats: RoleStats
}

export function RoleStats({ stats }: RoleStatsProps) {
  const totalUsers = Object.values(stats.roleDistribution).reduce((a, b) => a + b, 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Общая статистика */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Всего изменений ролей
          </CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalChanges}</div>
          <p className="text-xs text-muted-foreground">
            За все время
          </p>
        </CardContent>
      </Card>

      {/* Распределение ролей */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Распределение ролей
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="destructive">Админы</Badge>
              <span className="text-sm">
                {((stats.roleDistribution.ADMIN / totalUsers) * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={(stats.roleDistribution.ADMIN / totalUsers) * 100} className="h-2" />
            
            <div className="flex items-center justify-between">
              <Badge>Менеджеры</Badge>
              <span className="text-sm">
                {((stats.roleDistribution.MANAGER / totalUsers) * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={(stats.roleDistribution.MANAGER / totalUsers) * 100} className="h-2" />
            
            <div className="flex items-center justify-between">
              <Badge variant="secondary">Пользователи</Badge>
              <span className="text-sm">
                {((stats.roleDistribution.USER / totalUsers) * 100).toFixed(1)}%
              </span>
            </div>
            <Progress value={(stats.roleDistribution.USER / totalUsers) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* График изменений */}
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Динамика изменений
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.recentChanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="currentColor" className="fill-primary" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Топ администраторов */}
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Топ по изменениям ролей
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topChangers.map((changer) => (
              <div key={changer.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {changer.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {changer.count} изменений
                  </p>
                </div>
                <Progress value={(changer.count / stats.totalChanges) * 100} className="w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Среднее время в роли */}
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Среднее время в роли
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatDistanceToNow(new Date(Date.now() - stats.averageTimeInRole), {
              locale: ru,
              addSuffix: false
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            В среднем пользователи сохраняют роль
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 