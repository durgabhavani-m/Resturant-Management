import { createContext, useContext, useEffect, useState } from "react";
import type { Bill, PaymentMethod, PaymentStatus } from "../types/billing";
import {normalizeRecordId} from "../utils/recordIds";

const BILLING_STORAGE_KEY = "restaurant_bills";

interface BillingContextType {
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  addBill: (bill: Bill) => void;
  updateBill: (bill: Bill) => void;
  deleteBill: (billId: string) => void;
  updatePaymentStatus: (
    billId: string,
    status: PaymentStatus,
    paymentMethod?: PaymentMethod
  ) => void;
}

const BillingContext = createContext<BillingContextType | undefined>(
  undefined
);

export const BillingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [bills, setBills] = useState<Bill[]>(() => {
    const storedBills = localStorage.getItem(BILLING_STORAGE_KEY);

    if (storedBills) {
      const parsedBills = JSON.parse(storedBills) as Bill[];
      return parsedBills.map((bill) => ({
        ...bill,
        id: normalizeRecordId(bill.id, "BILL"),
        orderId: normalizeRecordId(bill.orderId, "ORDER"),
      }));
    }

    return [];
  });

  useEffect(() => {
    localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(bills));
  }, [bills]);

  const addBill = (bill: Bill) => {
    setBills((prev) => [
      ...prev,
      {
        ...bill,
        id: normalizeRecordId(bill.id, "BILL"),
        orderId: normalizeRecordId(bill.orderId, "ORDER"),
      },
    ]);
  };

  const updateBill = (updatedBill: Bill) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === updatedBill.id ? updatedBill : bill
      )
    );
  };

  const deleteBill = (billId: string) => {
    setBills((prev) =>
      prev.filter((bill) => bill.id !== billId)
    );
  };

  const updatePaymentStatus = (
    billId: string,
    status: PaymentStatus,
    paymentMethod?: PaymentMethod
  ) => {
    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== billId) {
          return bill;
        }

        return {
          ...bill,
          paymentStatus: status,
          paymentMethod: paymentMethod ?? bill.paymentMethod,
          ...(status === "Paid"
            ? { paidAt: new Date().toISOString() }
            : {}),
        };
      })
    );
  };

  return (
    <BillingContext.Provider
      value={{
        bills,
        setBills,
        addBill,
        updateBill,
        deleteBill,
        updatePaymentStatus,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);

  if (!context) {
    throw new Error(
      "useBilling must be used inside BillingProvider"
    );
  }

  return context;
};