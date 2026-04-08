import React, { useState } from "react";
import { loginUser } from "../api/authService";
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

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
            localStorage.setItem("token", res.data.token);

            alert("Login successful!");
            navigate("/dashboard");

        } catch (err) {
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