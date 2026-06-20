import { Reveal } from "@/components/site/Reveal";
import { motion } from "framer-motion";
import { ArrowRight, Baby, GraduationCap, Heart, Megaphone, Stethoscope, Users, Utensils } from "lucide-react";
import Link from "next/link";

const campaigns = [
  {
    id: "health",
    title: "Health & Medical Aid",
    tagline: "Healing lives, one patient at a time",
    description: "Free medical camps, medicines, and emergency treatment for families who cannot afford healthcare.",
    icon: Stethoscope,
    major: true,
    impactLabel: "Patients Treated",
    impactValue: "12,400+",
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-500",
    borderColor: "border-blue-500/30",
  },
  {
    id: "food",
    title: "Food Support",
    tagline: "No one sleeps hungry",
    description: "Monthly ration packs, daily meals, and emergency food relief for struggling families across Faisalabad.",
    icon: Utensils,
    major: true,
    impactLabel: "Meals Served",
    impactValue: "85,000+",
    color: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-500",
    borderColor: "border-amber-500/30",
  },
  {
    id: "education",
    title: "Education",
    tagline: "Lighting the path to knowledge",
    description: "School supplies, tuition support, and scholarships to help children stay in school and build a future.",
    icon: GraduationCap,
    major: false,
    impactLabel: "Children Sponsored",
    impactValue: "2,100+",
    color: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-500/30",
  },
  {
    id: "orphan",
    title: "Orphan & Child Labour Support",
    tagline: "Every child deserves a childhood",
    description: "Rescuing children from labour, providing shelter, care, education, and a safe environment to grow.",
    icon: Baby,
    major: false,
    impactLabel: "Children Rescued",
    impactValue: "680+",
    color: "from-rose-500/20 to-rose-600/10",
    iconColor: "text-rose-500",
    borderColor: "border-rose-500/30",
  },
  {
    id: "awareness",
    title: "Awareness Campaigns",
    tagline: "Knowledge that transforms communities",
    description: "Community workshops on health, hygiene, child rights, and social issues to empower and educate.",
    icon: Megaphone,
    major: false,
    impactLabel: "People Reached",
    impactValue: "45,000+",
    color: "from-violet-500/20 to-violet-600/10",
    iconColor: "text-violet-500",
    borderColor: "border-violet-500/30",
  },
  {
    id: "women",
    title: "Women Empowerment",
    tagline: "Building independence, restoring dignity",
    description: "Vocational training, micro-loans, and support programs to help women become self-reliant and provide for their families.",
    icon: Users,
    major: false,
    impactLabel: "Women Trained",
    impactValue: "1,850+",
    color: "from-pink-500/20 to-pink-600/10",
    iconColor: "text-pink-500",
    borderColor: "border-pink-500/30",
  },
];

export function Campaign() {
  return (
    <section className="section-y container-x">
      <Reveal>
        <div className="text-center mb-12">
          <span className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            Our Campaigns
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold">
            Making an <span className="gradient-gold-text">Impact</span> on Lives
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Every campaign is designed to create lasting change. Your support helps us reach more families and transform more lives across Faisalabad.
          </p>
        </div>
      </Reveal>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign, idx) => {
          const Icon = campaign.icon;
          return (
            <Reveal key={campaign.id} delay={idx * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className={`group relative rounded-2xl border bg-card p-6 overflow-hidden hover:shadow-xl transition-shadow ${campaign.major ? "md:col-span-2 lg:col-span-1 ring-1 ring-primary/20" : ""}`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-linear-to-br ${campaign.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br ${campaign.color} ${campaign.iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    {campaign.major && (
                      <span className="inline-flex items-center rounded-full gradient-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                        Major
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-1">{campaign.title}</h3>
                  <p className="text-sm text-muted-foreground italic mb-3">{campaign.tagline}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{campaign.description}</p>

                  {/* Impact Metric */}
                  <div className={`rounded-xl border ${campaign.borderColor} bg-background/80 backdrop-blur-sm p-4 mb-5`}>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{campaign.impactLabel}</p>
                    <p className="text-2xl md:text-3xl font-bold gradient-gold-text mt-1">{campaign.impactValue}</p>
                  </div>

                  <Link
                    href="/donate"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Support This Cause <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <div className="mt-12 text-center">
          <Link
            href="/donate"
            className="inline-flex items-center gap-2 rounded-full gradient-gold px-8 py-4 text-sm font-semibold text-secondary-foreground shadow-gold hover:-translate-y-0.5 transition-transform"
          >
            <Heart className="h-5 w-5" /> Donate to Support All Campaigns
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
