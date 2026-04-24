import { useState, useContext } from "react";
import { loginUser } from "../api/authService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";

function Login() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setError("");
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await loginUser(form);
            sessionStorage.setItem("token", res.data.token);
            sessionStorage.setItem("userId", res.data.id);

            await login(res.data);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Invalid email or password"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const googleToken = credentialResponse.credential;
            const res = await axios.post("http://localhost:8080/api/auth/google", { token: googleToken });
            sessionStorage.setItem("token", res.data.token);
            await login(res.data);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            console.error("Google login error:", err);
            setError(
                err.response?.data?.message ||
                "Google login failed"
            );
        }
    };

    const handleGoogleError = () => {
        setError("Google login failed");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 relative overflow-hidden">
            
            {/* Decorative background circles */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative bg-white/95 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/20"
            >
                <div className="text-center mb-8">
                    <motion.h2 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                        Welcome Back
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-gray-500 mt-2"
                    >
                        Sign in to access your dashboard
                    </motion.p>
                </div>

                {error && (
                    <motion.p 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-red-500 text-sm font-medium text-center mb-4 bg-red-50 py-2 rounded-lg"
                    >
                        {error}
                    </motion.p>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Email</label>
                        <input
                            name="email"
                            placeholder="name@example.com"
                            autoComplete="email"
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-gray-800"
                        />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
                            <span 
                                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
                                onClick={() => navigate("/forgot-password")}
                            >
                                Forgot Password?
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-gray-800 pr-12"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white py-3 flex items-center justify-center rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-300
                            ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600"}`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Logging in...
                            </span>
                        ) : "Login"}
                    </motion.button>
                </form>

                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                    className="my-6 flex items-center justify-center text-gray-400 text-sm"
                >
                    <span className="h-px w-full bg-gray-200"></span>
                    <span className="px-3 font-medium text-gray-400">OR</span>
                    <span className="h-px w-full bg-gray-200"></span>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                    className="flex justify-center"
                >
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                    />
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                    className="text-center text-sm text-gray-500 mt-8"
                >
                    Don't have an account?{" "}
                    <span 
                        className="font-semibold text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors"
                        onClick={() => navigate("/signup")}
                    >
                        Create one
                    </span>
                </motion.p>
            </motion.div>
        </div>
    );
}

export default Login;