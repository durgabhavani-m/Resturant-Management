import {Search, Plus, MoreHorizontal, Eye, Pencil, Trash2, Users,} from "lucide-react";
import {useState, useMemo} from "react";
import {useStaff} from "../context/StaffContext";
import type {Staff, StaffRole, StaffStatus} from "../types/staff";

const StaffPage = () => {
    const{staff, addStaff, updateStaff, deleteStaff} = useStaff();

    const[search, setSearch] = useState("");
    const[role, setRole] = useState<StaffRole | "All">("All");
    const[status,setStatus] = useState<StaffStatus | "All">("All");

    const[openMenuId, setOpenMenuId] = useState<string | null>(null);
    const[selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    const[showForm, setShowForm] = useState(false);
    const[editingStaff, setEditingStaff] = useState<Staff | null>(null);

    const[name, setName] = useState("");
    const[email, setEmail] = useState("");
    const[phone, setPhone] = useState("");
    const[password, setPassword] = useState("");
    const[formRole, setFormRole] = useState<StaffRole>("Dine-in Staff");
    const[formStatus, setFormStatus] = useState<StaffStatus>("Active");

    const[formErrors, setFormErrors] = useState<{
        name?: string;
        email?: string;
        phone?: string;
        password?: string;
    }>({});

    const filteredStaff = useMemo(() => {
        return staff.filter((member) => {
            const searchText =  search.toLowerCase();

            const matchesSearch = 
            member.name.toLowerCase().includes(searchText) ||
            member.email.toLowerCase().includes(searchText) ||
            member.phone.includes(searchText);

            const matchesRole = role === "All" || member.role  === role;

            const matchesStatus = status === "All" || member.status === status;

            return matchesSearch && matchesRole && matchesStatus;
        });
    },[staff, search, role, status]);

    const handleViewStaff = (member: Staff) => {
        setSelectedStaff(member);
        setOpenMenuId(null);
    };

    const handleDeleteStaff = (member: Staff) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${member.name}?`
        );

        if(!confirmed) return;

        deleteStaff(member.id);
        setOpenMenuId(null);
    };

    const getInitials = (name: string) => {
        return name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0,2)
        .toUpperCase();
    };

    const getRoleStyle = (staffRole: StaffRole) => {
        switch (staffRole) {
            case "Admin":
                return "bg-purple-50 text-purple-700";
            case "Dine-in Staff":
                return "bg-blue-50 text-blue-700";
            case "Counter Staff":
                return "bg-orange-50 text-orange-700";
            default:
                return "bg-slate-50 text-slate-700";
        }
    };

    const getStatusStyle = (staffStatus: StaffStatus) => {
        switch(staffStatus) {
            case "Active":
                return "bg-emerald-50 text-emerald-700";
            case "Inactive":
                return "bg-slate-100 text-slate-600";
            default:
                return "bg-slate-50 text-slate-700";
        }
    };

    const resetForm = () => {
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setFormRole("Dine-in Staff");
        setFormStatus("Active");
        setFormErrors({});
        setEditingStaff(null);
    };

    const handleAddStaff = () => {
        resetForm();
        setShowForm(true);
    };

    const handleEditStaff = (member: Staff) => {
        setEditingStaff(member);

        setName(member.name);
        setEmail(member.email);
        setPhone(member.phone);
        setPassword("");
        setFormRole(member.role);
        setFormStatus(member.status);

        setFormErrors({});
        setOpenMenuId(null);
        setShowForm(true);
    };

    const handleSaveStaff = () => {
        const errors: {
            name?: string;
            email?: string;
            phone?: string;
            password?: string;
        } = {};

        if(!name.trim()){
            errors.name = "Name is required.";
        }

        if(!email.trim()){
            errors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            errors.email = "Enter a valid email address.";
        }

        if(!phone.trim()){
            errors.phone = "Phone number is required.";
        }

        if ((!editingStaff || !editingStaff.password) && !password) {
            errors.password = "Password is required for this login account.";
        } else if (password && password.length < 8) {
            errors.password = "Password must be at least 8 characters.";
        }

        if (staff.some((member) =>
            member.id !== editingStaff?.id &&
            member.email.trim().toLowerCase() === email.trim().toLowerCase()
        )) {
            errors.email = "This email is already assigned to another staff account.";
        }

        if(Object.keys(errors).length > 0){
            setFormErrors(errors);
            return;
        }

        if(editingStaff){
            const updatedStaff: Staff = {
                ...editingStaff,
                name:name.trim(),
                email:email.trim(),
                phone:phone.trim(),
                role:formRole,
                status:formStatus,
                ...(password ? {password} : {}),
            };
            if (!updateStaff(updatedStaff)) {
                setFormErrors({email: "This email is already assigned to another staff account."});
                return;
            }
        }else{
            const newStaff: Omit<Staff, "id"> = {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                role: formRole,
                status: formStatus,
                createdAt: new Date().toISOString(),
                password,
            };
            if (!addStaff(newStaff)) {
                setFormErrors({email: "This email is already assigned to another staff account."});
                return;
            }
        }
        setShowForm(false);
        resetForm();
    }

    return(
        <div className="flex h-full min-h-0 flex-col bg-slate-50 p-4 md:p-6">

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Staff Magagement
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                         Manage restaurant staff and their roles.
                    </p>
                </div>

                <button
                type="button"
                onClick={handleAddStaff}
                className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700">
                    <Plus size={18}/>
                    Add Staff
                </button>
            </div>


            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Staff</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-800">
                                {staff.length}
                            </p>
                        </div>

                        <div className="rounded-lg bg-orange-50 p-3 text-orange-600">
                            <Users size={22}/>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Active Staff</p>
                    <p className="mt-1 text-2xl font-semibold text-emerald-600">
                        {staff.filter((member) => member.status === "Active").length}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Inactive Staff</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-600">
                        {staff.filter((member) => member.status === "Inactive").length}
                    </p>
                </div>
            </div>

            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row">

                    <div className="relative flex-1">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>

                        <input
                        type="text"
                        placeholder="Search Staff..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"/>

                    </div>

                    <select
                    value={role}
                    onChange={(event) => setRole(event.target.value as StaffRole | "All")}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus-within:border-orange-500">
                        <option value="All">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Dine-in Staff">Dine-in Staff</option>
                        <option value="Counter Staff">Counter Staff</option>
                    </select>

                    <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as StaffStatus | "All")}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-500">
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>


            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="min-h-0 flex-1 overflow-auto">
                    <table className="w-full min-w-225">
                        <thead className="sticky top-0 z-10 bg-white">
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Staff
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Contact
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Role
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Status
                                </th>

                                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                   Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredStaff.length === 0 ? (
                                <tr>
                                    <td colSpan={5}
                                    className="px-5 py-12 text-center text-sm text-slate-500">
                                        No Staff found
                                    </td>
                                </tr>
                                ):(
                                    filteredStaff.map((member) => (
                                        <tr key = {member.id}
                                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
                                                        {getInitials(member.name)}
                                                    </div>

                                                    <div>
                                                        <p className="font-medium text-slate-800">
                                                            {member.name}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            Staff ID: {member.id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="text-sm text-slate-700">
                                                    {member.email}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    {member.phone}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span 
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getRoleStyle(member.role)}`}>
                                                    {member.role}
                                                </span>
                                            </td> 

                                            <td className="px-5 py-4">
                                                <span 
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(member.status)}`}>
                                                    {member.status}
                                                </span>
                                            </td> 

                                            <td className="relative px-5 py-4 text-left">
                                                <button
                                                type="button"
                                                onClick={() => 
                                                    setOpenMenuId(
                                                        openMenuId === member.id
                                                        ? null
                                                        : member.id
                                                    )
                                                }
                                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
                                                    <MoreHorizontal size={20}/>
                                                </button>

                                                {openMenuId === member.id && (
                                                    <div className="absolute right-5 top-14 z-50 w-40 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg">
                                                        <button
                                                        type="button"
                                                        onClick={() => handleViewStaff(member)}
                                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                                                            <Eye size={16}/>
                                                            View Details
                                                        </button>

                                                        <button
                                                        type="button"
                                                        onClick={() => handleEditStaff(member)}
                                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                                                            <Pencil size={16}/>
                                                            Edit
                                                        </button>

                                                        <button
                                                        type="button"
                                                        onClick={() => handleDeleteStaff(member)}
                                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                                                            <Trash2 size={16}/>
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>                                          
                                        </tr>
                                    ))
                                )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedStaff && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 pl-10">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Header */}
            <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-800">
                    Staff Details
                </h2>
            </div>

            {/* Profile */}
            <div className="px-5 py-5">

                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-base font-semibold text-orange-700">
                        {getInitials(selectedStaff.name)}
                    </div>

                    <div className="min-w-0">
                        <p className="text-base font-semibold text-slate-800">
                            {selectedStaff.name}
                        </p>

                        <p className="mt-0.5 text-sm text-slate-500">
                            {selectedStaff.role}
                        </p>
                    </div>
                </div>

                {/* Details */}
                <div className="mt-6 space-y-4">

                    <div>
                        <p className="text-xs font-medium text-slate-400">
                            Email
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                            {selectedStaff.email}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-slate-400">
                            Phone
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                            {selectedStaff.phone}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-slate-400">
                            Status
                        </p>

                        <span
                            className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                                selectedStaff.status
                            )}`}
                        >
                            {selectedStaff.status}
                        </span>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">
                <button
                    type="button"
                    onClick={() => setSelectedStaff(null)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    Close
                </button>
            </div>

        </div>
    </div>
)}
            
