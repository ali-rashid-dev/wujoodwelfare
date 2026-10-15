import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { getAdminContactMessages } from "@/actions/contact";
import { ContactMessagesManagement } from "@/components/dashboard/ContactMessagesManagement";

export const metadata: Metadata = {
  title: "Contact Messages",
  description: "Review and manage messages submitted through the public contact form.",
};

export default async function AdminMessagesPage() {
  const messages = await getAdminContactMessages();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-r from-primary/15 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Mail className="h-3.5 w-3.5" />
          Administrative Console
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Contact Messages
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Review incoming messages, track follow-up status, and remove messages when appropriate.
          This inbox is restricted to administrators.
        </p>
      </div>

      <ContactMessagesManagement initialMessages={messages} />
    </div>
  );
}
