import { useState } from "react";
import { signupUser } from "../api/authService";
import { useNavigate } from "react-router-dom";

import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

function Signup() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        department: "",
        userType: "STUDENT",
        studentId: "",
        staffId: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // -------------------------
    // Manual signup
    // -------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signupUser(form);

            alert("Signup successful!");
            navigate("/");
        } catch (err) {
            console.error(err);
            setError("Signup failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    // -------------------------
    // Google signup/login
    // -------------------------
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);

            console.log("Google user:", decoded);

            // 👉 SEND TO BACKEND (RECOMMENDED)
            // await googleAuthAPI(credentialResponse.credential);

            alert("Google login successful!");

            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError("Google signup failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">

            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg">

                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Create Account
                </h2>

                {error && (
                    <p className="text-red-500 text-sm text-center mb-3">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <input
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        required
                        className="input"
                    />

                    <input
                        name="email"
                        placeholder="Email Address"
                        onChange={handleChange}
                        required
                        className="input"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                        className="input"
                    />

                    <input
                        name="phone"
                        placeholder="Phone Number"
                        onChange={handleChange}
                        className="input"
                    />

                    <input
                        name="department"
                        placeholder="Department"
                        onChange={handleChange}
                        className="input"
                    />

                    <select
                        name="userType"
                        value={form.userType}
                        onChange={handleChange}
                        className="input"
                    >
                        <option value="STUDENT">Student</option>
                        <option value="STAFF">Staff</option>
                    </select>

                    {form.userType === "STUDENT" && (
                        <input
                            name="studentId"
                            placeholder="Student ID"
                            onChange={handleChange}
                            className="input"
                        />
                    )}

                    {form.userType === "STAFF" && (
                        <input
                            name="staffId"
                            placeholder="Staff ID"
                            onChange={handleChange}
                            className="input"
                        />
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
                    >
                        {loading ? "Creating Account..." : "Signup"}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-5 text-center text-gray-400">
                    OR
                </div>

                {/* Google Signup */}
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Google signup failed")}
                    />
                </div>

                <p
                    className="text-center text-sm text-gray-600 mt-5 cursor-pointer hover:text-blue-600"
                    onClick={() => navigate("/")}
                >
                    Already have an account? <span className="font-medium">Login</span>
                </p>

            </div>
        </div>
    );
}

export default Signup;