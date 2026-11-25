/** Illustrative device/app settings until the app's device telemetry is connected. */
export type Permission = { name: string; ok: boolean; detail: string };
export type DeviceInfo = {
  model: string; os: string; compatible: boolean;
  permissions: Permission[];
  wifiOnlyUpload: boolean; battery: string;
  pause: { on: boolean; lastSetAt: string; duration: string };
  reset: { lastResetAt: string; scoreBefore: number; visibleFrom: string } | null;
  firstJourney: string; lastJourney: string;
};
/** Minimum supported OS versions (major). */
export const MIN_OS = { iOS: 15, Android: 10 } as const;
export function isCompatible(os: string) {
  const [platform, version] = os.split(" ");
  const min = MIN_OS[platform as keyof typeof MIN_OS];
  return min !== undefined && parseFloat(version) >= min;
}
function seed(id: string) { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
const DEVICES = [["iPhone 15 Pro", "iOS 18.1"], ["Samsung Galaxy S23", "Android 14"], ["iPhone 8", "iOS 14.8"], ["Google Pixel 7", "Android 13"]];
export function sampleDeviceInfo(id: string): DeviceInfo {
  const s = seed(id);
  const [model, os] = DEVICES[s % DEVICES.length];
  const android = os.startsWith("Android");
  const permissions: Permission[] = [
    { name: "Location", ok: true, detail: android ? "Allow all the time" : "Always" },
    { name: "Precise location", ok: (s >>> 3) % 3 !== 0, detail: (s >>> 3) % 3 !== 0 ? "On" : "Off" },
    { name: "Motion & fitness", ok: true, detail: "Allowed" },
    { name: "Background app refresh", ok: (s >>> 5) % 4 !== 0, detail: (s >>> 5) % 4 !== 0 ? "On" : "Off" },
    { name: "Notifications", ok: true, detail: "Allowed" },
    ...(android ? [{ name: "Battery optimisation", ok: (s >>> 7) % 2 === 0, detail: (s >>> 7) % 2 === 0 ? "Unrestricted" : "Optimised" }] : []),
  ];
  return {
    model, os, compatible: isCompatible(os), permissions,
    wifiOnlyUpload: (s >>> 9) % 2 === 0,
    battery: ["Balanced", "Best accuracy", "Battery saver"][(s >>> 11) % 3],
    pause: { on: (s >>> 13) % 3 === 0, lastSetAt: "18 Nov 2026, 7:42 am", duration: "2 hours" },
    reset: (s >>> 15) % 2 === 0 ? { lastResetAt: "01 Oct 2026", scoreBefore: 58, visibleFrom: "01 Oct 2026" } : null,
    firstJourney: "12 Feb 2026, 8:14 am", lastJourney: "03 Nov 2026, 8:00 pm",
  };
}
