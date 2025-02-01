import { Metadata } from "next"
import { ProfileContent } from "./_components/profile-content"

export const metadata: Metadata = {
  title: "Профиль | Аллель Агро",
  description: "Управление профилем пользователя",
}

export default function ProfilePage() {
  return <ProfileContent />
}

