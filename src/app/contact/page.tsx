"use client";

import { PageHero } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { Phone, MapPin, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We'd love to hear from you."
        subtitle="Reach out for donations, partnerships, volunteering or media."
      />

      <section className="section-y container-x grid lg:grid-cols-5 gap-10">
        <Reveal className="lg:col-span-2 space-y-4">
          {[
            {
              icon: Phone,
              title: "Phone",
              value: "0329-5941457",
              href: "tel:03295941457",
            },
            {
              icon: MessageCircle,
              title: "WhatsApp",
              value: "Chat with us on WhatsApp",
              href: "https://wa.me/923295941457",
            },
            {
              icon: Mail,
              title: "Email",
              value: "wujoodwelfare@gmail.com",
              href: "mailto:wujoodwelfare@gmail.com",
            },
            {
              icon: MapPin,
              title: "Location",
              value: "Faisalabad, Pakistan",
            },
          ].map((c) => (
            <a
              key={c.title}
              href={c.href ?? "#"}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 card-lift"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-blue text-primary-foreground">
                <c.icon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {c.title}
                </p>
                <p className="mt-0.5 font-semibold">{c.value}</p>
              </div>
            </a>
          ))}

          <div className="rounded-2xl overflow-hidden border border-border bg-card">
            <iframe
              title="Faisalabad map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=72.95%2C31.35%2C73.20%2C31.50&layer=mapnik&marker=31.4504%2C73.1350"
              className="w-full h-64 border-0"
              loading="lazy"
            />
          </div>
        </Reveal>

        <Reveal delay={1} className="lg:col-span-3">
          <form
            action="https://formsubmit.co/2ed12b319b37c87baa04652e526a9c99"
            method="POST"
            onSubmit={() => toast.success("Sending your message…")}
            className="rounded-3xl border border-border bg-card p-8 md:p-10 shadow-blue"
          >
            <input
              type="hidden"
              name="_subject"
              value="New contact message — Wujood Welfare"
            />
            <input type="hidden" name="_template" value="table" />
            <input type="hidden" name="_captcha" value="false" />
            <input
              type="text"
              name="_honey"
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <h2 className="text-xl font-semibold">Send us a message</h2>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <Field label="Your Name" name="name" required />
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" type="tel" className="md:col-span-2" />
              <Field label="Subject" name="subject" required className="md:col-span-2" />

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex items-center gap-2 rounded-full gradient-gold px-7 py-3 text-sm font-semibold text-secondary-foreground shadow-gold hover:-translate-y-0.5 transition-transform"
            >
              Send Message
            </button>
          </form>
        </Reveal>
      </section>

      <a
        href="https://wa.me/923295941457"
        aria-label="WhatsApp"
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl hover:scale-110 transition"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </>
  );
}

function Field({
  label,
  className,
  ...rest
}: {
  label: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="text-sm font-medium">{label}</label>

      <input
        {...rest}
        className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
