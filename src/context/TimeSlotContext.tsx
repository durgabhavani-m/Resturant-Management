
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface TimeSlotContextValue {
  slots: TimeSlot[];
  setSlots: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
}

const STORAGE_KEY = "restaurant_time_slots";

const defaultSlots: TimeSlot[] = [
  {
    id: "SLOT-1",
    startTime: "11:00",
    endTime: "12:00",
    isActive: true,
  },
  {
    id: "SLOT-2",
    startTime: "12:00",
    endTime: "13:00",
    isActive: true,
  },
  {
    id: "SLOT-3",
    startTime: "13:00",
    endTime: "14:00",
    isActive: true,
  },
  {
    id: "SLOT-4",
    startTime: "18:00",
    endTime: "19:00",
    isActive: true,
  },
  {
    id: "SLOT-5",
    startTime: "19:00",
    endTime: "20:00",
    isActive: true,
  },
];

const TimeSlotContext = createContext<TimeSlotContextValue | undefined>(
  undefined
);

export function TimeSlotProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<TimeSlot[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        return JSON.parse(stored) as TimeSlot[];
      }
    } catch {
      // Use default slots if stored data is invalid.
    }

    return defaultSlots;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
  }, [slots]);

  return (
    <TimeSlotContext.Provider value={{ slots, setSlots }}>
      {children}
    </TimeSlotContext.Provider>
  );
}

export function useTimeSlots() {
  const context = useContext(TimeSlotContext);

  if (!context) {
    throw new Error("useTimeSlots must be used within TimeSlotProvider");
  }

  return context;
}
