"use client"

import { useNotifications } from "@/hooks/use-notifications"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings } from "lucide-react"

export function NotificationSettings() {
  const { settings, updateSettings } = useNotifications()

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h3 className="font-medium">Настройки уведомлений</h3>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="group-similar">Группировать похожие</Label>
          <Switch
            id="group-similar"
            checked={settings.groupSimilar}
            onCheckedChange={(checked) => updateSettings({ groupSimilar: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="unread-only">Показывать только непрочитанные</Label>
          <Switch
            id="unread-only"
            checked={settings.showUnreadOnly}
            onCheckedChange={(checked) => updateSettings({ showUnreadOnly: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="sound-enabled">Звуковые уведомления</Label>
          <Switch
            id="sound-enabled"
            checked={settings.soundEnabled}
            onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="desktop-notifications">Уведомления на рабочем столе</Label>
          <Switch
            id="desktop-notifications"
            checked={settings.desktopNotifications}
            onCheckedChange={(checked) => updateSettings({ desktopNotifications: checked })}
          />
        </div>
      </div>
    </div>
  )
} 