{showForm && (
  <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-800">
          {editingStaff ? "Edit Staff" : "Add Staff"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {editingStaff
            ? "Update staff member information."
            : "Add a new staff member to your restaurant."}
        </p>
      </div>

      {/* Form */}
      <div className="space-y-4 px-6 py-5">
        {/* Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);

              if (formErrors.name) {
                setFormErrors((prev) => ({
                  ...prev,
                  name: undefined,
                }));
              }
            }}
            placeholder="Enter staff name"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
              formErrors.name
                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            }`}
          />

          {formErrors.name && (
            <p className="mt-1 text-xs text-red-600">
              {formErrors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);

              if (formErrors.email) {
                setFormErrors((prev) => ({
                  ...prev,
                  email: undefined,
                }));
              }
            }}
            placeholder="staff@example.com"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
              formErrors.email
                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            }`}
          />

          {formErrors.email && (
            <p className="mt-1 text-xs text-red-600">
              {formErrors.email}
            </p>
          )}
        </div>

                {/* Login password */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        {editingStaff?.password ? "New password (optional)" : "Login password"}
                    </label>
                    <input
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            if (formErrors.password) {
                                setFormErrors((prev) => ({...prev, password: undefined}));
                            }
                        }}
                        placeholder={editingStaff?.password ? "Leave blank to keep current password" : "At least 8 characters"}
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
                            formErrors.password
                                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                                : "border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        }`}
                    />
                    {formErrors.password && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>
                    )}
                </div>

        {/* Phone */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Phone
          </label>

          <input
            type="tel"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);

              if (formErrors.phone) {
                setFormErrors((prev) => ({
                  ...prev,
                  phone: undefined,
                }));
              }
            }}
            placeholder="Enter phone number"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
              formErrors.phone
                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                : "border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            }`}
          />

          {formErrors.phone && (
            <p className="mt-1 text-xs text-red-600">
              {formErrors.phone}
            </p>
          )}
        </div>

        {/* Role + Status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Role
            </label>

            <select
              value={formRole}
              onChange={(event) =>
                setFormRole(event.target.value as StaffRole)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="Admin">Admin</option>
              <option value="Dine-in Staff">Dine-in Staff</option>
              <option value="Counter Staff">Counter Staff</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              value={formStatus}
              onChange={(event) =>
                setFormStatus(event.target.value as StaffStatus)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveStaff}
          className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700"
        >
          {editingStaff ? "Update Staff" : "Add Staff"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
);
};
export default StaffPage;