import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

// В development используем моковые значения если переменные не определены
const pusherConfig = {
  appId: process.env.PUSHER_APP_ID || 'development',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'development',
  secret: process.env.PUSHER_SECRET || 'development',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
}

// Временное решение - используем моки вместо реальных клиентов
export const pusherServer = {
  trigger: async () => Promise.resolve(),
} as any

export const pusherClient = {
  subscribe: () => ({
    bind: () => {},
    unbind: () => {},
  }),
  unsubscribe: () => {},
} as any

/* Реальная реализация - раскомментировать когда будут настроены переменные окружения
export const pusherServer = new PusherServer({
  ...pusherConfig,
  useTLS: true,
})

export const pusherClient = new PusherClient(
  pusherConfig.key,
  {
    cluster: pusherConfig.cluster,
    forceTLS: true,
  }
)
*/ 