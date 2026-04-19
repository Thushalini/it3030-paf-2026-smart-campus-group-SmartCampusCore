import { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
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
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data);
    } catch (err) {
      console.error("Failed to load unread count:", err);
    }
  };

  // ✅ Reload notifications every time dropdown opens
  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadNotifications();
  };

  const handleRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter to last 30 days
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  const recentNotifications = notifications.filter(
    (n) => new Date(n.createdAt) >= oneMonthAgo
  );

  const cleanMessage = (message) => {
    return message.replace(/\s*at\s+\d{4}-\d{2}-\d{2}T[\d.:]+/g, "").trim();
  };

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();

    const interval = setInterval(loadUnreadCount, 5000);

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        console.log("✅ STOMP connected");
        stompClient.subscribe(
          `/topic/notifications/${userId}`,
          (message) => {
            console.log("🔔 Notification received:", message.body);
            const newNotification = JSON.parse(message.body);
            // ✅ Ensure isRead field is always present
            setNotifications((prev) => [
              { ...newNotification, isRead: newNotification.isRead ?? false },
              ...prev,
            ]);
            setUnreadCount((prev) => prev + 1);
          }
        );
      },
      onDisconnect: () => console.log("❌ STOMP disconnected"),
      onStompError: (frame) => console.error("🚨 STOMP error:", frame),
      onWebSocketError: (err) => console.error("🚨 WebSocket error:", err),
    });

    stompClient.activate();

    return () => {
      clearInterval(interval);
      stompClient.deactivate();
    };
  }, []);

  return (
    <div className="relative">
      {/* Bell Icon */}
      <div
        className="cursor-pointer text-xl relative"
        onClick={handleToggle}  
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 shadow-xl rounded-xl z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                Loading...
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                No notifications in the last 30 days
              </div>
            ) : (
              recentNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                    !n.isRead
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {/* Unread dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    <span
                      className={`block w-2 h-2 rounded-full ${
                        !n.isRead ? "bg-blue-500" : "bg-transparent"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm leading-snug break-words ${
                        !n.isRead
                          ? "font-semibold text-gray-900"
                          : "font-normal text-gray-500"
                      }`}
                    >
                      {cleanMessage(n.message)}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">
                        {formatDate(n.createdAt)}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {n.type}
                      </span>
                    </div>
                  </div>

                  {/* Mark read button — only on unread */}
                  {!n.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRead(n.id);
                      }}
                      className="flex-shrink-0 text-xs text-blue-500 hover:text-blue-700 font-medium whitespace-nowrap mt-0.5 transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Showing notifications from the last 30 days
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}