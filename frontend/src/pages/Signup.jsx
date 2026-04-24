import { useState, useContext } from "react";
import { signupUser } from "../api/authService";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";

function Signup() {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

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

    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});  // ✅ field-level errors
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ Validation rules
    const validate = () => {
        const newErrors = {};

        // Name
        if (!form.name.trim()) {
            newErrors.name = "Full name is required";
        } else if (form.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(form.email)) {
            newErrors.email = "Enter a valid email address";
        }

        // Password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!form.password) {
            newErrors.password = "Password is required";
        } else if (!passwordRegex.test(form.password)) {
            newErrors.password = "Min 8 chars, include uppercase, lowercase, number & special character";
        }

        // Confirm Password
        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (form.password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        // Phone (optional but validated if provided)
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
        if (form.phone && !phoneRegex.test(form.phone)) {
            newErrors.phone = "Enter a valid phone number";
        }

        // Department
        if (!form.department.trim()) {
            newErrors.department = "Department is required";
        }

        // Student/Staff ID
        if (form.userType === "STUDENT") {
            if (!form.studentId.trim()) {
                newErrors.studentId = "Student ID is required";
            } else if (!/^[A-Za-z0-9\-]{4,20}$/.test(form.studentId)) {
                newErrors.studentId = "Enter a valid Student ID (4–20 alphanumeric characters)";
            }
        }

        if (form.userType === "STAFF") {
            if (!form.staffId.trim()) {
                newErrors.staffId = "Staff ID is required";
            } else if (!/^[A-Za-z0-9\-]{4,20}$/.test(form.staffId)) {
                newErrors.staffId = "Enter a valid Staff ID (4–20 alphanumeric characters)";
            }
        }

        return newErrors;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        // ✅ Clear field error on change
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // ✅ Run validation before submitting
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            await signupUser(form);
            alert("Signup successful!");
            navigate("/");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Signup failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await axios.post("http://localhost:8080/api/auth/google", {
                token: credentialResponse.credential,
            });
            sessionStorage.setItem("token", res.data.token);
            login(res.data);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            console.error("Google signup error:", err);
            setError("Google signup failed");
        }
    };

    // ✅ Reusable error message component
    const FieldError = ({ field }) =>
        errors[field] ? (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors[field]}
            </p>
        ) : null;

    // ✅ Helper to add red border on error
    const inputClass = (field) =>
        `w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-sm text-gray-800 ${
            errors[field]
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-200 focus:ring-indigo-500"
        }`;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 relative overflow-hidden py-10">

            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-[150px] opacity-40"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-[150px] opacity-40"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20"
            >
                <div className="text-center mb-8">
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                        Create Account
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-gray-500 mt-2"
                    >
                        Join the smart campus platform today
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

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Full Name */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Full Name</label>
                            <input name="name" placeholder="John Doe" onChange={handleChange} className={inputClass("name")} />
                            <FieldError field="name" />
                        </motion.div>

                        {/* Email */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Email Address</label>
                            <input name="email" type="email" placeholder="name@example.com" onChange={handleChange} className={inputClass("email")} />
                            <FieldError field="email" />
                        </motion.div>

                        {/* Password */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Password</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    onChange={handleChange}
                                    className={`${inputClass("password")} pr-12`}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-indigo-600 transition-colors">
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                    )}
                                </button>
                            </div>
                            <FieldError field="password" />
                        </motion.div>

                        {/* Confirm Password */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                                    }}
                                    className={`${inputClass("confirmPassword")} pr-12`}
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-indigo-600 transition-colors">
                                    {showConfirmPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                    )}
                                </button>
                            </div>
                            <FieldError field="confirmPassword" />
                        </motion.div>

                        {/* Phone */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                                Phone Number <span className="text-gray-400 normal-case font-normal">(optional)</span>
                            </label>
                            <input name="phone" placeholder="+1 234 567 890" onChange={handleChange} className={inputClass("phone")} />
                            <FieldError field="phone" />
                        </motion.div>

                        {/* Department */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Department</label>
                            <input name="department" placeholder="e.g. Computer Science" onChange={handleChange} className={inputClass("department")} />
                            <FieldError field="department" />
                        </motion.div>

                        {/* User Type */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">User Type</label>
                            <div className="relative">
                                <select name="userType" value={form.userType} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm text-gray-800 appearance-none">
                                    <option value="STUDENT">Student</option>
                                    <option value="STAFF">Staff</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </motion.div>

                        {/* Student / Staff ID */}
                        <AnimatePresence mode="popLayout">
                            {form.userType === "STUDENT" && (
                                <motion.div key="studentId" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Student ID</label>
                                    <input name="studentId" placeholder="e.g. S1234567" onChange={handleChange} className={inputClass("studentId")} />
                                    <FieldError field="studentId" />
                                </motion.div>
                            )}
                            {form.userType === "STAFF" && (
                                <motion.div key="staffId" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Staff ID</label>
                                    <input name="staffId" placeholder="e.g. STF-9876" onChange={handleChange} className={inputClass("staffId")} />
                                    <FieldError field="staffId" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Password strength indicator */}
                    {form.password && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium">Password strength:</p>
                            <div className="flex gap-1">
                                {[
                                    form.password.length >= 8,
                                    /[A-Z]/.test(form.password),
                                    /[0-9]/.test(form.password),
                                    /[@$!%*?&]/.test(form.password),
                                ].map((met, i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${met ? "bg-green-400" : "bg-gray-200"}`} />
                                ))}
                            </div>
                            <div className="flex gap-3 text-xs text-gray-400 flex-wrap">
                                <span className={/[A-Z]/.test(form.password) ? "text-green-500" : ""}>✓ Uppercase</span>
                                <span className={/[0-9]/.test(form.password) ? "text-green-500" : ""}>✓ Number</span>
                                <span className={/[@$!%*?&]/.test(form.password) ? "text-green-500" : ""}>✓ Special char</span>
                                <span className={form.password.length >= 8 ? "text-green-500" : ""}>✓ 8+ chars</span>
                            </div>
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className={`w-full mt-2 text-white py-3 flex items-center justify-center rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-300
                            ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600"}`}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Account...
                            </span>
                        ) : "Create Account"}
                    </motion.button>
                </form>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="my-6 flex items-center justify-center text-gray-400 text-sm">
                    <span className="h-px w-full bg-gray-200"></span>
                    <span className="px-3 font-medium text-gray-400">OR</span>
                    <span className="h-px w-full bg-gray-200"></span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex justify-center">
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError("Google signup failed")} />
                </motion.div>

                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <span className="font-semibold text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors" onClick={() => navigate("/")}>
                        Sign in
                    </span>
                </motion.p>
            </motion.div>
        </div>
    );
}

export default Signup;