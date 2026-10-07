import { useState } from "react";
import { KeyRound, LogIn, Mail, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useStaff } from "../context/StaffContext";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { staff } = useStaff();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const activeStaff = staff.filter(
    (member) => member.status === "Active"
  );

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");

    const normalizedEmail = email.trim().toLowerCase();
    const selectedStaff = activeStaff.find(
      (member) => member.email.trim().toLowerCase() === normalizedEmail
    );

    if (!selectedStaff || selectedStaff.password !== password) {
      setLoginError("Email or password is incorrect, or this account is inactive.");
      return;
    }

    login({
      id: selectedStaff.id,
      name: selectedStaff.name,
      email: selectedStaff.email,
      role: selectedStaff.role,
    });

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-600 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white">
            <ShieldCheck size={28} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            RestruHub
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Restaurant Management System
          </p>
        </div>

        {user && (
          <div className="mb-5 rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-800">
            Signed in as <span className="font-semibold">{user.name}</span>. Sign in with another staff account to switch.
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <div className="relative mb-4">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@restaurant.com"
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="relative">
            <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {loginError && (
            <p role="alert" className="mt-3 text-sm font-medium text-red-600">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={!email.trim() || !password}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <LogIn size={18} />
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;