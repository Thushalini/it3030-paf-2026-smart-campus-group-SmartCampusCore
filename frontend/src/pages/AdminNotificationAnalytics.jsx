import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend,
  LineChart, Line,
  AreaChart, Area,
  FunnelChart, Funnel, LabelList,
} from "recharts";

// ── Colour tokens (matches light/blue admin UI) ────────────────────────────
const C = {
  blue:    "#3b82f6",
  indigo:  "#6366f1",
  emerald: "#10b981",
  amber:   "#f59e0b",
  rose:    "#f43f5e",
  sky:     "#0ea5e9",
  violet:  "#8b5cf6",
  teal:    "#14b8a6",
  orange:  "#f97316",
};

const TYPE_COLORS = {
  ANNOUNCEMENT: C.blue,
  BOOKING:      C.emerald,
  TICKET:       C.orange,
  COMMENT:      C.violet,
  TEST:         "#94a3b8",
};

const ROLE_COLORS = {
  ALL:        C.blue,
  USER:       C.sky,
  ADMIN:      C.indigo,
  TECHNICIAN: C.amber,
};

// ── Shared tooltip ─────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      {label && <p className="text-gray-500 font-medium mb-1 text-xs">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color ?? p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ── KPI card ──────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${color}18` }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-3xl font-black text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Chart wrapper ─────────────────────────────────────────────────────────
function ChartCard({ title, sub, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-5 ${className}`}>
      <p className="text-sm font-bold text-gray-800">{title}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5 mb-4">{sub}</p>}
      {!sub && <div className="mb-4" />}
      {children}
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="h-px flex-1 bg-gray-100" />
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

function NoData({ message = "No data available yet" }) {
  return (
    <div className="h-48 flex flex-col items-center justify-center gap-2 text-gray-300">
      <span className="text-3xl">📭</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight="700">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
export default function AdminNotificationAnalytics({ history = [], allNotifs = [] }) {

  const data = useMemo(() => {

    // ── KPIs from broadcast logs ──────────────────────────────────────────
    const totalBroadcasts  = history.length;
    const totalRecipients  = history.reduce((s, l) => s + (l.recipientCount ?? 0), 0);
    const avgRecipients    = totalBroadcasts ? Math.round(totalRecipients / totalBroadcasts) : 0;

    // ── KPIs from per-user notifications ─────────────────────────────────
    const totalNotifs  = allNotifs.length;
    const readNotifs   = allNotifs.filter(n => n.isRead).length;
    const unreadNotifs = totalNotifs - readNotifs;
    const readRate     = totalNotifs ? Math.round(readNotifs / totalNotifs * 100) : 0;

    // ── Broadcast type distribution (from logs) ───────────────────────────
    const broadcastTypeMap = {};
    history.forEach(l => {
      broadcastTypeMap[l.type] = (broadcastTypeMap[l.type] ?? 0) + 1;
    });
    const broadcastTypeData = Object.entries(broadcastTypeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // ── Target role distribution (from logs) ──────────────────────────────
    const roleMap = {};
    history.forEach(l => {
      roleMap[l.targetRole] = (roleMap[l.targetRole] ?? 0) + 1;
    });
    const roleData = Object.entries(roleMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // ── Recipients per role bar ───────────────────────────────────────────
    const roleRecipientsMap = {};
    history.forEach(l => {
      roleRecipientsMap[l.targetRole] = (roleRecipientsMap[l.targetRole] ?? 0) + (l.recipientCount ?? 0);
    });
    const roleRecipientsData = Object.entries(roleRecipientsMap)
      .map(([role, recipients]) => ({ role, recipients }))
      .sort((a, b) => b.recipients - a.recipients);

    // ── Broadcast volume over time (monthly, from logs) ───────────────────
    const broadcastMonthMap = {};
    history.forEach(l => {
      if (!l.sentAt) return;
      const d   = new Date(l.sentAt);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      broadcastMonthMap[key] = (broadcastMonthMap[key] ?? 0) + 1;
    });
    const broadcastOverTime = Object.entries(broadcastMonthMap)
      .map(([month, count]) => ({ month, count }))
      .slice(-10);

    // ── Per-user notification type distribution ───────────────────────────
    const notifTypeMap = {};
    allNotifs.forEach(n => {
      notifTypeMap[n.type] = (notifTypeMap[n.type] ?? 0) + 1;
    });
    const notifTypeData = Object.entries(notifTypeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // ── Read vs unread per type ───────────────────────────────────────────
    const readByTypeMap = {};
    allNotifs.forEach(n => {
      if (!readByTypeMap[n.type]) readByTypeMap[n.type] = { type: n.type, Read: 0, Unread: 0 };
      if (n.isRead) readByTypeMap[n.type].Read++;
      else          readByTypeMap[n.type].Unread++;
    });
    const readByType = Object.values(readByTypeMap);

    // ── Notification activity over time (monthly, from allNotifs) ─────────
    const notifMonthMap = {};
    allNotifs.forEach(n => {
      if (!n.createdAt) return;
      const d   = new Date(n.createdAt);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      if (!notifMonthMap[key]) notifMonthMap[key] = { month: key, total: 0, read: 0 };
      notifMonthMap[key].total++;
      if (n.isRead) notifMonthMap[key].read++;
    });
    const notifOverTime = Object.values(notifMonthMap).slice(-10);

    // ── Top senders (by log) ──────────────────────────────────────────────
    const senderMap = {};
    history.forEach(l => {
      if (!l.sentByEmail) return;
      senderMap[l.sentByEmail] = (senderMap[l.sentByEmail] ?? 0) + 1;
    });
    const topSenders = Object.entries(senderMap)
      .map(([email, count]) => ({ email, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalBroadcasts, totalRecipients, avgRecipients,
      totalNotifs, readNotifs, unreadNotifs, readRate,
      broadcastTypeData, roleData, roleRecipientsData,
      broadcastOverTime, notifTypeData, readByType,
      notifOverTime, topSenders,
    };
  }, [history, allNotifs]);

  return (
    <div className="space-y-6 py-2">

      {/* ── Broadcast KPIs ── */}
      <SectionDivider label="Broadcast Overview" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Broadcasts" value={data.totalBroadcasts} sub="sent by admins"               color={C.blue}    icon="📢" />
        <KpiCard label="Total Recipients" value={data.totalRecipients} sub="across all broadcasts"        color={C.indigo}  icon="👥" />
        <KpiCard label="Avg Recipients"   value={data.avgRecipients}   sub="per broadcast"                color={C.sky}     icon="📊" />
        <KpiCard label="Top Senders"      value={data.topSenders.length} sub="unique admin senders"       color={C.violet}  icon="🛡️" />
      </div>

      {/* ── Inbox KPIs ── */}
      <SectionDivider label="Inbox Overview" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Notifications" value={data.totalNotifs}  sub="in all inboxes"               color={C.teal}    icon="🔔" />
        <KpiCard label="Read"                value={data.readNotifs}   sub={`${data.readRate}% read rate`} color={C.emerald} icon="✅" />
        <KpiCard label="Unread"              value={data.unreadNotifs} sub="pending reads"                 color={C.rose}    icon="🔴" />
        <KpiCard label="Read Rate"           value={`${data.readRate}%`} sub="engagement score"            color={C.amber}   icon="📈" />
      </div>

      {/* ── Row: broadcast type pie + target role pie ── */}
      <SectionDivider label="Distribution" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <ChartCard title="Broadcast by Type" sub="How many of each type were sent">
          {data.broadcastTypeData.length === 0 ? <NoData /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.broadcastTypeData} cx="50%" cy="50%"
                  innerRadius={50} outerRadius={76} dataKey="value"
                  paddingAngle={3} labelLine={false} label={renderPieLabel}>
                  {data.broadcastTypeData.map((d, i) => (
                    <Cell key={i} fill={TYPE_COLORS[d.name] ?? C.blue} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8}
                  formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Target Audience" sub="Which roles were targeted">
          {data.roleData.length === 0 ? <NoData /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.roleData} cx="50%" cy="50%"
                  innerRadius={50} outerRadius={76} dataKey="value"
                  paddingAngle={3} labelLine={false} label={renderPieLabel}>
                  {data.roleData.map((d, i) => (
                    <Cell key={i} fill={ROLE_COLORS[d.name] ?? C.sky} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8}
                  formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Inbox Type Split" sub="Per-user notification types">
          {data.notifTypeData.length === 0 ? <NoData /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.notifTypeData} cx="50%" cy="50%"
                  innerRadius={50} outerRadius={76} dataKey="value"
                  paddingAngle={3} labelLine={false} label={renderPieLabel}>
                  {data.notifTypeData.map((d, i) => (
                    <Cell key={i} fill={TYPE_COLORS[d.name] ?? C.teal} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8}
                  formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Row: broadcast timeline + inbox timeline ── */}
      <SectionDivider label="Trends Over Time" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <ChartCard title="Broadcasts Over Time" sub="Monthly admin send activity">
          {data.broadcastOverTime.length === 0
            ? <NoData message="No sentAt data on logs yet" />
            : (
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={data.broadcastOverTime} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                  <defs>
                    <linearGradient id="broadcastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.blue} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={C.blue} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="count" name="Broadcasts"
                    stroke={C.blue} strokeWidth={2.5} fill="url(#broadcastGrad)"
                    dot={{ fill: C.blue, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
        </ChartCard>

        <ChartCard title="Inbox Activity Over Time" sub="Total vs read notifications per month">
          {data.notifOverTime.length === 0
            ? <NoData message="No createdAt data on notifications yet" />
            : (
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={data.notifOverTime} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                  <defs>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.indigo} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={C.indigo} stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="readGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.emerald} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={C.emerald} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8}
                    formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
                  <Area type="monotone" dataKey="total" name="Total"
                    stroke={C.indigo} strokeWidth={2} fill="url(#totalGrad)"
                    dot={{ fill: C.indigo, r: 3, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="read" name="Read"
                    stroke={C.emerald} strokeWidth={2} fill="url(#readGrad)"
                    dot={{ fill: C.emerald, r: 3, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
        </ChartCard>
      </div>

      {/* ── Row: read by type grouped bar + recipients per role bar ── */}
      <SectionDivider label="Engagement" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <ChartCard title="Read vs Unread by Type" sub="Engagement breakdown per notification type">
          {data.readByType.length === 0 ? <NoData /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={data.readByType} barGap={3} barSize={20}
                margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="type" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8}
                  formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
                <Bar dataKey="Read"   fill={C.emerald} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Unread" fill={C.rose}    radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Recipients Reached by Role" sub="Total users notified per target group">
          {data.roleRecipientsData.length === 0 ? <NoData /> : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={data.roleRecipientsData} barSize={32}
                margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="role" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="recipients" name="Recipients" radius={[5, 5, 0, 0]}>
                  {data.roleRecipientsData.map((d, i) => (
                    <Cell key={i} fill={ROLE_COLORS[d.role] ?? C.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ── Top senders table ── */}
      {data.topSenders.length > 0 && (
        <>
          <SectionDivider label="Top Senders" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">Most Active Admins</p>
              <p className="text-xs text-gray-400 mt-0.5">Ranked by number of broadcasts sent</p>
            </div>
            <div className="divide-y divide-gray-50">
              {data.topSenders.map((s, i) => (
                <div key={s.email} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                    style={{ background: [C.blue, C.indigo, C.sky, C.violet, C.amber][i] }}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-gray-700 font-medium truncate">{s.email}</span>
                  <div className="flex items-center gap-2">
                    {/* mini bar */}
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${Math.round(s.count / data.topSenders[0].count * 100)}%`,
                        background: [C.blue, C.indigo, C.sky, C.violet, C.amber][i],
                      }} />
                    </div>
                    <span className="text-sm font-bold text-gray-800 w-6 text-right">{s.count}</span>
                    <span className="text-xs text-gray-400">sent</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}