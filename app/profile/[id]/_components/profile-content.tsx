import { FC } from 'react'
import CourseProgressWrapper from './course-progress-wrapper'
import UserAchievementsWrapper from './user-achievements-wrapper'
import ActivityFeedWrapper from './activity-feed-wrapper'

interface ProfileContentProps {
  userId: string
  tab?: string
}

const ProfileContent: FC<ProfileContentProps> = ({ userId, tab }) => {
  // В зависимости от таба возвращаем соответствующий контент
  switch(tab) {
    case 'progress':
      return <CourseProgressWrapper userId={userId} />
    case 'achievements':
      return <UserAchievementsWrapper userId={userId} />
    case 'activity':
      return <ActivityFeedWrapper userId={userId} />
    default:
      return <CourseProgressWrapper userId={userId} />
  }
}

export default ProfileContent 