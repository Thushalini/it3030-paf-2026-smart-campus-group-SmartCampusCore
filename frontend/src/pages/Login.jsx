import React, { useState, useContext } from "react";
import { loginUser } from "../api/authService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await loginUser(form);

            console.log("LOGIN RESPONSE:", res.data);

            // ✅ FIX: use context instead of manual localStorage
            login(res.data);

            alert("Login successful!");

            // Optional: role-based redirect
            const role = res.data.role;

            if (role === "ADMIN") {
                navigate("/admin");
            } else if (role === "TECHNICIAN") {
                navigate("/technician");
            } else {
                navigate("/user");
            }

        } catch (err) {
            console.error(err);
            alert("Invalid email or password");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">

                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Welcome Back
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Login
                    </button>
                </form>

                <p
                    className="text-center text-sm text-gray-600 mt-4 cursor-pointer hover:text-blue-600"
                    onClick={() => navigate("/signup")}
                >
                    Don't have an account? Signup
                </p>
            </div>
        </div>
    );
}

export default Login;