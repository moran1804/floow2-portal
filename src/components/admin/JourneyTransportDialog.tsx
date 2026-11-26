import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TRANSPORT_OPTIONS, type TransportMode } from "@/lib/journeyTransport";

export default function JourneyTransportDialog({ open, onOpenChange, initialMode, count = 1, onConfirm }: {
  open: boolean; onOpenChange: (open: boolean) => void; initialMode?: TransportMode;
  count?: number; onConfirm: (mode: TransportMode) => void;
}) {
  const [mode, setMode] = useState<TransportMode | undefined>(initialMode);
  useEffect(() => { if (open) setMode(initialMode); }, [open, initialMode]);
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-[480px]" aria-describedby={undefined}>
      <DialogHeader className="border-b border-portal-border px-5 py-5 pr-12">
        <DialogTitle className="text-base text-portal-navy">{count > 1 ? `Edit tags for ${count} journeys` : "Edit mode of transport"}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-3 gap-3 px-5 pb-1 pt-3 sm:grid-cols-4" role="group" aria-label="Mode of transport options">
        {TRANSPORT_OPTIONS.map(({ name, icon: Icon }) => <Button key={name} type="button" variant="outline" aria-pressed={mode === name} onClick={() => setMode(name)}
          className={`h-[88px] min-w-0 flex-col gap-2 rounded-none px-1 text-sm font-semibold [&_svg]:h-8 [&_svg]:w-8 ${mode === name ? "border-portal-accent bg-portal-surface text-portal-navy" : "border-portal-border bg-background text-foreground"}`}>
          <Icon aria-hidden="true" />{name}
        </Button>)}
      </div>
      <div className="flex items-center justify-between px-5 pb-5 pt-1">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button disabled={!mode || count === 0} onClick={() => { if (mode) { onConfirm(mode); onOpenChange(false); } }}>Confirm</Button>
      </div>
    </DialogContent>
  </Dialog>;
}