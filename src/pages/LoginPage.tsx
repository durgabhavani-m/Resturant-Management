import { useState } from "react";
import { LogIn, ShieldCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useStaff } from "../context/StaffContext";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { staff } = useStaff();
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [selectedStaffId, setSelectedStaffId] = useState("");

  const activeStaff = staff.filter(
    (member) => member.status === "Active"
  );

  const handleLogin = () => {
    const selectedStaff = activeStaff.find(
      (member) => member.id === selectedStaffId
    );

    if (!selectedStaff) return;

    login({
      id: selectedStaff.id,
      name: selectedStaff.name,
      email: selectedStaff.email,
      role: selectedStaff.role,
    });

    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-orange-50 via-white to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {/* Logo */}
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
            Signed in as <span className="font-semibold">{user.name}</span>. Select another staff account below to switch.
          </div>
        )}

        {/* Login */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Select Staff Account
          </label>

          <div className="relative">
            <Users
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              value={selectedStaffId}
              onChange={(event) => setSelectedStaffId(event.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="">Select staff member</option>

              {activeStaff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} — {member.role}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogin}
            disabled={!selectedStaffId}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <LogIn size={18} />
            Login
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Access is controlled according to the selected staff role.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;