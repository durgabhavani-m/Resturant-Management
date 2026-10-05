import {useState} from "react";
import {Save, Store} from "lucide-react";

import {useRestaurant} from "../context/ResturantContext";
import type {RestaurantSettings} from "../context/ResturantContext";

const SettingsPage = () => {
  const {settings, updateSettings} = useRestaurant();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSettings(form);
    setSaved(true);
  };

  const updateField = (field: keyof RestaurantSettings, value: string) => {
    setForm((current) => ({...current, [field]: value}));
    setSaved(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Restaurant profile</p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-700"
        >
          <Save size={17}/>
          Save Changes
        </button>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
            <Store size={20}/>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Restaurant details</h2>
            <p className="text-sm text-slate-500">Shown on customer-facing bills and receipts.</p>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="restaurant-name" className="mb-2 block text-sm font-medium text-slate-700">
              Restaurant name
            </label>
            <input
              id="restaurant-name"
              required
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label htmlFor="restaurant-email" className="mb-2 block text-sm font-medium text-slate-700">
              Contact email
            </label>
            <input
              id="restaurant-email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="billing@example.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label htmlFor="restaurant-phone" className="mb-2 block text-sm font-medium text-slate-700">
              Contact phone
            </label>
            <input
              id="restaurant-phone"
              type="tel"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="Phone number"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="restaurant-address" className="mb-2 block text-sm font-medium text-slate-700">
              Address
            </label>
            <textarea
              id="restaurant-address"
              rows={3}
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Restaurant address"
              className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>
      </section>

      {saved && (
        <p role="status" className="text-sm font-medium text-emerald-700">
          Restaurant settings saved.
        </p>
      )}
    </form>
  );
};

export default SettingsPage;