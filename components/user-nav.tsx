"use client"

import { User as UserIcon, Settings, LogOut, ChevronRight } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import type { User } from "next-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useUserStore } from "@/lib/store/user-store"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface UserNavProps {
  user: Pick<User, "name" | "image" | "email">
}

export function UserNav({ user }: UserNavProps) {
  const userImage = useUserStore((state) => state.userImage)
  const router = useRouter()

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-9 w-9 rounded-full"
        >
          <div className="relative">
            <Avatar className="h-9 w-9 border-2 border-background transition-all hover:border-primary/20">
              <AvatarImage 
                src={userImage || user.image || ''} 
                alt={user.name || ''} 
                className="object-cover bg-background"
              />
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <AnimatePresence>
        <DropdownMenuContent 
          className="w-[280px] p-0 bg-background/80 backdrop-blur-sm border-border/50" 
          align="end"
          forceMount
          asChild
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ 
              transformOrigin: 'top right',
              position: 'relative',
              top: 8,
              right: -8
            }}
            className="absolute right-0"
          >
            {/* Верхняя секция с профилем */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="p-4 bg-gradient-to-b from-muted/50 to-background border-b border-border/50"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                  <AvatarImage 
                    src={userImage || user.image || ''} 
                    alt={user.name || ''} 
                    className="object-cover bg-background"
                  />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <div className="h-2 w-2 rounded-full bg-green-500 ring-2 ring-green-500/20" />
              </div>
            </motion.div>

            {/* Основное меню */}
            <div className="p-2">
              <DropdownMenuGroup className="space-y-0.5">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/profile" className="flex items-center py-2 px-3 rounded-md hover:bg-accent">
                      <div className="flex items-center flex-1 gap-3">
                        <div className="p-1 rounded-md bg-primary/10">
                          <UserIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">Профиль</span>
                          <span className="text-xs text-muted-foreground">
                            Управление профилем
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    </Link>
                  </DropdownMenuItem>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/settings" className="flex items-center py-2 px-3 rounded-md hover:bg-accent">
                      <div className="flex items-center flex-1 gap-3">
                        <div className="p-1 rounded-md bg-primary/10">
                          <Settings className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">Настройки</span>
                          <span className="text-xs text-muted-foreground">
                            Параметры аккаунта
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    </Link>
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuGroup>

              {/* Кнопка выхода */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-2 pt-2 border-t border-border/50"
              >
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="flex items-center py-2 px-3 rounded-md cursor-pointer text-red-600 hover:bg-red-500/10 hover:text-red-600"
                >
                  <div className="flex items-center flex-1 gap-3">
                    <div className="p-1 rounded-md bg-red-500/10">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Выйти</span>
                      <span className="text-xs text-muted-foreground">
                        Завершить сессию
                      </span>
                    </div>
                  </div>
                </DropdownMenuItem>
              </motion.div>
            </div>
          </motion.div>
        </DropdownMenuContent>
      </AnimatePresence>
    </DropdownMenu>
  )
} 