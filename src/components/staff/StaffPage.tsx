import { useMemo, useState } from "react";
import { usePersistentState } from "../../hooks/usePersistentState";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";

import type { Permission } from "../../types/permission";
import { useRoles } from "../../context/RoleContext";

import { useStaff } from "../../context/StaffContext";
import { useAppPreferences } from "../../context/AppPreferencesContext";
import { generateTemporaryPassword } from "../../utils/password";
import { sendStaffInvitationEmail } from "../../services/emailService";

import type {
  Staff,
  StaffRole,
  StaffStatus,
} from "../../types/staff";

import StaffStats from "./StaffStats";
import StaffFilters from "./StaffFilters";
import StaffTable from "./StaffTable";
import StaffDialogs from "./StaffDialogs";

const availablePermissions: Permission[] = [
  "dashboard",
  "tables",
  "orders",
  "reservations",
  "billing",
  "menu",
  "reports",
  "staff",
  "settings",
];

const StaffPage = () => {
  const { preferences } = useAppPreferences();
  const {
    staff,
    addStaff,
    updateStaff,
    deleteStaff,
  } = useStaff();


  const [search, setSearch] = usePersistentState(
  "staff_page_search",
  ""
);
  const [role, setRole] = usePersistentState<StaffRole | "All">(
  "staff_page_role_filter",
  "All"
);
 const [status, setStatus] = usePersistentState<StaffStatus | "All">(
  "staff_page_status_filter",
  "All"
);
  const { roles, addRole } = useRoles();
  const [showRoleForm, setShowRoleForm] = usePersistentState<boolean>(
  "staff_page_role_form_open",
  false
);
  const [roleName, setRoleName] = usePersistentState<string>(
  "staff_page_role_name",
  ""
);
 const [rolePermissions, setRolePermissions] =
  usePersistentState<Permission[]>(
    "staff_page_role_permissions",
    []
  );
  const [roleError, setRoleError] = useState("");

  //action menu state

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuMember, setMenuMember] = useState<Staff | null>(null);

  //dialog state

  const [selectedStaffId, setSelectedStaffId] =
  usePersistentState<string | number | null>(
    "staff_page_selected_staff_id",
    null
  );

 const selectedStaff: Staff | null =
  staff.find(
    (member) => String(member.id) === String(selectedStaffId)
  ) ?? null;

  const [showForm, setShowForm] = usePersistentState("staff_page_form_open",false);

 const [editingStaffId, setEditingStaffId] =
  usePersistentState<string | number | null>(
    "staff_page_editing_staff_id",
    null
  );

  const editingStaff: Staff | null =
  staff.find(
    (member) => String(member.id) === String(editingStaffId)
  ) ?? null;

  //form fields

  const [name, setName] = usePersistentState("staff_form_name", "");
  const [email, setEmail] = usePersistentState("staff_form_email", "");
  const [phone, setPhone] = usePersistentState("staff_form_phone", "");
 const [password, setPassword] = usePersistentState("staff_form_password", "");
  const [formRole, setFormRole] =
  usePersistentState<StaffRole>(
    "staff_form_role",
    "Dine-in Staff"
  );
  const [formStatus, setFormStatus] =
  usePersistentState<StaffStatus>(
    "staff_form_status",
    "Active"
  );

  const [formErrors, setFormErrors] =
    useState<{
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
    }>({});

 //FILTER STAFF

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const searchText = search.toLowerCase();

      const matchesSearch = 
        member.name.toLowerCase().includes(searchText) ||
        member.email.toLowerCase().includes(searchText) ||
        member.phone.includes(searchText);

      const matchesRole =
        role === "All" ||
        member.role === role;

      const matchesStatus =
        status === "All" ||
        member.status === status;

      return (
        matchesSearch && matchesRole && matchesStatus
      );
    });
  }, [staff, search, role, status]);
 
  // ACTION MENU

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    member: Staff
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuMember(member);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setMenuMember(null);
  };

  //VIEW STAFF

  const handleViewStaff = (member: Staff) => {
    setSelectedStaffId(member.id);
    handleMenuClose();
  };

  //DELETE STAFF

  const handleDeleteStaff = (member: Staff) => {
    if (
      preferences.confirmBeforeDelete &&
      !window.confirm(`Are you sure you want to delete ${member.name}?`)
    ) {
      return;
    }
    deleteStaff(member.id);
    handleMenuClose();
  };

  //RESET FORM

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setFormRole("Dine-in Staff");
    setFormStatus("Active");
    setFormErrors({});
    setEditingStaffId(null);
  };

  //ADD STAFF

  const handleAddStaff = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenRoleForm = () => {
    setRoleName("");
    setRolePermissions([]);
    setRoleError("");
    setShowRoleForm(true);
  };

  const handleCloseRoleForm = () => {
    setShowRoleForm(false);
    setRoleName("");
    setRolePermissions([]);
    setRoleError("");
  }

  const handlePermissionChange = (
    permission: Permission
  ) => {
    setRolePermissions((current) => 
      current.includes(permission)
      ? current.filter((item) => item !== permission)
      : [...current,permission] 
    );
  };

  const handleSaveRole = () =>{
    if(!roleName.trim()) {
      setRoleError("Role name is required.");
      return;
    }

    if(rolePermissions.length === 0){
      setRoleError("Select at least one permission.");
      return;
    }

    const added = addRole(
      roleName.trim(),
      rolePermissions
    );
    if(!added){
      setRoleError("A role with this name already exists.");
      return;
    }
    handleCloseRoleForm();
  }

  //EDIT STAFF

  const handleEditStaff = (member: Staff) => {
    setEditingStaffId(member.id);
    setName(member.name);
    setEmail(member.email);
    setPhone(member.phone);

    // Don't show the existing password.
    setPassword("");
    setFormRole(member.role);
    setFormStatus(member.status);
    setFormErrors({});
    handleMenuClose();
    setShowForm(true);
  };

  //SAVE STAFF

  const handleSaveStaff = async () => {
    const errors: {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
    } = {};

    //NAME VALIDATION

    if (!name.trim()) {
      errors.name = "Name is required.";
    }

    //EMAIL VALIDATION

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {
      errors.email = "Enter a valid email address.";
    }

    //PHONE VALIDATION

    if (!phone.trim()) {
      errors.phone = "Phone number is required.";
    }

    // PASSWORD VALIDATION

   if (editingStaff && password && password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
   }

    //DUPLICATE EMAIL

    const duplicateEmail = staff.some(
      (member) =>
        member.id !== editingStaff?.id &&
        member.email.trim().toLowerCase() === email.trim().toLowerCase()
    );

    if (duplicateEmail) {
      errors.email =
        "This email is already assigned to another staff account.";
    }

   //STOP IF VALIDATION FAILED

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

   //UPDATE EXISTING STAFF

    if (editingStaff) {
      const updatedStaff: Staff = {
        ...editingStaff,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: formRole,
        status: formStatus,
        ...(password
          ? { password }
          : {}),
      };

      const updated = updateStaff(
        updatedStaff
      );

      if (!updated) {
        setFormErrors({
          email:
            "This email is already assigned to another staff account.",
        });
        return;
      }
    }

    //ADD NEW STAFF

    else {

      const temporaryPassword = generateTemporaryPassword();

      const newStaff: Omit<Staff,"id"> = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: formRole,
        status: formStatus,
        createdAt:new Date().toISOString(),
        password: temporaryPassword,
        passwordSet: true,
        mustResetPassword: true,
      };

      const added = addStaff(newStaff);

      if (!added) {
        setFormErrors({
          email:
            "This email is already assigned to another staff account.",
        });
        return;
      }
      try{
        await sendStaffInvitationEmail({
          email: email.trim(),
          staff_name: name.trim(),
          staff_email: email.trim(),
          temporary_password: temporaryPassword,
        });
      }catch(error){
        console.error("Failed to send staff invitation email:", error);

        setFormErrors({
          email:
          "Staff was added, but the invitation email could not be sent.",
        })
      }
    }

   //CLOSE FORM

    setShowForm(false);
    resetForm();
  };


  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        bgcolor: "background.default",
        p: {
          xs: 2,
          md: 3,
        },
      }}>

      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            sm: "center",
          },
          justifyContent:
            "space-between",

          gap: 2,
        }}>

        <Box>
          <Typography variant="h1">
            Staff Management
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage restaurant staff and their roles.
          </Typography>
        </Box>

        {/* ONLY ADD STAFF BUTTON */}
        <Box sx = {{display: "flex", gap: 1}}>
          <Button variant="outlined"
          onClick={handleOpenRoleForm}>
            Add Role
          </Button>
          <Button variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddStaff}>
            Add Staff
          </Button>
        </Box>
      </Box>

      <StaffStats staff={staff}/>

      <StaffFilters
        search={search}
        role={role}
        status={status}
        roles={roles}
        onSearchChange={setSearch}
        onRoleChange={setRole}
        onStatusChange={setStatus}
      />

      <StaffTable
        staff={filteredStaff}
        menuAnchorEl={menuAnchorEl}
        menuMember={menuMember}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
        onView={handleViewStaff}
        onEdit={handleEditStaff}
        onDelete={handleDeleteStaff}
      />

      <StaffDialogs
        selectedStaff={selectedStaff}
        showForm={showForm}
        editingStaff={editingStaff}

        name={name}
        email={email}
        phone={phone}

        formRole={formRole}
        formStatus={formStatus}

        formErrors={formErrors}

        onCloseDetails={() =>
          setSelectedStaffId(null)
        }

        onCloseForm={() => {
          setShowForm(false);
          resetForm();
        }}

        onNameChange={(value) => {
          setName(value);

          if (formErrors.name) {
            setFormErrors((previous) => ({
              ...previous,
              name: undefined,
            }));
          }
        }}

        onEmailChange={(value) => {
          setEmail(value);

          if (formErrors.email) {
            setFormErrors((previous) => ({
              ...previous,
              email: undefined,
            }));
          }
        }}

        onPhoneChange={(value) => {
          setPhone(value);

          if (formErrors.phone) {
            setFormErrors((previous) => ({
              ...previous,
              phone: undefined,
            }));
          }
        }}

        onRoleChange={setFormRole}
        onStatusChange={setFormStatus}
        onSave={handleSaveStaff}
      />

      <Dialog 
      open={showRoleForm}
      onClose={handleCloseRoleForm}
      fullWidth
      maxWidth="sm"
      >

        <DialogTitle>Add Role</DialogTitle>

        <DialogContent>
          <TextField
          fullWidth
          label="Role Name"
          value={roleName}
          onChange={(event) => {
            setRoleName(event.target.value);
            setRoleError("");
          }}
          margin="normal"
          placeholder="Example: Manager"
          />

           <Typography
           variant="subtitle1"
           sx={{ mt: 2, mb: 1 }}
           >
              Permissions
           </Typography>

           <FormGroup>
            {availablePermissions.map((permission) => (
              <FormControlLabel
              key={permission}
              control={
              <Checkbox
              checked={rolePermissions.includes(permission)}
              onChange={() =>
                handlePermissionChange(permission)
              }/>
             }
             label={permission}
             />
             ))}
             </FormGroup>
             
             {roleError && (
              <Typography
              color="error"
              variant="body2"
              sx={{ mt: 1 }}
              >
                {roleError}
                </Typography>
              )}
              </DialogContent>
              
              <DialogActions>
                <Button onClick={handleCloseRoleForm}>
                  Cancel
                </Button>

                <Button
                variant="contained"
                onClick={handleSaveRole}
                >
                  Create Role
                  </Button>
            </DialogActions>
      </Dialog>

    </Box>
  );
};

export default StaffPage;