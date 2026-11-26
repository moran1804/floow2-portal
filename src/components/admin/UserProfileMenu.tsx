import { useState } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const UserProfileMenu = ({ initials, onSignOut }: { initials: string; onSignOut: () => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <HoverCard.Root open={open} onOpenChange={setOpen} openDelay={100} closeDelay={200}>
      <HoverCard.Trigger asChild>
        <Button
          size="icon"
          aria-label="Account options"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          onFocus={() => setOpen(true)}
          className="h-9 w-9 rounded-full bg-portal-navy text-xs font-semibold text-portal-navy-foreground"
        >
          {initials}
        </Button>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          align="end"
          sideOffset={8}
          onEscapeKeyDown={() => setOpen(false)}
          className="z-50 w-40 rounded-md border border-portal-border bg-portal-panel p-1 shadow-md"
        >
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={onSignOut}>
            <LogOut className="h-4 w-4" />Sign out
          </Button>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};