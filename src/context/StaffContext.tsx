import { createContext, useContext, useEffect, useState} from "react";
import type { Staff } from "../types/staff";
import {normalizeRecordId} from "../utils/recordIds";

const STAFF_STORAGE_KEY = "restaurant_staff";

const initialStaff: Staff[] = [
    {
    id: "STAFF-1",
    name: "Admin User",
    email: "admin@restaurant.com",
    phone: "9876543210",
    role: "Admin",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "STAFF-2",
    name: "Rahul Kumar",
    email: "rahul@restaurant.com",
    phone: "9876543211",
    role: "Dine-in Staff",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "STAFF-3",
    name: "Priya Sharma",
    email: "priya@restaurant.com",
    phone: "9876543212",
    role: "Counter Staff",
    status: "Active",
    createdAt: new Date().toISOString(),
  },
]

interface StaffContextType{
    staff: Staff[];
    setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
    addStaff:(newStaff: Staff) => void;
    updateStaff: (updatedStaff: Staff) => void;
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
            return parsedStaff.map((member) => ({
                ...member,
                id: normalizeRecordId(member.id, "STAFF"),
            }));
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
                const normalizedStaff = parsedStaff.map((member) => ({
                    ...member,
                    id: normalizeRecordId(member.id, "STAFF"),
                }));
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

    const addStaff = (newStaff:Staff) => {
        setStaff((prev) => [
            ...prev,
            {...newStaff, id: normalizeRecordId(newStaff.id, "STAFF")},
        ]);
    };

    const updateStaff = (updatedStaff: Staff) => {
        setStaff((prev) => 
        prev.map((member) => 
        member.id === updatedStaff.id ? updatedStaff : member));
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