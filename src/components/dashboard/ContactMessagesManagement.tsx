"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Mail, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteContactMessage,
  updateContactMessageStatus,
} from "@/actions/contact";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/ui/list-pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CONTACT_MESSAGE_STATUSES,
  type ContactMessageStatus,
} from "@/validation";

type ContactMessageRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
};

const statusLabels: Record<ContactMessageStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const statusStyles: Record<ContactMessageStatus, string> = {
  new: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  in_progress: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  resolved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

function isContactStatus(status: string): status is ContactMessageStatus {
  return CONTACT_MESSAGE_STATUSES.some((validStatus) => validStatus === status);
}

function MessageStatus({
  status,
  onChange,
  disabled,
}: {
  status: string;
  onChange: (status: ContactMessageStatus) => void;
  disabled?: boolean;
}) {
  const validStatus = isContactStatus(status) ? status : "new";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="outline" className={statusStyles[validStatus]}>
        {statusLabels[validStatus]}
      </Badge>
      <select
        value={validStatus}
        disabled={disabled}
        onChange={(event) => {
          const nextStatus = event.target.value;
          if (isContactStatus(nextStatus)) onChange(nextStatus);
        }}
        aria-label="Update message status"
        className="h-9 rounded-lg border border-input bg-background px-2.5 text-xs font-medium disabled:opacity-60"
      >
        {CONTACT_MESSAGE_STATUSES.map((item) => (
          <option key={item} value={item}>{statusLabels[item]}</option>
        ))}
      </select>
    </div>
  );
}

export function ContactMessagesManagement({
  initialMessages,
}: {
  initialMessages: ContactMessageRecord[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ContactMessageStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessageRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const pageSize = 10;

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return messages.filter((message) => {
      const matchesStatus = statusFilter === "all" || message.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        [message.name, message.email, message.subject, message.message, message.phone ?? ""]
          .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [messages, query, statusFilter]);

  const [page, setCurrentPage] = useState(1);
  const pageCount = Math.ceil(filteredMessages.length / pageSize);
  const adjustedPage = Math.min(page, Math.max(pageCount, 1));
  const currentPageItems = filteredMessages.slice((adjustedPage - 1) * pageSize, adjustedPage * pageSize);

  const selectedMessage = messages.find((message) => message.id === selectedId) ?? null;

  const handleStatusChange = async (id: string, status: ContactMessageStatus) => {
    setBusyId(id);
    try {
      const result = await updateContactMessageStatus(id, status);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setMessages((current) =>
        current.map((message) => message.id === id ? { ...message, status: result.status } : message),
      );
      toast.success(`Message marked ${statusLabels[result.status].toLowerCase()}.`);
    } catch (error) {
      console.error("Contact message status update request failed:", error);
      toast.error("Could not update this message.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      const result = await deleteContactMessage(deleteTarget.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setMessages((current) => current.filter((message) => message.id !== deleteTarget.id));
      setSelectedId((current) => current === deleteTarget.id ? null : current);
      toast.success("Contact message deleted.");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Contact message deletion request failed:", error);
      toast.error("Could not delete this message.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard title="All messages" count={messages.length} />
        {CONTACT_MESSAGE_STATUSES.map((status) => (
          <SummaryCard
            key={status}
            title={statusLabels[status]}
            count={messages.filter((message) => message.status === status).length}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            aria-label="Search contact messages"
            placeholder="Search names, email, subjects, or message text..."
            className="h-10 pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => {
            const nextStatus = event.target.value;
            if (nextStatus === "all" || isContactStatus(nextStatus)) {
              setStatusFilter(nextStatus);
              setCurrentPage(1);
            }
          }}
          aria-label="Filter contact messages by status"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="all">All statuses</option>
          {CONTACT_MESSAGE_STATUSES.map((status) => (
            <option key={status} value={status}>{statusLabels[status]}</option>
          ))}
        </select>
      </div>

      <section aria-label="Contact messages" className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card px-5 py-12 text-center">
            <Mail className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-semibold">No contact messages found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {query || statusFilter !== "all"
                ? "Try changing your search or status filter."
                : "Messages sent through the public contact form will appear here."}
            </p>
          </div>
        ) : (
          currentPageItems.map((message) => (
            <article
              key={message.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
            >
              <button
                type="button"
                onClick={() => setSelectedId(message.id)}
                className="min-w-0 flex-1 text-left"
                aria-label={`View message from ${message.name}: ${message.subject}`}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="font-semibold">{message.subject}</h2>
                  <span className="text-xs text-muted-foreground">
                    {format(message.createdAt, "PPp")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {message.name} · {message.email}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {message.message}
                </p>
              </button>
              <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                <MessageStatus
                  status={message.status}
                  disabled={busyId === message.id}
                  onChange={(status) => void handleStatusChange(message.id, status)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Delete message from ${message.name}`}
                  onClick={() => setDeleteTarget(message)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))
        )}
      </section>

      <ListPagination
        currentPage={adjustedPage}
        pageCount={pageCount}
        totalItems={filteredMessages.length}
        pageSize={pageSize}
        itemLabel="messages"
        onPageChange={setCurrentPage}
      />

      <Dialog open={Boolean(selectedMessage)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject}</DialogTitle>
                <DialogDescription>
                  Received {format(selectedMessage.createdAt, "PPp")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5">
                <dl className="grid gap-3 rounded-xl bg-muted/40 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">From</dt>
                    <dd className="mt-1 font-medium">{selectedMessage.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Email</dt>
                    <dd className="mt-1 break-all font-medium">
                      <a className="text-primary underline-offset-4 hover:underline" href={`mailto:${selectedMessage.email}`}>
                        {selectedMessage.email}
                      </a>
                    </dd>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Phone</dt>
                      <dd className="mt-1 font-medium">{selectedMessage.phone}</dd>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">Status</dt>
                    <dd className="mt-2">
                      <MessageStatus
                        status={selectedMessage.status}
                        disabled={busyId === selectedMessage.id}
                        onChange={(status) => void handleStatusChange(selectedMessage.id, status)}
                      />
                    </dd>
                  </div>
                </dl>
                <div>
                  <h3 className="text-sm font-semibold">Message</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words rounded-xl border border-border bg-background p-4 text-sm leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteTarget(selectedMessage)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete message
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact message?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the message from {deleteTarget?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId === deleteTarget?.id}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busyId === deleteTarget?.id}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {busyId === deleteTarget?.id ? "Deleting…" : "Delete message"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SummaryCard({ title, count }: { title: string; count: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-bold">{count}</p>
    </div>
  );
}
