import { useEffect, useRef } from "react"
import { io, Socket } from "socket.io-client"

export function useSocket(userId?: string) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!userId) return

    if (!socketRef.current) {
      socketRef.current = io({
        path: "/api/socket",
        addTrailingSlash: false,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      })

      const socket = socketRef.current

      socket.on("connect", () => {
        console.log("Connected to socket server")
      })

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
      })

      socket.on("disconnect", (reason) => {
        console.log("Disconnected from socket server:", reason)
      })

      socket.on("reconnect", (attemptNumber) => {
        console.log("Reconnected to socket server after", attemptNumber, "attempts")
      })
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [userId])

  return socketRef.current
} 