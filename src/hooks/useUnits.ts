import { useEffect, useState } from "react";
import { useCustomer } from "@/contexts/CustomerContext";
import { readUnits, unitsKey, SpeedUnit, formatSpeed, formatDistance, convertSpeed } from "@/lib/units";

export function useUnits() {
  const { selectedCustomerId } = useCustomer();
  const [unit, setUnit] = useState<SpeedUnit>(() => readUnits(selectedCustomerId));
  useEffect(() => {
    const refresh = () => setUnit(readUnits(selectedCustomerId));
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("portal-units", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("portal-units", refresh); };
  }, [selectedCustomerId]);
  const saveUnit = (value: SpeedUnit) => {
    if (!selectedCustomerId) return;
    localStorage.setItem(unitsKey(selectedCustomerId), value);
    setUnit(value);
    window.dispatchEvent(new Event("portal-units"));
  };
  return {
    unit, saveUnit,
    speed: (mph: number) => formatSpeed(mph, unit),
    speedValue: (mph: number) => convertSpeed(mph, unit),
    speedLabel: unit === "kph" ? "km/h" : "mph",
    distance: (miles: number | string, decimals?: number) => formatDistance(miles, unit, decimals),
  };
}
