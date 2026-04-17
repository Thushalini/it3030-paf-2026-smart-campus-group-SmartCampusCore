import { createContext, useState, useEffect } from "react";
import api from "../api/axiosConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user on app start
  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Session expired");
      logout();
    }
  };

  const login = async (data) => {
    if (!data?.token) {
      console.error("Invalid login response:", data);
      return;
    }

    localStorage.setItem("token", data.token);

    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch (err) {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// import { createContext, useState, useEffect } from "react";
// import axios from "axios";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(undefined); // undefined = loading

//   // 🔥 Load user from backend using token
//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       setUser(null);
//       return;
//     }

//     axios
//       .get("http://localhost:8080/api/auth/me", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       .then((res) => {
//         setUser(res.data); // { id, email, role, name }
//       })
//       .catch((err) => {
//         console.error("Invalid token:", err);
//         logout();
//       });
//   }, []);

//   // ✅ Login (Normal + Google)
//   const login = (data) => {
//     localStorage.setItem("token", data.token);

//     // If backend sends user → use it
//     if (data.user) {
//       setUser(data.user);
//     } else {
//       fetchUser();
//     }
//   };

//   // 🔄 Fetch user manually
//   const fetchUser = async () => {
//     const token = localStorage.getItem("token");

//     try {
//       const res = await axios.get("http://localhost:8080/api/auth/me", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setUser(res.data);
//     } catch (err) {
//       logout();
//     }
//   };

//   // 🚪 Logout
//   const logout = () => {
//     localStorage.removeItem("token");
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
