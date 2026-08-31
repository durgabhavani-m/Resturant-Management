import { useState } from "react";
import { Utensils, Mail, Lock, Eye, EyeOff } from "lucide-react";
import {useNavigate} from "react-router-dom";

import {useAuth} from "../context/AuthContext";
import type { User, userRole} from "../types/auth";

const demoUsers:  Record<userRole, User> = {
    admin: {
    id: "1",
    name: "Admin User",
    email: "admin@restauranthub.com",
    role: "admin",
  },

  manager: {
    id: "2",
    name: "Manager User",
    email: "manager@restauranthub.com",
    role: "manager",
  },

  staff: {
    id: "3",
    name: "Staff User",
    email: "staff@restauranthub.com",
    role: "staff",
  },
};

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [ email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [ showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e:React.FormEvent) => {
        e.preventDefault();

        setError("");

        const user = Object.values(demoUsers).find(
            (user) => user.email === email
        );

        if(!user || password !== "123456") {
            setError("Invalid email or password.");
            return;
        }

        login(user);
        navigate("/dashboard");
    };

    return(
        <div className="min-h-screen bg-slate-100">

            <div className="flex min-h-screen items-center justify-center px-4 py-8">

                <div className="w-full max-w-md">

                    <div className="mb-8 text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-200">
                            <Utensils size={18}/>
                        </div>

                        <h1 className="mt-4 text-2xl font-bold text-slate-900">
                            ResturantHub
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Resturant Management System
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                        <div className="mb-6">

                            <h2 className="text-xl font-semibold text-slate-900">
                                Welcome Back
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Sign in to manage your restaurant
                            </p>
                        </div>

                        <form
                        onSubmit={handleSubmit}
                        className="space-y-5">

                            <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                                Email
                            </label>

                            <div className="relative">

                                <Mail size={18}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>

                                <input
                                type="email"
                                value={email}
                                onChange={(e)=>setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>
                            </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Password
                                </label>

                                <div className="relative">
                                    <Lock size={18}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>

                                    <input
                                    type={showPassword ? "text" : "password" }
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your Password"
                                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>

                                    <button type="button"
                                    onClick={() => setShowPassword((prev)=>!prev)}
                                    className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"

                                        aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                        }
                                        >
                                        {showPassword ? (
                                            <EyeOff size={18}/>
                                        ): (
                                            <Eye size={18}/>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <button type="submit"
                            className="w-full rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
                                Sign In
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-400">
                        © 2026 RestaurantHub. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};
export default LoginPage;