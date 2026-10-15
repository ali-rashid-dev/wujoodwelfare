import { Reveal } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/SiteLayout";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ContactForm } from "@/components/sections/ContactForm";

type ContactCard = {
  icon: LucideIcon;
  title: string;
  value: string;
  href?: string;
};

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
          {([
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
              value: "Taj colony sargodha Road Near MTM Faisalabad, Pakistan",
            },
          ] satisfies ContactCard[]).map((c) => {
            const content = (
              <>
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-blue text-primary-foreground">
                <c.icon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {c.title}
                </p>
                <p className="mt-0.5 font-semibold">{c.value}</p>
              </div>
              </>
            );

            return c.href ? (
              <a
                key={c.title}
                href={c.href}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 card-lift"
              >
                {content}
              </a>
            ) : (
              <div
                key={c.title}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 card-lift"
              >
                {content}
              </div>
            );
          })}

          <div className="rounded-2xl overflow-hidden border border-border bg-card">
            <iframe
              title="Wujood Welfare location map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3404.0886017096327!2d73.0892656746928!3d31.439227651148077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39226930a5685e35%3A0x60ba777945ec075d!2sWujood%20Welfare!5e0!3m2!1sen!2s!4v1781953720381!5m2!1sen!2s"
              className="w-full h-64 border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>

        <Reveal delay={1} className="lg:col-span-3">
          <ContactForm />
        </Reveal>
      </section>
    </>
  );
}
