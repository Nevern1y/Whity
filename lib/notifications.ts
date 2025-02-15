import { toast } from "sonner"
import { Prisma } from "@prisma/client"

// Типы уведомлений
export type NotificationType = 
  | 'success'
  | 'error'
  | 'warning'
  | 'info'

// Типы действий
export type NotificationAction = {
  label: string
  onClick: () => void
}

// Базовые опции уведомлений
export interface NotificationOptions {
  description?: string
  duration?: number
  action?: NotificationAction
}

// Типы ошибок базы данных
export type DatabaseErrorCode = 
  | 'P2002' // Unique constraint violation
  | 'P2003' // Foreign key constraint violation
  | 'P2025' // Record not found
  | 'ECONNREFUSED'
  | 'ER_DUP_ENTRY'

// Категории уведомлений
export const notifications = {
  // Базовые уведомления
  success: (title: string, options?: NotificationOptions) => {
    toast.success(title, {
      duration: options?.duration || 3000,
      description: options?.description,
      action: options?.action && {
        label: options.action.label,
        onClick: options.action.onClick,
      },
      className: "bg-background border-border",
    })
  },

  error: (title: string, options?: NotificationOptions) => {
    toast.error(title, {
      duration: options?.duration || 5000,
      description: options?.description,
      action: options?.action && {
        label: options.action.label,
        onClick: options.action.onClick,
      },
      className: "bg-background border-border",
    })
  },

  warning: (title: string, options?: NotificationOptions) => {
    toast.warning(title, {
      duration: options?.duration || 4000,
      description: options?.description,
      action: options?.action && {
        label: options.action.label,
        onClick: options.action.onClick,
      },
      className: "bg-background border-border",
    })
  },

  info: (title: string, options?: NotificationOptions) => {
    toast.info(title, {
      duration: options?.duration || 3000,
      description: options?.description,
      action: options?.action && {
        label: options.action.label,
        onClick: options.action.onClick,
      },
      className: "bg-background border-border",
    })
  },

  // Аутентификация
  auth: {
    invalidCredentials: () => {
      toast.error("Неверные учетные данные", {
        description: "Пожалуйста, проверьте email и пароль",
        duration: 5000,
      })
    },

    emailExists: () => {
      toast.error("Email уже используется", {
        description: "Пожалуйста, используйте другой email или войдите в существующий аккаунт",
        duration: 5000,
      })
    },

    passwordChanged: () => {
      toast.success("Пароль успешно изменен", {
        description: "Вы можете использовать новый пароль при следующем входе",
        duration: 3000,
      })
    },

    sessionExpired: () => {
      toast.warning("Сессия истекла", {
        description: "Пожалуйста, войдите снова",
        duration: 4000,
      })
    },

    twoFactorEnabled: () => {
      toast.success("Двухфакторная аутентификация включена", {
        description: "Ваш аккаунт теперь лучше защищен",
        duration: 3000,
      })
    },

    twoFactorDisabled: () => {
      toast.warning("Двухфакторная аутентификация отключена", {
        description: "Рекомендуем включить её для большей безопасности",
        duration: 4000,
      })
    }
  },

  // Профиль
  profile: {
    updated: () => {
      toast.success("Профиль обновлен", {
        description: "Изменения успешно сохранены",
        duration: 3000,
      })
    },

    error: () => {
      toast.error("Ошибка обновления", {
        description: "Не удалось сохранить изменения. Попробуйте позже",
        duration: 5000,
      })
    },

    imageUploaded: () => {
      toast.success("Фото профиля обновлено", {
        duration: 3000,
      })
    },

    imageError: () => {
      toast.error("Ошибка загрузки фото", {
        description: "Проверьте формат и размер файла",
        duration: 5000,
      })
    }
  },

  // Курсы
  courses: {
    enrolled: (title: string) => {
      toast.success("Вы записались на курс", {
        description: `Курс "${title}" добавлен в ваш список обучения`,
        duration: 3000,
      })
    },

    completed: (title: string) => {
      toast.success("Курс пройден!", {
        description: `Поздравляем с завершением курса "${title}"`,
        duration: 4000,
      })
    },

    lessonCompleted: () => {
      toast.success("Урок пройден", {
        description: "Продолжайте обучение",
        duration: 2000,
      })
    },

    progressSaved: () => {
      toast.success("Прогресс сохранен", {
        duration: 2000,
      })
    }
  },

  // Друзья
  friends: {
    requestSent: (name: string) => {
      toast.success("Запрос отправлен", {
        description: `Запрос в друзья отправлен пользователю ${name}`,
        duration: 3000,
      })
    },

    requestAccepted: (name: string) => {
      toast.success("Запрос принят", {
        description: `${name} теперь в списке ваших друзей`,
        duration: 3000,
      })
    },

    requestRejected: () => {
      toast.info("Запрос отклонен", {
        duration: 3000,
      })
    },

    removed: (name: string) => {
      toast.info(`${name} удален из друзей`, {
        duration: 3000,
      })
    }
  },

  // Сообщения
  messages: {
    sent: () => {
      toast.success("Сообщение отправлено", {
        duration: 2000,
      })
    },

    error: () => {
      toast.error("Ошибка отправки", {
        description: "Не удалось отправить сообщение",
        duration: 4000,
      })
    },

    newMessage: (from: string) => {
      toast.info("Новое сообщение", {
        description: `Получено новое сообщение от ${from}`,
        duration: 4000,
        action: {
          label: "Открыть",
          onClick: () => window.location.href = `/messages?userId=${from}`
        }
      })
    }
  },

  // Достижения
  achievements: {
    unlocked: (title: string, description: string) => {
      toast.success("Новое достижение!", {
        description: `${title} - ${description}`,
        duration: 5000,
      })
    }
  },

  // Обработка ошибок базы данных
  handleDatabaseError: (error: unknown): void => {
    console.error("[DATABASE_ERROR]", error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          if (error.message.includes('email')) {
            notifications.auth.emailExists()
          } else {
            toast.error("Дублирующаяся запись", {
              description: "Такая запись уже существует в базе данных",
              duration: 5000,
            })
          }
          break

        case 'P2003':
          toast.error("Ошибка связи данных", {
            description: "Невозможно выполнить операцию из-за связанных данных",
            duration: 5000,
          })
          break

        case 'P2025':
          toast.error("Запись не найдена", {
            description: "Запрашиваемая запись не существует или была удалена",
            duration: 5000,
          })
          break

        default:
          toast.error("Ошибка базы данных", {
            description: "Произошла ошибка при обработке запроса",
            duration: 5000,
          })
      }
      return
    }

    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        toast.error("Ошибка подключения к базе данных", {
          description: "Пожалуйста, попробуйте позже",
          duration: 5000,
        })
        return
      }
    }

    toast.error("Неизвестная ошибка", {
      description: "Пожалуйста, попробуйте позже",
      duration: 5000,
    })
  },

  // Форматирование сообщений об ошибках
  formatErrorMessage: (error: unknown): string => {
    if (typeof error === 'string') return error
    if (error instanceof Error) return error.message
    return "Произошла неизвестная ошибка"
  }
} 