import { useState } from "react";
import { signupUser } from "../api/authService";
import { useNavigate } from "react-router-dom";

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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signupUser(form);
            alert("Signup successful!");
            navigate("/dashboard");
        } catch (err) {
            alert("Error signing up");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4">
            <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-lg">

                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Create Account
                </h2>

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
                        placeholder="Department (IT, Engineering...)"
                        onChange={handleChange}
                        className="input"
                    />

                    {/* User Type */}
                    <select
                        name="userType"
                        value={form.userType}
                        onChange={handleChange}
                        className="input"
                    >
                        <option value="STUDENT">Student</option>
                        <option value="STAFF">Staff</option>
                    </select>

                    {/* Conditional Fields */}
                    {form.userType === "STUDENT" && (
                        <input
                            name="studentId"
                            placeholder="Student ID"
                            onChange={handleChange}
                            required
                            className="input"
                        />
                    )}

                    {form.userType === "STAFF" && (
                        <input
                            name="staffId"
                            placeholder="Staff ID"
                            onChange={handleChange}
                            required
                            className="input"
                        />
                    )}

                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
                    >
                        Signup
                    </button>

                </form>

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
