import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function FilesTable({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <section className="space-y-3">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-3xl font-bold text-portal-navy">{title}</h2><p className="mt-1 pl-6 text-sm">{description}</p></div>
      {action}
    </div>
    <div className="overflow-x-auto rounded-md bg-portal-panel shadow-sm">
      <table className="w-full min-w-[540px] text-left text-sm">
        <thead className="bg-portal-panel-header"><tr><th className="w-[41%] px-6 py-3 font-semibold text-portal-muted">Filename</th><th className="w-[42%] py-3 font-semibold text-portal-muted">Last modified</th><th className="py-3 font-semibold text-portal-muted">Actions</th></tr></thead>
        <tbody><tr><td colSpan={3} className="p-3 text-center">No files found</td></tr></tbody>
      </table>
    </div>
  </section>;
}

export default function UserFilesSection() {
  const [open, setOpen] = useState(false);
  return <div className="space-y-10">
    <h1 className="text-4xl font-bold text-portal-navy">User files</h1>
    <FilesTable title="Incoming files" description="Files uploaded by the user's device." />
    <FilesTable title="Outgoing files" description="Files going out to the user's device." action={<Button onClick={() => setOpen(true)}>Upload outgoing file</Button>} />
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Upload outgoing file</DialogTitle><DialogDescription>File transfer to the user's device is not connected yet. No file has been uploaded.</DialogDescription></DialogHeader></DialogContent></Dialog>
  </div>;
}
