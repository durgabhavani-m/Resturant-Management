import {createContext, useContext, useEffect, useState, type ReactNode} from "react";

const RESTAURANT_SETTINGS_KEY = "restaurant_settings";

export interface RestaurantSettings {
	name: string;
	email: string;
	phone: string;
	address: string;
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
};

const RestaurantContext = createContext<RestaurantContextValue | undefined>(undefined);

export const RestaurantProvider = ({children}: {children: ReactNode}) => {
	const [settings, setSettings] = useState<RestaurantSettings>(() => {
		const savedSettings = localStorage.getItem(RESTAURANT_SETTINGS_KEY);
		return savedSettings
			? {...defaultSettings, ...JSON.parse(savedSettings) as Partial<RestaurantSettings>}
			: defaultSettings;
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
