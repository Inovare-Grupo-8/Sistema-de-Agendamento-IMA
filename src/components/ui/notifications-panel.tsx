import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  createdAt: Date;
  read: boolean;
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Simular notificações recebidas
  useEffect(() => {
    // Carregar do localStorage
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed);
      setHasUnread(parsed.some((n: Notification) => !n.read));
    }
    
    // Simular uma nova notificação chegando
    const timer = setTimeout(() => {
      const newNotification = {
        id: Date.now().toString(),
        title: 'Nova consulta',
        message: 'Você tem uma nova consulta agendada para amanhã às 14:00',
        type: 'info' as const,
        createdAt: new Date(),
        read: false
      };
      
      setNotifications(prev => {
        const updated = [newNotification, ...prev];
        localStorage.setItem('notifications', JSON.stringify(updated));
        return updated;
      });
      setHasUnread(true);
    }, 30000); // Após 30 segundos
    
    return () => clearTimeout(timer);
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setHasUnread(false);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setHasUnread(updated.some(n => !n.read));
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={() => setOpen(true)}
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#ED4231]" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notificações</h3>
          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={!hasUnread}>
            Marcar todas como lidas
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <p className="text-sm text-gray-500">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={cn(
                    "p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer",
                    notification.read ? "opacity-70" : "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <span className="text-xs text-gray-500">
                      {new Intl.RelativeTimeFormat('pt', { numeric: 'auto' }).format(
                        Math.round((new Date(notification.createdAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
                        'day'
                      )}
                    </span>
                  </div>
                  <p className="text-xs mt-1">{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t text-center">
          <Button variant="ghost" size="sm" className="text-xs">
            Ver todas as notificações
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
