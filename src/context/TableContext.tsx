import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { RestaurantTable, TableStatus } from "../types/table";
import {
  getNextRecordId,
  normalizeRecordId,
} from "../utils/recordIds";

const TABLE_STORAGE_KEY = "restaurant_tables";

const initialTables: RestaurantTable[] = [
  {
    id: "TABLE-1",
    tableNumber: 1,
    capacity: 2,
    section: "Indoor",
    status: "Available",
  },
  {
    id: "TABLE-2",
    tableNumber: 2,
    capacity: 4,
    section: "Indoor",
    status: "Occupied",
  },
  {
    id: "TABLE-3",
    tableNumber: 3,
    capacity: 4,
    section: "Outdoor",
    status: "Reserved",
  },
  {
    id: "TABLE-4",
    tableNumber: 4,
    capacity: 6,
    section: "Indoor",
    status: "Available",
  },
  {
    id: "TABLE-5",
    tableNumber: 5,
    capacity: 8,
    section: "Private",
    status: "Cleaning",
  },
];

interface TableContextType {
  tables: RestaurantTable[];
  setTables: React.Dispatch<
    React.SetStateAction<RestaurantTable[]>
  >;
  addTable: (table: RestaurantTable) => void;
  updateTable: (table: RestaurantTable) => void;
  deleteTable: (tableId: string) => void;
  updateTableStatus: (
    tableId: string,
    status: TableStatus
  ) => void;
}

const TableContext = createContext<
  TableContextType | undefined
>(undefined);

const loadTables = (): RestaurantTable[] => {
  try {
    const storedTables = localStorage.getItem(TABLE_STORAGE_KEY);

    if (storedTables !== null) {
      const parsedTables: unknown = JSON.parse(storedTables);

      if (Array.isArray(parsedTables)) {
        return parsedTables.map((table) => ({
          ...table,
          id: normalizeRecordId(table.id, "TABLE"),
        })) as RestaurantTable[];
      }
    }
  } catch (error) {
    console.error("Failed to load restaurant tables:", error);
  }

  return initialTables;
};

export const TableProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [tables, setTables] = useState<RestaurantTable[]>(
    loadTables
  );

  // Persist table data whenever the table list changes.
  useEffect(() => {
    try {
      localStorage.setItem(
        TABLE_STORAGE_KEY,
        JSON.stringify(tables)
      );
    } catch (error) {
      console.error("Failed to save restaurant tables:", error);
    }
  }, [tables]);

  const addTable = (table: RestaurantTable) => {
    setTables((previousTables) => {
      const newId = getNextRecordId(
        "TABLE",
        previousTables.map((existingTable) => existingTable.id)
      );

      return [
        ...previousTables,
        {
          ...table,
          id: newId,
        },
      ];
    });
  };

  const updateTable = (updatedTable: RestaurantTable) => {
    setTables((previousTables) =>
      previousTables.map((table) =>
        table.id === updatedTable.id
          ? { ...table, ...updatedTable }
          : table
      )
    );
  };

  const deleteTable = (tableId: string) => {
    setTables((previousTables) =>
      previousTables.filter((table) => table.id !== tableId)
    );
  };

  const updateTableStatus = (
    tableId: string,
    status: TableStatus
  ) => {
    setTables((previousTables) =>
      previousTables.map((table) =>
        table.id === tableId
          ? { ...table, status }
          : table
      )
    );
  };

  return (
    <TableContext.Provider
      value={{
        tables,
        setTables,
        addTable,
        updateTable,
        deleteTable,
        updateTableStatus,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => {
  const context = useContext(TableContext);

  if (!context) {
    throw new Error(
      "useTable must be used inside TableProvider"
    );
  }

  return context;
};
