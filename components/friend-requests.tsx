"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FriendRequestActions } from "@/components/friend-request-actions"

interface FriendRequest {
  id: string
  sender: {
    id: string
    name: string | null
    image: string | null
  }
}

export function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([])

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/friends/requests')
      if (!response.ok) throw new Error('Failed to fetch requests')
      const data = await response.json()
      setRequests(data)
    } catch (error) {
      console.error('Error fetching friend requests:', error)
    }
  }

  if (requests.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Запросы в друзья</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={request.sender.image || undefined} />
                <AvatarFallback>{request.sender.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{request.sender.name}</p>
              </div>
            </div>
            <FriendRequestActions friendshipId={request.id} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
} 