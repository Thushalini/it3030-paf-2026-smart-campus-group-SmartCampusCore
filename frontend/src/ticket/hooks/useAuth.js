export const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const getCurrentUser = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return null;
  const payload = parseJwt(token);
  return {
    id: payload?.userId || payload?.sub || payload?.id,
    email: payload?.email || payload?.sub,
    role: (payload?.role || payload?.roles?.[0] || "USER").replace("ROLE_", ""),
    name: payload?.name || payload?.fullName || "User",
  };
};