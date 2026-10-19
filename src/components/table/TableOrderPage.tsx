import { useEffect, useMemo, useRef, useState } from "react";
import { usePersistentState } from "../../hooks/usePersistentState";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";

import { useTable } from "../../context/TableContext";
import { useMenu } from "../../context/MenuContext";
import { useOrder } from "../../context/OrderContext";
import { useBilling } from "../../context/BillingContext";
import { useRestaurant } from "../../context/ResturantContext";
import { useModifiers } from "../../context/ModifierContext";

import type {
  Order,
  OrderItem,
  SelectedModifier,
} from "../../types/order";

import type { Reservation } from "../../types/reservation";
import type {
  MenuModifierGroup,
  MenuItem as MenuItemType,
} from "../../types/menu";

import type { Bill, PaymentMethod } from "../../types/billing";

import {
  getNextRecordId,
  resolveRecordId,
} from "../../utils/recordIds";

import Modifiers from "./Modifiers";
import TableOrderMenu from "./TableOrderMenu";
import TableOrderCart from "./TableOrderCart";

type CartItem = OrderItem;

const RESERVATION_STORAGE_KEY = "reservation_customers";

const normalizeCategoryKey = (category: string) =>
  category.trim().replace(/\s+/g, " ").toLowerCase();

const getTableCartStorageKey = (tableId: string) =>
  `restaurant_table_cart_${tableId}`;

const getCartItemKey = (item: CartItem) =>
  `${item.menuItemId}:${(item.modifiers ?? [])
    .map((modifier) => `${modifier.groupId}:${modifier.optionId}`)
    .sort()
    .join(",")}`;

const getCurrentModifierGroups = (
  item: MenuItemType,
  availableGroups: MenuModifierGroup[]
): MenuModifierGroup[] => {
  const assignedGroupIds =
    item.modifierGroupIds ?? 
    item.modifierGroups?.map((group) => group.id) ?? [];

  return assignedGroupIds.flatMap((groupId) => {
    const group = availableGroups.find(
      (candidate) => candidate.id === groupId);
    return group && (group.isAvailable ?? true) ? [group] : [];
  });
};

const removeUnavailableModifiers = (
  cartItem: CartItem,
  menuItem: MenuItemType,
  availableGroups: MenuModifierGroup[]
) => {
  if (!cartItem.modifiers?.length) return cartItem;

  const currentGroups = getCurrentModifierGroups(menuItem, availableGroups);
  const modifiers = cartItem.modifiers.flatMap((modifier) => {
    const group = currentGroups.find(
      (candidate) => candidate.id === modifier.groupId
    );
    const option = group?.options.find(
      (candidate) => candidate.id === modifier.optionId
    );

    return group && option
      ? [{
          groupId: group.id,
          groupName: group.name,
          optionId: option.id,
          name: option.name,
          price: option.price,
        }]
      : [];
  });

  if (modifiers.length === cartItem.modifiers.length) return cartItem;

  const previousModifierPrice = cartItem.modifiers.reduce(
    (sum, modifier) => sum + modifier.price,
    0
  );
  const remainingModifierPrice = modifiers.reduce(
    (sum, modifier) => sum + modifier.price,
    0
  );
  const basePrice = cartItem.price - previousModifierPrice;

  return {
    ...cartItem,
    modifiers,
    price: Math.max(0, basePrice + remainingModifierPrice),
  };
};

