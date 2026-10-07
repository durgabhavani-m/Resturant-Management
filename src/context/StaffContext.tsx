import { createContext, useContext, useEffect, useState} from "react";
import type { Staff } from "../types/staff";
import {normalizeRecordId} from "../utils/recordIds";
import {
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    DEFAULT_STAFF_PASSWORD,
} from "../config/adminCredentials";

const STAFF_STORAGE_KEY = "restaurant_staff";
const DEFAULT_STAFF_EMAILS = new Set([
    "rahul@restaurant.com",
    "priya@restaurant.com",
    "sharma@restaurant.com",
    "preethi@restaurant.com",
]);

const getNextStaffId = (members: Staff[]) => {
    const highestId = members.reduce((highest, member) => {
        const match = /^STAFF-(\d+)$/.exec(member.id);
        return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    return `STAFF-${highestId + 1}`;
};

const normalizeStoredStaff = (members: Staff[]) => {
    const reservedIds = new Set(
        members
            .map((member) => normalizeRecordId(member.id, "STAFF"))
            .filter((id) => /^STAFF-\d+$/.test(id))
    );
    const assignedIds = new Set<string>();
    let nextId = 1;

    return members.map((member) => {
        const id = normalizeRecordId(member.id, "STAFF");
        const isAdminAccount = member.email.trim().toLowerCase() === ADMIN_EMAIL;
        const isSequentialId = /^STAFF-\d+$/.test(id);
        let staffId = id;

        if (!isSequentialId || assignedIds.has(staffId)) {
            while (reservedIds.has(`STAFF-${nextId}`) || assignedIds.has(`STAFF-${nextId}`)) {
                nextId += 1;
            }
            staffId = `STAFF-${nextId}`;
            nextId += 1;
        }
        assignedIds.add(staffId);

        const normalizedMember = {
            ...member,
            id: staffId,
            ...(isAdminAccount
                ? {status: "Active" as const, password: member.password || ADMIN_PASSWORD}
                : {}),
            ...(DEFAULT_STAFF_EMAILS.has(member.email.trim().toLowerCase()) && !member.password
                ? {password: DEFAULT_STAFF_PASSWORD}
                : {}),
        };
        delete (normalizedMember as Staff & {passwordHash?: string}).passwordHash;
        return normalizedMember;
    });
};

const initialStaff: Staff[] = [
    {
    id: "STAFF-1",
    name: "Admin User",
    email: ADMIN_EMAIL,
    phone: "9876543210",
    role: "Admin",
    status: "Active",
    createdAt: new Date().toISOString(),
    password: ADMIN_PASSWORD,
  },
  {
    id: "STAFF-2",
    name: "Rahul Kumar",
    email: "rahul@restaurant.com",
    phone: "9876543211",
    role: "Dine-in Staff",
    status: "Active",
    createdAt: new Date().toISOString(),
    password: DEFAULT_STAFF_PASSWORD,
  },
  {
    id: "STAFF-3",
    name: "Priya Sharma",
    email: "priya@restaurant.com",
    phone: "9876543212",
    role: "Counter Staff",
    status: "Active",
    createdAt: new Date().toISOString(),
    password: DEFAULT_STAFF_PASSWORD,
  },
  {
    id: "STAFF-4",
    name: "Sharma",
    email: "sharma@restaurant.com",
    phone: "9876543212",
    role: "Dine-in Staff",
    status: "Active",
    createdAt: new Date().toISOString(),
    password: DEFAULT_STAFF_PASSWORD,
  },
  {
    id: "STAFF-5",
    name: "Preethi",
    email: "preethi@restaurant.com",
    phone: "9876543212",
    role: "Counter Staff",
    status: "Active",
    createdAt: new Date().toISOString(),
    password: DEFAULT_STAFF_PASSWORD,
  },
]

interface StaffContextType{
    staff: Staff[];
    setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
    addStaff:(newStaff: Omit<Staff, "id">) => boolean;
    updateStaff: (updatedStaff: Staff) => boolean;
    deleteStaff: (staffId: string) => void;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const StaffProvider = ({
    children,
}:{
    children: React.ReactNode;
}) => {
    const [ staff, setStaff ] = useState<Staff[]>(() => {
        const storedStaff = localStorage.getItem(STAFF_STORAGE_KEY);

        if(storedStaff) {
            const parsedStaff = JSON.parse(storedStaff) as Staff[];
            return normalizeStoredStaff(parsedStaff);
        }
        return initialStaff;
    });

    useEffect(() => {
        localStorage.setItem(STAFF_STORAGE_KEY,JSON.stringify(staff));
    },[staff]);

    useEffect(() => {
        const syncStaff = (event: StorageEvent) => {
            if (event.key !== STAFF_STORAGE_KEY || !event.newValue) return;

            try {
                const parsedStaff = JSON.parse(event.newValue) as Staff[];
                const normalizedStaff = normalizeStoredStaff(parsedStaff);
                setStaff((currentStaff) =>
                    JSON.stringify(currentStaff) === JSON.stringify(normalizedStaff)
                        ? currentStaff
                        : normalizedStaff
                );
            } catch {
                return;
            }
        };

        window.addEventListener("storage", syncStaff);
        return () => window.removeEventListener("storage", syncStaff);
    }, []);

    const addStaff = (newStaff: Omit<Staff, "id">): boolean => {
        if (staff.some((member) =>
            member.email.trim().toLowerCase() === newStaff.email.trim().toLowerCase()
        )) return false;

        setStaff((prev) => [
            ...prev,
            {...newStaff, id: getNextStaffId(prev)},
        ]);
        return true;
    };

    const updateStaff = (updatedStaff: Staff): boolean => {
        if (staff.some((member) =>
            member.id !== updatedStaff.id &&
            member.email.trim().toLowerCase() === updatedStaff.email.trim().toLowerCase()
        )) return false;

        const staffToSave = updatedStaff.email.trim().toLowerCase() === ADMIN_EMAIL
            ? {
                ...updatedStaff,
                status: "Active" as const,
                password: updatedStaff.password || ADMIN_PASSWORD,
            }
            : updatedStaff;

        setStaff((prev) => 
        prev.map((member) => 
        member.id === staffToSave.id ? staffToSave : member));
        return true;
    };

    const deleteStaff = (staffId: string) => {
        setStaff((prev) => 
        prev.filter((member) => member.id !== staffId));
    };

    return (
        <StaffContext.Provider value = {{
            staff,
            setStaff,
            addStaff,
            updateStaff,
            deleteStaff,
        }}>
            {children}
        </StaffContext.Provider>
    );
};

export const useStaff = () => {
    const context = useContext(StaffContext);

    if(!context){
        throw new Error("useStaff must be used inside StaffProvider");
    }
    return context;
}