import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
  PieChart, Pie, Legend,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

// ─── Colour tokens (match your blue-accent admin UI) ──────────────────────────
const C = {
  blue:      "#3b82f6",
  blueLight: "#eff6ff",
  blueMid:   "#bfdbfe",
  indigo:    "#6366f1",
  emerald:   "#10b981",
  amber:     "#f59e0b",
  rose:      "#f43f5e",
  sky:       "#0ea5e9",
  violet:    "#8b5cf6",
  gray:      "#64748b",
};

const ROLE_COLORS   = [C.blue, C.emerald, C.amber];
const TYPE_COLORS   = [C.indigo, C.sky];
const STATUS_COLORS = [C.emerald, C.rose];
const DEPT_PALETTE  = [C.blue, C.indigo, C.sky, C.violet, C.amber, C.emerald];

// ─── Reusable tooltip ─────────────────────────────────────────────────────────
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

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, icon, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: `${color}18` }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-3xl font-black text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold mt-1 ${trend >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Chart wrapper card ───────────────────────────────────────────────────────
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

function NoData({ message = "No data available" }) {
  return (
    <div className="h-52 flex flex-col items-center justify-center gap-2 text-gray-300">
      <span className="text-3xl">📭</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Donut label ──────────────────────────────────────────────────────────────
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
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

// ─── Main Analytics Tab ───────────────────────────────────────────────────────
/**
 * Drop this as a tab inside AdminManageUsers.
 * Props:
 *   users — the full users array you already fetch with getAllUsers()
 */
export default function AdminUserAnalytics({ users = [] }) {

  const data = useMemo(() => {
    const total    = users.length;
    const active   = users.filter(u => u.status !== "DISABLED").length;
    const disabled = users.filter(u => u.status === "DISABLED").length;
    const admins   = users.filter(u => u.role === "ADMIN").length;
    const techs    = users.filter(u => u.role === "TECHNICIAN").length;
    const regular  = users.filter(u => u.role === "USER").length;
    const students = users.filter(u => u.userType === "STUDENT").length;
    const staff    = users.filter(u => u.userType === "STAFF").length;
    const withDept = users.filter(u => u.department).length;
    const oauth    = users.filter(u => u.provider === "GOOGLE").length;

    // Role pie
    const roleData = [
      { name: "User",       value: regular },
      { name: "Admin",      value: admins  },
      { name: "Technician", value: techs   },
    ].filter(d => d.value > 0);

    // User type pie
    const typeData = [
      { name: "Student", value: students },
      { name: "Staff",   value: staff    },
    ].filter(d => d.value > 0);

    // Status pie
    const statusData = [
      { name: "Active",   value: active   },
      { name: "Disabled", value: disabled },
    ].filter(d => d.value > 0);

    // Departments bar (top 8)
    const deptMap = {};
    users.forEach(u => {
      if (u.department) deptMap[u.department] = (deptMap[u.department] ?? 0) + 1;
    });
    const departments = Object.entries(deptMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    // Registrations over time (monthly)
    const monthMap = {};
    users.forEach(u => {
      if (!u.createdAt) return;
      const d   = new Date(u.createdAt);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      monthMap[key] = (monthMap[key] ?? 0) + 1;
    });
    const registrations = Object.entries(monthMap)
      .map(([month, count]) => ({ month, count }))
      .slice(-10);

    // Role × Status grouped bar
    const roleStatus = ["USER", "ADMIN", "TECHNICIAN"].map(role => ({
      role,
      Active:   users.filter(u => u.role === role && u.status !== "DISABLED").length,
      Disabled: users.filter(u => u.role === role && u.status === "DISABLED").length,
    }));

    // Radar: composition %
    const pct = n => (total ? Math.round(n / total * 100) : 0);
    const radar = [
      { metric: "Admins",      value: pct(admins)   },
      { metric: "Technicians", value: pct(techs)    },
      { metric: "Students",    value: pct(students) },
      { metric: "Staff",       value: pct(staff)    },
      { metric: "Active",      value: pct(active)   },
      { metric: "OAuth",       value: pct(oauth)    },
    ];

    // Auth method bar
    const authData = [
      { method: "Email/Password", value: total - oauth },
      { method: "Google OAuth",   value: oauth          },
    ];

    return {
      total, active, disabled, admins, techs, regular,
      students, staff, withDept, oauth,
      disableRate: total ? Math.round(disabled / total * 100) : 0,
      roleData, typeData, statusData, departments,
      registrations, roleStatus, radar, authData,
    };
  }, [users]);

  return (
    <div className="space-y-6 py-2">

      {/* ── Section label ── */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Overview</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      {/* ── KPI row 1 ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Users"   value={data.total}    sub="all accounts"                            color={C.blue}    icon="👥" />
        <KpiCard label="Active"        value={data.active}   sub={`${data.total ? Math.round(data.active/data.total*100) : 0}% of total`} color={C.emerald} icon="✅" />
        <KpiCard label="Disabled"      value={data.disabled} sub={`${data.disableRate}% disable rate`}     color={C.rose}    icon="🚫" />
        <KpiCard label="Administrators" value={data.admins}  sub={`${data.techs} technician(s)`}           color={C.violet}  icon="🛡️" />
      </div>

      {/* ── KPI row 2 ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Regular Users" value={data.regular}   sub="role: USER"                            color={C.sky}    icon="🙋" />
        <KpiCard label="Students"      value={data.students}  sub="user type"                             color={C.indigo} icon="🎓" />
        <KpiCard label="Staff Members" value={data.staff}     sub="user type"                             color={C.amber}  icon="💼" />
        <KpiCard label="Google OAuth"  value={data.oauth}     sub={`${data.total - data.oauth} email/pw`} color={C.blue}   icon="🔑" />
      </div>

      {/* ── Section label ── */}
      <div className="flex items-center gap-3 pt-2">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Distribution</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      {/* ── Row: 3 donuts ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <ChartCard title="Role Distribution" sub="Breakdown by access level">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.roleData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                dataKey="value" paddingAngle={3} labelLine={false} label={renderLabel}>
                {data.roleData.map((_, i) => <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8}
                formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Account Status" sub="Active vs disabled accounts">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.statusData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                dataKey="value" paddingAngle={3} labelLine={false} label={renderLabel}>
                {data.statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8}
                formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User Type Split" sub="Student vs staff membership">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.typeData} cx="50%" cy="50%" innerRadius={52} outerRadius={78}
                dataKey="value" paddingAngle={3} labelLine={false} label={renderLabel}>
                {data.typeData.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8}
                formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Row: line + bar ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <ChartCard title="Registrations Over Time" sub="Monthly sign-up trend">
          {data.registrations.length === 0
            ? <NoData message="No createdAt field on users yet" />
            : (
              <ResponsiveContainer width="100%" height={210}>
                <LineChart data={data.registrations} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="count" name="Sign-ups"
                    stroke={C.blue} strokeWidth={2.5}
                    dot={{ fill: C.blue, r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: C.blue }} />
                </LineChart>
              </ResponsiveContainer>
            )}
        </ChartCard>

        <ChartCard title="Top Departments" sub="Users per department">
          {data.departments.length === 0
            ? <NoData message="No department data on users yet" />
            : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={data.departments} barSize={24}
                  margin={{ top: 4, right: 8, bottom: 28, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }}
                    angle={-30} textAnchor="end" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Users" radius={[5, 5, 0, 0]}>
                    {data.departments.map((_, i) => (
                      <Cell key={i} fill={DEPT_PALETTE[i % DEPT_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
        </ChartCard>
      </div>

      {/* ── Row: grouped bar + radar ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <ChartCard title="Role × Status" sub="Active vs disabled users per role">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={data.roleStatus} barGap={3} barSize={20}
              margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="role" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" iconSize={8}
                formatter={v => <span className="text-xs text-gray-600 font-medium">{v}</span>} />
              <Bar dataKey="Active"   fill={C.emerald} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Disabled" fill={C.rose}    radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Composition Radar" sub="Percentage breakdown across all dimensions">
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart cx="50%" cy="50%" outerRadius={75} data={data.radar}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="metric"
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]}
                tick={{ fill: "#cbd5e1", fontSize: 9 }} />
              <Radar name="%" dataKey="value"
                stroke={C.blue} fill={C.blue} fillOpacity={0.15} strokeWidth={2} />
              <Tooltip content={<ChartTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Auth method bar ── */}
      <ChartCard title="Authentication Method" sub="How users signed up — email/password vs Google OAuth">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data.authData} layout="vertical" barSize={28}
            margin={{ top: 0, right: 16, bottom: 0, left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="method" tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
              axisLine={false} tickLine={false} width={120} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" name="Users" radius={[0, 6, 6, 0]}>
              <Cell fill={C.indigo} />
              <Cell fill={C.blue}   />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
}