const isValidOrderItem = (item: unknown): item is CartItem => {
  if (
    typeof item !== "object" ||
    item === null ||
    !("menuItemId" in item) ||
    !("name" in item) ||
    !("quantity" in item) ||
    !("price" in item) ||
    typeof item.menuItemId !== "string" ||
    item.menuItemId.length === 0 ||
    typeof item.name !== "string" ||
    item.name.trim().length === 0 ||
    typeof item.quantity !== "number" ||
    !Number.isFinite(item.quantity) ||
    item.quantity <= 0 ||
    typeof item.price !== "number" ||
    !Number.isFinite(item.price) ||
    item.price < 0
  ) {
    return false;
  }

  if (!("modifiers" in item) || item.modifiers === undefined) return true;
  return (
    Array.isArray(item.modifiers) &&
    item.modifiers.every(
      (modifier) =>
        typeof modifier === "object" &&
        modifier !== null &&
        "groupId" in modifier &&
        "groupName" in modifier &&
        "optionId" in modifier &&
        "name" in modifier &&
        "price" in modifier &&
        typeof modifier.groupId === "string" &&
        typeof modifier.groupName === "string" &&
        typeof modifier.optionId === "string" &&
        typeof modifier.name === "string" &&
        typeof modifier.price === "number" &&
        Number.isFinite(modifier.price)
    )
  );
};

const hasValidOrderItems = (
  items: unknown[],
  menuItems: MenuItemType[]
) =>
  items.some(
    (item) =>
      isValidOrderItem(item) &&
      menuItems.some((menuItem) => menuItem.id === item.menuItemId)
  );

const hasActiveReservation = (tableNumber: number, tableSection: string) => {
  const storedReservations = localStorage.getItem(RESERVATION_STORAGE_KEY);
  if (!storedReservations) return false;

  const reservations = JSON.parse(storedReservations) as Reservation[];
  return reservations.some(
    (reservation) =>
      reservation.tableNumber === tableNumber &&
      reservation.tableSection === tableSection &&
      (reservation.status === "Pending" ||
        reservation.status === "Confirmed")
  );
};

