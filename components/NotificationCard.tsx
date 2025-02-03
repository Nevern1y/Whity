import React from 'react';
import { cn } from '@/lib/utils';
import { Bell, MessageSquare, Trophy, Newspaper, LucideIcon, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: 'message' | 'achievement' | 'course' | 'news' | 'friend_request';
    read: boolean;
    senderId?: string;
    senderName?: string;
    senderImage?: string;
  };
  handleRead: () => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  className?: string;
}

const notificationIcons: Record<string, LucideIcon> = {
  message: MessageSquare,
  achievement: Trophy,
  course: Bell,
  news: Newspaper,
  friend_request: UserCircle,
};

const NotificationCard: React.FC<NotificationItemProps> = ({ 
  notification, 
  handleRead, 
  onAccept,
  onReject,
  className 
}) => {
  // Если нет необходимых данных, не рендерим карточку
  if (!notification || !notification.title || !notification.message) {
    return null;
  }

  // Добавляем проверку на существование иконки
  const Icon = notificationIcons[notification.type] || Bell; // Bell как иконка по умолчанию
  const isFriendRequest = notification.type === 'friend_request';

  return (
    <div 
      className={cn(
        "flex items-start gap-4 p-4 transition-all rounded-lg",
        "hover:bg-accent/50 card-hover",
        notification.read 
          ? "bg-background" 
          : "bg-gradient-to-r from-primary/10 to-background border-l-2 border-primary",
        className
      )}
      onClick={handleRead}
    >
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full",
        notification.read 
          ? "bg-muted text-muted-foreground" 
          : "bg-primary/10 text-primary"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">
            {notification.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {notification.message}
          </p>
        </div>
        
        {/* Кнопки действий для запроса в друзья */}
        {isFriendRequest && (
          <div className="flex items-center gap-2">
            {notification.senderId && (
              <Link 
                href={`/profile/${notification.senderId}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Просмотреть профиль
              </Link>
            )}
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onReject?.(notification.id);
              }}
              className="h-7 px-2 text-destructive hover:text-destructive"
            >
              Отклонить
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAccept?.(notification.id);
              }}
              className="h-7 px-2"
            >
              Принять
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCard; 