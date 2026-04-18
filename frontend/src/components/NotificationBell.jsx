import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../api/notificationApi";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    const res = await getNotifications();
    setNotifications(res.data);
  };

  const loadUnreadCount = async () => {
    const res = await getUnreadCount();
    setUnreadCount(res.data);
  };

  const handleRead = async (id) => {
    await markAsRead(id);
    loadNotifications();
    loadUnreadCount();
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    loadNotifications();
    loadUnreadCount();
  };

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();

    const interval = setInterval(loadUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div
        className="cursor-pointer text-xl relative"
        onClick={() => setOpen(!open)}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50">
          <div className="flex justify-between p-2 border-b">
            <h3 className="font-semibold">Notifications</h3>
            <button
              onClick={handleMarkAll}
              className="text-sm text-blue-500"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="p-3 text-gray-500">No notifications</p>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleRead(n.id)}
                className={`p-3 border-b cursor-pointer ${
                  !n.read ? "bg-gray-100" : ""
                }`}
              >
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-gray-500">{n.type}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}