const TableOrderPage = () => {
  const navigate = useNavigate();
  const { tableId } = useParams();

  const { tables, updateTableStatus } = useTable();
  const { items: menuItems, categoryMetadata } = useMenu();
  const { modifierGroups } = useModifiers();
  const { orders, addOrder, updateOrder } = useOrder();
  const { bills, addBill, updateBill } = useBilling();
  const { settings } = useRestaurant();

  const normalizedTableId = tableId
    ? resolveRecordId(tableId, "TABLE")
    : undefined;

  const table = tables.find(
    (item) =>
      item.id === tableId || item.id === normalizedTableId
  );

  const cartTableId = table?.id;

  const existingOrder = orders.find(
    (order) =>
      order.tableNumber === table?.tableNumber &&
      order.tableSection === table?.section &&
      order.orderType === "Dine In" &&
      order.paymentStatus !== "Paid" &&
      order.status !== "Completed" &&
      order.status !== "Cancelled" &&
      hasValidOrderItems(order.items, menuItems)
  );

  const [storedCart, setStoredCart] = useState<CartItem[]>(() => {
    if (!table) return [];

    const savedCart = localStorage.getItem(
      getTableCartStorageKey(table.id)
    );

    const savedItems: unknown =
      savedCart === null
        ? existingOrder?.items ?? []
        : JSON.parse(savedCart);

    return Array.isArray(savedItems)
      ? savedItems.filter(
          (item): item is CartItem =>
            isValidOrderItem(item) &&
            menuItems.some((menuItem) => menuItem.id === item.menuItemId)
        )
      : [];
  });
  const cart = useMemo(
    () =>
      storedCart.map((cartItem) => {
        const menuItem = menuItems.find(
          (candidate) => candidate.id === cartItem.menuItemId
        );
        return menuItem
          ? removeUnavailableModifiers(cartItem, menuItem, modifierGroups)
          : cartItem;
      }),
    [storedCart, menuItems, modifierGroups]
  );

 const [selectedCategory, setSelectedCategory] =
  usePersistentState(
    `table_order_category_${table?.id ?? tableId ?? "unknown"}`,
    "All"
  );

  const [isBillingOpen, setIsBillingOpen] =
  usePersistentState(
    `table_order_billing_open_${table?.id ?? tableId ?? "unknown"}`,
    false
  );

 const [selectedMenuItemId, setSelectedMenuItemId] =
  usePersistentState<string | null>(
    `restaurant_table_${tableId}_selected_menu_item_id`,
    null
  );

const selectedMenuItem = useMemo(
  () =>
    menuItems.find((item) => item.id === selectedMenuItemId) ?? null,
  [menuItems, selectedMenuItemId]
);

const selectedMenuItemModifierGroups = useMemo(
  () =>
    selectedMenuItem
      ? getCurrentModifierGroups(selectedMenuItem, modifierGroups)
      : [],
  [selectedMenuItem, modifierGroups]
);

const [isModifiersOpen, setIsModifiersOpen] =
  usePersistentState<boolean>(
    `restaurant_table_${tableId}_modifiers_open`,
    false
  );

  const [paymentMethod, setPaymentMethod] =
  usePersistentState<PaymentMethod | "">(
    `table_order_payment_method_${table?.id ?? tableId ?? "unknown"}`,
    ""
  );

  const [paymentError, setPaymentError] = useState("");
  const [orderingError, setOrderingError] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] =
    useState(false);

  const [paymentReceipt, setPaymentReceipt] = useState<{
    billNumber: string;
    total: number;
    paymentMethod: PaymentMethod;
  } | null>(null);

  const paymentInProgress = useRef(false);

  // Save the current cart for this table.
  useEffect(() => {
    if (!cartTableId) return;

    const storageKey = getTableCartStorageKey(cartTableId);

    if (cart.length === 0) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    }
  }, [cart, cartTableId]);

  useEffect(() => {
    if (!existingOrder) return;

    const updatedItems = existingOrder.items.map((orderItem) => {
      const menuItem = menuItems.find(
        (candidate) => candidate.id === orderItem.menuItemId
      );
      return menuItem
        ? removeUnavailableModifiers(orderItem, menuItem, modifierGroups)
        : orderItem;
    });

    if (!updatedItems.some((item, index) => item !== existingOrder.items[index])) {
      return;
    }

    updateOrder({
      ...existingOrder,
      items: updatedItems,
      total: updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    });
  }, [existingOrder, menuItems, modifierGroups, updateOrder]);

  useEffect(() => {
    if (!table || table.status === "Cleaning") return;

    const orderHasItems = hasValidOrderItems(cart, menuItems);
    const reservationExists = hasActiveReservation(
      table.tableNumber,
      table.section
    );
    const activeOrderExists = Boolean(existingOrder);
    const nextStatus =
      orderHasItems || activeOrderExists
        ? "Occupied"
        : reservationExists
          ? "Reserved"
          : "Available";

    if (table.status !== nextStatus) {
      updateTableStatus(table.id, nextStatus);
    }
  }, [
    cart,
    existingOrder,
    menuItems,
    table,
    updateTableStatus,
  ]);

  // Create the category filter options.
  const categories = useMemo(() => {
    const normalizedCategories = Array.from(
      new Set(
        menuItems.map((item) =>
          item.category.trim().toLowerCase()
        )
      )
    );

    return [
      "All",
      ...normalizedCategories.map((category) =>
        category
          .split(" ")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1)
          )
          .join(" ")
      ),
    ];
  }, [menuItems]);

  // Show only available menu items in the selected category.
  const filteredMenuItems = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          item.isAvailable &&
          (selectedCategory === "All" ||
            item.category.trim().toLowerCase() ===
              selectedCategory.trim().toLowerCase())
      ),
    [menuItems, selectedCategory]
  );

  // Add an item, including its selected modifiers, to the cart.
  const addToCart = (
    menuItemId: string,
    name: string,
    modifiers: SelectedModifier[] = []
  ) => {
    if (!table) return;
    const menuItem = menuItems.find((item) => item.id === menuItemId);
    if (
      menuItem &&
      categoryMetadata[normalizeCategoryKey(menuItem.category)]?.status ===
        "Inactive"
    ) {
      setOrderingError(
        "This item belongs to an inactive category and cannot be ordered."
      );
      return;
    }
    if (
      !menuItem ||
      !menuItem.isAvailable ||
      menuItem.stockStatus === "Out of Stock"
    ) {
      return;
    }

    const validGroups = getCurrentModifierGroups(menuItem, modifierGroups);
    const validModifiers = modifiers.flatMap((modifier) => {
      const group = validGroups.find(
        (candidate) => candidate.id === modifier.groupId
      );
      const option = group?.options.find(
        (candidate) => candidate.id === modifier.optionId
      );

      return group && option
        ? [{
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            name: option.name,
            price: option.price,
          }]
        : [];
    });

    const incoming: CartItem = {
      menuItemId,
      name,
      price:
        menuItem.price +
        validModifiers.reduce((sum, modifier) => sum + modifier.price, 0),
      quantity: 1,
      currencyCode: settings.billing.currency,
      modifiers: validModifiers,
    };

    const incomingKey = getCartItemKey(incoming);

    setStoredCart((previous) => {
      const currentCart = previous.map((cartItem) => {
        const currentMenuItem = menuItems.find(
          (candidate) => candidate.id === cartItem.menuItemId
        );
        return currentMenuItem
          ? removeUnavailableModifiers(cartItem, currentMenuItem, modifierGroups)
          : cartItem;
      });
      const existing = currentCart.find(
        (item) => getCartItemKey(item) === incomingKey
      );

      if (existing) {
        return currentCart.map((item) =>
          getCartItemKey(item) === incomingKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, incoming];
    });

  };

  // Open the modifier dialog when the menu item has customizations.
  const handleMenuItemClick = (item: MenuItemType) => {
    if (
      categoryMetadata[normalizeCategoryKey(item.category)]?.status ===
      "Inactive"
    ) {
      setOrderingError(
        "This item belongs to an inactive category and cannot be ordered."
      );
      return;
    }

    if (getCurrentModifierGroups(item, modifierGroups).length > 0) {
      setSelectedMenuItemId(item.id);
      setIsModifiersOpen(true);
      return;
    }

    addToCart(item.id, item.name, []);
  };

  // Increase or decrease the quantity of a specific cart item.
  const updateCartQuantity = (
    target: CartItem,
    change: number
  ) => {
    if (!table) return;

    const targetKey = getCartItemKey(target);

    const updatedCart = cart
      .map((item) =>
        getCartItemKey(item) === targetKey
          ? { ...item, quantity: item.quantity + change }
          : item
      )
      .filter((item) => item.quantity > 0);

    setStoredCart(updatedCart);

    if (existingOrder) {
      if (updatedCart.length === 0) {
        updateOrder({
          ...existingOrder,
          items: [],
          total: 0,
          status: "Cancelled",
          orderStatus: "Cancelled",
        });
      } else {
        updateOrder({
          ...existingOrder,
          items: updatedCart,
          total: updatedCart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        });
      }
    }
  };

  // Remove a specific item and modifier combination from the cart.
  const removeFromCart = (target: CartItem) => {
    if (!table) return;

    const targetKey = getCartItemKey(target);

    const updatedCart = cart.filter(
      (item) => getCartItemKey(item) !== targetKey
    );

    setStoredCart(updatedCart);

    if (existingOrder) {
      if (updatedCart.length === 0) {
        updateOrder({
          ...existingOrder,
          items: [],
          total: 0,
          status: "Cancelled",
          orderStatus: "Cancelled",
        });
      } else {
        updateOrder({
          ...existingOrder,
          items: updatedCart,
          total: updatedCart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        });
      }
    }
  };

  // Calculate the cart total.
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const cartCurrencyMismatch = cart.some(
    (item) => (item.currencyCode ?? "INR") !== settings.billing.currency
  );
  const taxAmount = settings.billing.taxEnabled
    ? Math.round(total * settings.billing.taxRate) / 100
    : 0;
  const billTotal = total + taxAmount;

  const nextInvoiceNumber = (prefix: string) => {
    const usedNumbers = new Set(bills.map((bill) => bill.billNumber));
    let nextNumber = 1;
    let billNumber = `${prefix}${String(nextNumber).padStart(5, "0")}`;
    while (usedNumbers.has(billNumber)) {
      nextNumber += 1;
      billNumber = `${prefix}${String(nextNumber).padStart(5, "0")}`;
    }
    return billNumber;
  };

  // Complete payment and create or update the order and bill.
  const handleCompletePayment = () => {
    if (paymentInProgress.current) return;

    if (!paymentMethod) {
      setPaymentError("Please select a payment method.");
      return;
    }

    if (!table || cart.length === 0) return;
    if (cartCurrencyMismatch) {
      setPaymentError(
        `This cart contains amounts in a different currency from ${settings.billing.currency}. Clear and re-add the items before billing; amounts are not converted.`
      );
      return;
    }

    paymentInProgress.current = true;
    setIsProcessingPayment(true);
    setPaymentError("");

    const paymentTimestamp = Date.now();

    const order: Order = existingOrder
      ? {
          ...existingOrder,
          customerName:
            existingOrder.customerName || "Dine-in Customer",
          items: cart,
          total: billTotal,
          currencyCode: settings.billing.currency,
          status: "Completed",
          orderStatus: "Completed",
          orderType: "Dine In",
          paymentStatus: "Paid",
        }
      : {
          id: getNextRecordId(
            "ORDER",
            orders.map((item) => item.id)
          ),
          orderNumber: `ORD-${paymentTimestamp}`,
          customerName: "Dine-in Customer",
          tableNumber: table.tableNumber,
          tableSection: table.section,
          items: cart,
          total: billTotal,
          currencyCode: settings.billing.currency,
          status: "Completed",
          orderStatus: "Completed",
          orderType: "Dine In",
          paymentStatus: "Paid",
          createdAt: new Date().toISOString(),
        };

    const existingBill = bills.find(
      (bill) => bill.orderId === order.id
    );

    if (existingBill?.paymentStatus === "Paid") {
      setPaymentError("This order already has a paid bill.");
      paymentInProgress.current = false;
      setIsProcessingPayment(false);
      return;
    }

    const paidAt = new Date().toISOString();

    const bill: Bill = {
      id:
        existingBill?.id ??
        getNextRecordId(
          "BILL",
          bills.map((item) => item.id)
        ),
      billNumber:
        existingBill?.billNumber ??
        nextInvoiceNumber(settings.billing.invoicePrefix),
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      subtotal: total,
      tax: taxAmount,
      discount: 0,
      total: billTotal,
      paymentMethod,
      paymentStatus: "Paid",
      createdAt: existingBill?.createdAt ?? paidAt,
      paidAt,
      currencyCode: existingBill?.currencyCode ?? settings.billing.currency,
      taxLabel: existingBill?.taxLabel ?? settings.billing.taxLabel,
      showTaxBreakdown: existingBill?.showTaxBreakdown ?? settings.billing.showTaxBreakdown,
    };

    if (existingOrder) {
      updateOrder(order);
    } else {
      addOrder(order);
    }

    if (existingBill) {
      updateBill(bill);
    } else {
      addBill(bill);
    }

    updateTableStatus(table.id, "Cleaning");

    sessionStorage.setItem(
      "restaurant_table_notice",
      `Billing completed for Table ${table.tableNumber}. Table is now cleaning.`
    );

    setStoredCart([]);
    setIsBillingOpen(false);

    setPaymentReceipt({
      billNumber: bill.billNumber,
      total: billTotal,
      paymentMethod,
    });

    setTimeout(() => navigate("/tables"), 1000);
  };

  // Handle an invalid table ID.
  if (!table) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100%",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h2" color="text.primary">
            Table not found
          </Typography>

          <Button
            variant="contained"
            color="inherit"
            onClick={() => navigate("/tables")}
            sx={{
              mt: 2,
              bgcolor: "text.primary",
              color: "common.white",
            }}
          >
            Back to Tables
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: { xs: "100%", lg: 0 },
        height: { lg: "100%" },
        bgcolor: "background.default",
        background:
          "linear-gradient(to bottom right, #fff7ed, #f8fafc, #fffbeb)",
      }}
    >
      {/* Table heading and total */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate("/tables")}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              borderRadius: 2,
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box>
            <Chip
              label="Dine-In Order"
              size="small"
              sx={{
                bgcolor: "primary.light",
                color: "primary.dark",
                fontWeight: 600,
                mb: 0.5,
              }}
            />

            <Typography variant="h1" color="text.primary">
              {table.section} - Table {table.tableNumber}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Capacity: {table.capacity} guests
            </Typography>
          </Box>
        </Box>

        <Paper
          variant="outlined"
          sx={{ px: 2, py: 1.5, borderRadius: 3 }}
        >
          <Typography variant="caption" color="text.secondary">
            Current Total
          </Typography>

          <Typography variant="h2" color="text.primary">
            ₹{total.toFixed(2)}
          </Typography>
        </Paper>
      </Box>

      {/* Menu and cart components */}
      <Grid
        container
        spacing={3}
        sx={{ minHeight: 0, flex: { lg: 1 } }}
      >
        <Grid size={{ xs: 12, lg: 8 }}>
          <TableOrderMenu
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            items={filteredMenuItems}
            categoryMetadata={categoryMetadata}
            onAddItem={handleMenuItemClick}
            cartMenuItemIds={cart.map(
              (item) => item.menuItemId
            )}
            currencyCode={settings.billing.currency}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{height: "100%", pl:{lg:1}}}>
            <TableOrderCart
            items={cart}
            total={total}
            taxAmount={taxAmount}
            billTotal={billTotal}
            taxLabel={settings.billing.taxLabel}
            currencyCode={settings.billing.currency}
            showTaxBreakdown={settings.billing.showTaxBreakdown}
            tableLabel={`${table.section} - Table ${table.tableNumber}`}
            orderNumber={existingOrder?.orderNumber ?? "New order"}
            isBillingOpen={isBillingOpen}
            paymentMethod={paymentMethod}
            paymentError={paymentError}
            isProcessingPayment={isProcessingPayment}
            paymentReceipt={paymentReceipt}
            onIncrease={(item) =>
              updateCartQuantity(item, 1)
            }
            onDecrease={(item) =>
              updateCartQuantity(item, -1)
            }
            onRemove={removeFromCart}
            onOpenBilling={() => {
              setPaymentError(cartCurrencyMismatch
                ? `This cart contains amounts in a different currency from ${settings.billing.currency}. Clear and re-add the items before billing; amounts are not converted.`
                : "");
              setPaymentMethod("");
              setPaymentReceipt(null);
              setIsBillingOpen(true);
            }}
            onCloseBilling={() => {
              setIsBillingOpen(false);
              setPaymentReceipt(null);
            }}
            onSelectPayment={(method) => {
              setPaymentMethod(method);
              setPaymentError("");
            }}
            onCompletePayment={handleCompletePayment}
          />
          </Box>
        </Grid>
      </Grid>

      {/* Food modifier dialog */}
      <Modifiers
        key={`${selectedMenuItem?.id ?? ""}:${isModifiersOpen}:${selectedMenuItemModifierGroups.map((group) => group.id).join(",")}`}
        open={isModifiersOpen}
        itemName={selectedMenuItem?.name ?? ""}
        basePrice={selectedMenuItem?.price ?? 0}
        currencyCode={settings.billing.currency}
        storageKey={`restaurant_table_${tableId}_modifiers_${selectedMenuItem?.id ?? ""}`}
        groups={selectedMenuItemModifierGroups}
        
        onClose={() => {
          setIsModifiersOpen(false);
          setSelectedMenuItemId(null);
        }}
        onConfirm={(modifiers) => {
          if (!selectedMenuItem) return;

          addToCart(
            selectedMenuItem.id,
            selectedMenuItem.name,
            modifiers
          );

          setIsModifiersOpen(false);
          setSelectedMenuItemId(null);
        }}
      />
      <Snackbar
        open={Boolean(orderingError)}
        autoHideDuration={5000}
        onClose={() => setOrderingError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="warning"
          onClose={() => setOrderingError("")}
          sx={{ width: "100%" }}
        >
          {orderingError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TableOrderPage;
