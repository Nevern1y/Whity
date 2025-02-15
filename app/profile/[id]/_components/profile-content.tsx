"use client"

import { useEffect, useState } from 'react'
import { getCourseProgress, getAchievements, getActivity } from '@/app/actions/profile'
import CourseProgressWrapper from './course-progress-wrapper'
import UserAchievementsWrapper from './user-achievements-wrapper'
import ActivityFeedWrapper from './activity-feed-wrapper'

type TabType = 'progress' | 'achievements' | 'activity'

interface ProfileContentProps {
  userId: string
  tab: TabType
}

export function ProfileContent({ userId, tab }: ProfileContentProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        let result
        switch (tab) {
          case 'progress':
            result = await getCourseProgress(userId)
            break
          case 'achievements':
            result = await getAchievements(userId)
            break
          case 'activity':
            result = await getActivity(userId)
            break
        }
        setData(result)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, tab])

  if (loading) {
    return <div>Загрузка...</div>
  }

  // В зависимости от таба возвращаем соответствующий контент
  switch(tab) {
    case 'progress':
      return <CourseProgressWrapper userId={userId} data={data} />
    case 'achievements':
      return <UserAchievementsWrapper userId={userId} data={data} />
    case 'activity':
      return <ActivityFeedWrapper userId={userId} data={data} />
    default:
      return <CourseProgressWrapper userId={userId} data={data} />
  }
} 