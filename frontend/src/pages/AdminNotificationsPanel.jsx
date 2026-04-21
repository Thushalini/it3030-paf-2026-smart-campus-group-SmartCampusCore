import { useState, useEffect } from "react";
import {
  broadcastNotification,
  sendToRole,
  getNotificationHistory,
  deleteNotificationLog,
  getAllNotificationsAdmin,
  deleteNotificationById,
} from "../api/notificationApi";

const ROLES = ["ALL", "TECHNICIAN", "USER", "ADMIN"];
const TYPES = ["ANNOUNCEMENT", "BOOKING", "TICKET", "COMMENT"];
const FILTER_TYPES = ["ALL", "BOOKING", "TICKET", "COMMENT"];

export default function AdminNotificationsPanel() {
  const [tab, setTab]             = useState("send");       // "send" | "inbox"
  const [message, setMessage]     = useState("");
  const [type, setType]           = useState("ANNOUNCEMENT");
  const [target, setTarget]       = useState("ALL");
  const [history, setHistory]     = useState([]);
  const [allNotifs, setAllNotifs] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [sending, setSending]     = useState(false);
  const [feedback, setFeedback]   = useState(null);

  const loadHistory = async () => {
    try {
      const res = await getNotificationHistory();
      setHistory(res.data);
    } catch (err) { console.error(err); }
  };

  const loadAllNotifs = async (ft = filterType) => {
    try {
      const res = await getAllNotificationsAdmin(ft === "ALL" ? "" : ft);
      setAllNotifs(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadHistory(); loadAllNotifs(); }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setFeedback(null);
    try {
      const res = target === "ALL"
        ? await broadcastNotification(message, type)
        : await sendToRole(target, message, type);
      setFeedback({ ok: true, text: `Sent to ${res.data.sent} user(s).` });
      setMessage("");
      loadHistory();
      loadAllNotifs();
    } catch (err) {
      setFeedback({ ok: false, text: "Failed to send." });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteLog = async (logId) => {
    await deleteNotificationLog(logId);
    setHistory((prev) => prev.filter((l) => l.id !== logId));
  };

  const handleDeleteNotif = async (id) => {
    await deleteNotificationById(id);
    setAllNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  const handleFilterChange = (ft) => {
    setFilterType(ft);
    loadAllNotifs(ft);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  const typeBadgeColor = (t) => ({
    ANNOUNCEMENT: "bg-blue-100 text-blue-700",
    BOOKING:      "bg-green-100 text-green-700",
    TICKET:       "bg-orange-100 text-orange-700",
    COMMENT:      "bg-purple-100 text-purple-700",
    TEST:         "bg-gray-100 text-gray-600",
  }[t] ?? "bg-gray-100 text-gray-600");

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "send",   label: "Send Notification" },
          { key: "inbox",  label: "All Notifications" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Send ── */}
      {tab === "send" && (
        <>
          {/* Compose */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Send Notification</h2>

            <textarea
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="flex gap-3 flex-wrap">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Target</label>
                <select
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r === "ALL" ? "All Users" : r}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Type</label>
                <select
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>

            {feedback && (
              <p className={`text-sm font-medium ${feedback.ok ? "text-green-600" : "text-red-500"}`}>
                {feedback.text}
              </p>
            )}
          </div>

          {/* Broadcast History */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Sent History</h2>
            </div>
            {history.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No notifications sent yet.</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {history.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium break-words">{log.message}</p>
                      <div className="flex flex-wrap gap-2 mt-1 items-center">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{log.targetRole}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadgeColor(log.type)}`}>{log.type}</span>
                        <span className="text-xs text-gray-400">{log.recipientCount} recipient{log.recipientCount !== 1 ? "s" : ""}</span>
                        <span className="text-xs text-gray-400">{formatDate(log.sentAt)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">by {log.sentByEmail}</p>
                    </div>
                    <button onClick={() => handleDeleteLog(log.id)}
                      className="flex-shrink-0 text-xs text-red-400 hover:text-red-600 font-medium transition-colors mt-1">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Tab: All Notifications ── */}
      {tab === "inbox" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              All Notifications
              <span className="ml-2 text-sm text-gray-400 font-normal">({allNotifs.length})</span>
            </h2>

            {/* Filter pills */}
            <div className="flex gap-1 flex-wrap">
              {FILTER_TYPES.map((ft) => (
                <button
                  key={ft}
                  onClick={() => handleFilterChange(ft)}
                  className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                    filterType === ft
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-500 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>

          {allNotifs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">No notifications found.</p>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
              {allNotifs.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-6 py-3 hover:bg-gray-50">
                  {/* Unread dot */}
                  <div className="mt-2 flex-shrink-0">
                    <span className={`block w-2 h-2 rounded-full ${!n.isRead ? "bg-blue-500" : "bg-gray-200"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm break-words ${!n.isRead ? "font-semibold text-gray-900" : "text-gray-500"}`}>
                      {n.message}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1 items-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadgeColor(n.type)}`}>{n.type}</span>
                      <span className="text-xs text-gray-400">{formatDate(n.createdAt)}</span>
                      <span className="text-xs text-gray-400 font-mono">uid: {n.userEmail}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${n.isRead ? "bg-gray-100 text-gray-400" : "bg-yellow-100 text-yellow-700"}`}>
                        {n.isRead ? "Read" : "Unread"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteNotif(n.id)}
                    className="flex-shrink-0 text-xs text-red-400 hover:text-red-600 font-medium transition-colors mt-1"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}