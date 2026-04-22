import { useState, useContext } from "react";
import { loginUser } from "../api/authService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

import { GoogleLogin } from "@react-oauth/google";
// import { jwtDecode } from "jwt-decode";

function Login() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // -------------------------
    // Normal login
    // -------------------------
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
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data.id);

            login(res.data);

            const role = res.data.role;

            // if (role === "ADMIN") navigate("/admin", { replace: true });
            // else if (role === "TECHNICIAN") navigate("/technician", { replace: true });
            // else 
            navigate("/dashboard", { replace: true });

        } catch (err) {
            console.error(err);
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    // -------------------------
    // Google login success
    // -------------------------
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const googleToken = credentialResponse.credential;

            const res = await axios.post(
            "http://localhost:8080/api/auth/google",
            { token: googleToken }
            );

            console.log("Google login response:", res.data);

            localStorage.setItem("token", res.data.token);
            login(res.data);

            navigate("/dashboard", { replace: true });

        } catch (err) {
            console.error("Google login error:", err);
            setError("Google login failed");
        }
    };

    const handleGoogleError = () => {
        setError("Google login failed");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Welcome Back
                </h2>

                {/* Error message */}
                {error && (
                    <p className="text-red-500 text-sm text-center mb-3">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        name="email"
                        placeholder="Email"
                        autoComplete="email"
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white py-2 rounded-lg transition duration-300 
                        ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-4 text-center text-gray-400">OR</div>

                {/* Google Login */}
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                    />
                </div>

                <p
                    className="text-center text-sm text-gray-600 mt-6 cursor-pointer hover:text-blue-600"
                    onClick={() => navigate("/signup")}
                >
                    Don't have an account? Signup
                </p>
            </div>
        </div>
    );
}

export default Login;