import { Reveal } from "@/components/site/Reveal";
import { Heart } from "lucide-react";
import type { Metadata } from "next";
import { PaymentCard } from "../../components/donate/PaymentCard";

export const metadata: Metadata = {
  title: "Donate — Wujood Welfare",
  description:
    "Donate via bank transfer or Easypaisa. Support food, healthcare, education and emergency relief in Pakistan.",
  openGraph: {
    title: "Donate to Wujood Welfare",
    description: "Every rupee goes directly to families in need.",
  },
  alternates: {
    canonical: "/donate",
  },
};

export default function DonatePage() {
  return (
    <section className="container-x py-10 md:py-14">
      <Reveal className="relative overflow-hidden rounded-[2.5rem] shadow-blue gradient-blue">
        <div className="relative px-6 py-16 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
            <Heart className="h-3.5 w-3.5" /> Donate Now
          </div>

          <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-white">
            Your kindness, in action.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base md:text-lg text-white/85">
            Zindagi Ko Wujood Do. Your contribution provides essential aid to
            families in need.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid md:grid-cols-2 gap-8">
        <Reveal>
          <PaymentCard
            icon="building2"
            title="Bank Transfer"
            accent="primary"
            rows={[
              { label: "Account Title", value: "Hiba" },
              { label: "Bank Name", value: "Allied Bank Limited" },
              { label: "Branch", value: "Faisalabad" },
            ]}
            highlight={{
              label: "Account Number",
              value: "08660010117067100019",
            }}
          />
        </Reveal>

        <Reveal delay={1}>
          <PaymentCard
            icon="smartphone"
            title="Easypaisa"
            accent="gold"
            rows={[{ label: "Account Title", value: "Huba" }]}
            highlight={{
              label: "Mobile Number",
              value: "0329-5941457",
            }}
            note="After making your donation, please send us a screenshot of the confirmation on WhatsApp."
          />
        </Reveal>
      </div>
    </section>
  );
}
