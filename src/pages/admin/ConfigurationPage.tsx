import { useState } from "react";
import {
  Car,
  User,
  TrainFront,
  Plane,
  TramFront,
  Bus,
  Bike,
  Sailboat,
  Footprints,
  HelpCircle,
  Ban,
  LucideIcon,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Mode = { key: string; label: string; icon: LucideIcon };

const MODES: Mode[] = [
  { key: "car", label: "Car", icon: Car },
  { key: "passenger", label: "Passenger", icon: User },
  { key: "train", label: "Train", icon: TrainFront },
  { key: "plane", label: "Plane", icon: Plane },
  { key: "tram", label: "Tram", icon: TramFront },
  { key: "bus", label: "Bus", icon: Bus },
  { key: "bike", label: "Bike", icon: Bike },
  { key: "boat", label: "Boat", icon: Sailboat },
  { key: "foot", label: "Foot", icon: Footprints },
  { key: "other", label: "Other", icon: HelpCircle },
  { key: "excluded", label: "Excluded", icon: Ban },
];

const ConfigurationPage = () => {
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(MODES.map((m) => [m.key, true]))
  );
  const [initial] = useState(selected);

  const toggle = (k: string) =>
    setSelected((s) => ({ ...s, [k]: !s[k] }));

  const dirty = MODES.some((m) => selected[m.key] !== initial[m.key]);

  return (
    <AdminLayout
      title="Client Configuration"
      crumbs={[{ label: "Home", to: "/" }, { label: "Admin" }, { label: "Config" }]}
    >
      <section className="bg-portal-panel border border-portal-border rounded-lg p-6 max-w-3xl">
        <h2 className="text-lg font-bold text-portal-navy mb-5">
          Available modes of transport
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <label
                key={m.key}
                className="flex items-center gap-2 text-sm text-portal-text cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!selected[m.key]}
                  onChange={() => toggle(m.key)}
                  className="w-4 h-4 accent-portal-accent"
                />
                <Icon className="w-4 h-4 text-portal-text" />
                <span className="font-semibold">{m.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      <div className="max-w-3xl mt-6 flex justify-end">
        <Button
          disabled={!dirty}
          onClick={() => toast.success("Configuration saved")}
          className="bg-portal-navy hover:bg-portal-navy/90 text-portal-navy-foreground disabled:opacity-50 px-8"
        >
          Save
        </Button>
      </div>
    </AdminLayout>
  );
};

export default ConfigurationPage;