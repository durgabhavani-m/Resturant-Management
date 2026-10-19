import {createContext, useContext, useEffect, useState, type ReactNode} from "react";

const RESTAURANT_SETTINGS_KEY = "restaurant_settings";

export interface RestaurantSettings {
	name: string;
	email: string;
	phone: string;
	address: string;
	logoUrl: string;
	openingHours: Record<OpeningDay, OpeningHours>;
	billing: RestaurantBillingSettings;
}

export type OpeningDay =
	| "Monday"
	| "Tuesday"
	| "Wednesday"
	| "Thursday"
	| "Friday"
	| "Saturday"
	| "Sunday";

export interface OpeningHours {
	open: boolean;
	openTime: string;
	closeTime: string;
	overnight: boolean;
}

export interface RestaurantBillingSettings {
	currency: string;
	taxEnabled: boolean;
	taxLabel: string;
	taxRate: number;
	invoicePrefix: string;
	showTaxBreakdown: boolean;
}

interface RestaurantContextValue {
	settings: RestaurantSettings;
	updateSettings: (settings: RestaurantSettings) => void;
}

const defaultSettings: RestaurantSettings = {
	name: "RestruHub Restaurant",
	email: "",
	phone: "",
	address: "",
	logoUrl: "",
	openingHours: {
		Monday: { open: true, openTime: "09:00", closeTime: "22:00", overnight: false },
		Tuesday: { open: true, openTime: "09:00", closeTime: "22:00", overnight: false },
		Wednesday: { open: true, openTime: "09:00", closeTime: "22:00", overnight: false },
		Thursday: { open: true, openTime: "09:00", closeTime: "22:00", overnight: false },
		Friday: { open: true, openTime: "09:00", closeTime: "22:00", overnight: false },
		Saturday: { open: true, openTime: "09:00", closeTime: "22:00", overnight: false },
		Sunday: { open: false, openTime: "09:00", closeTime: "22:00", overnight: false },
	},
	billing: {
		currency: "INR",
		taxEnabled: false,
		taxLabel: "Tax",
		taxRate: 0,
		invoicePrefix: "BILL-",
		showTaxBreakdown: true,
	},
};

const RestaurantContext = createContext<RestaurantContextValue | undefined>(undefined);

export const RestaurantProvider = ({children}: {children: ReactNode}) => {
	const [settings, setSettings] = useState<RestaurantSettings>(() => {
		const savedSettings = localStorage.getItem(RESTAURANT_SETTINGS_KEY);
		if (!savedSettings) return defaultSettings;

		const saved = JSON.parse(savedSettings) as Partial<RestaurantSettings> & {
			currency?: string;
			taxRate?: string | number;
			logo?: string;
		};
		const savedOpeningHours = saved.openingHours;
		const openingHours = Object.fromEntries(
			(Object.keys(defaultSettings.openingHours) as OpeningDay[]).map((day) => [
				day,
				{
					...defaultSettings.openingHours[day],
					...savedOpeningHours?.[day],
				},
			])
		) as Record<OpeningDay, OpeningHours>;

		return {
			...defaultSettings,
			...saved,
			logoUrl: saved.logoUrl ?? saved.logo ?? defaultSettings.logoUrl,
			openingHours,
			billing: {
				...defaultSettings.billing,
				...(saved.currency ? { currency: saved.currency } : {}),
				...(saved.taxRate !== undefined
					? { taxRate: Number(saved.taxRate) || 0, taxEnabled: Number(saved.taxRate) > 0 }
					: {}),
				...saved.billing,
			},
		};
	});

	useEffect(() => {
		localStorage.setItem(RESTAURANT_SETTINGS_KEY, JSON.stringify(settings));
	}, [settings]);

	const updateSettings = (updatedSettings: RestaurantSettings) => {
		setSettings(updatedSettings);
	};

	return (
		<RestaurantContext.Provider value={{settings, updateSettings}}>
			{children}
		</RestaurantContext.Provider>
	);
};

export const useRestaurant = () => {
	const context = useContext(RestaurantContext);

	if (!context) {
		throw new Error("useRestaurant must be used inside RestaurantProvider");
	}

	return context;
};
