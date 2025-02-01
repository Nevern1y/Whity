import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    read: boolean;
  };
  handleRead: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, handleRead }) => {
  return (
    <div 
      className={cn(
        "flex items-start gap-4 p-4 transition-all rounded-lg",
        "hover:bg-accent/50 card-hover",
        notification.read 
          ? "bg-background" 
          : "bg-gradient-to-r from-primary/10 to-background border-l-2 border-primary"
      )}
      onClick={handleRead}
    >
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full",
        notification.read 
          ? "bg-muted text-muted-foreground" 
          : "bg-primary/10 text-primary"
      )}>
        {/* ... */}
      </div>
      {/* ... */}
    </div>
  );
};

export default NotificationItem; 