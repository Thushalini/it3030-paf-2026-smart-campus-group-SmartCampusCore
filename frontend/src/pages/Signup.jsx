import { useState } from "react";
import { signupUser } from "../api/authService";
import { useNavigate } from "react-router-dom";

function Signup() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "USER" // default role
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
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Create Account
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    <input
                    name="name"
                    placeholder="Full Name"
                    onChange={handleChange}
                    required
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />

                    <input
                    name="email"
                    placeholder="Email Address"
                    onChange={handleChange}
                    required
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />

                    <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    /> <br />

                    <select
                        name="role"
                        onChange={handleChange}
                        value={form.role}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        <option value="TECHNICIAN">Technician</option>
                    </select> <br />

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