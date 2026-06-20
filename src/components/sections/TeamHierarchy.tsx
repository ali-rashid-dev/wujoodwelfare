import { Reveal } from "@/components/site/Reveal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, HandHeart, ShieldCheck, UserRound, Users2 } from "lucide-react";

type Node = {
  role: string;
  name?: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  avatar?: string;
};

type Tier = {
  level: string;
  tone: "gold" | "blue" | "soft";
  nodes: Node[];
};

const tiers: Tier[] = [
  {
    level: "Leadership",
    tone: "gold",
    nodes: [
      { role: "Founder & Chairman", name: "Muhammad Ahsan", desc: "Sets vision, strategy and overall direction of Wujood Welfare.", icon: Crown, avatar: "https://i.pravatar.cc/200?img=12" },
    ],
  },
  {
    level: "Core Team",
    tone: "blue",
    nodes: [
      { role: "Operations Director", name: "Hamza Raza", desc: "Runs day-to-day field operations across all programs.", icon: ShieldCheck, avatar: "https://i.pravatar.cc/200?img=15" },
      { role: "Programs Director", name: "Ayesha Siddiqui", desc: "Owns Health, Education, Food and Child-support programs.", icon: ShieldCheck, avatar: "https://i.pravatar.cc/200?img=45" },
      { role: "Finance & Trust Lead", name: "Bilal Akhtar", desc: "Manages transparent accounts, donor reporting and audits.", icon: ShieldCheck, avatar: "https://i.pravatar.cc/200?img=33" },
    ],
  },
  {
    level: "Coordinators",
    tone: "blue",
    nodes: [
      { role: "Health Coordinator", name: "Dr. Sana Malik", desc: "Plans medical camps, patient follow-ups and partner clinics.", icon: Users2, avatar: "https://i.pravatar.cc/200?img=47" },
      { role: "Education Coordinator", name: "Usman Tariq", desc: "Sponsorships, school tie-ups and student mentoring.", icon: Users2, avatar: "https://i.pravatar.cc/200?img=53" },
      { role: "Food Support Coordinator", name: "Fatima Noor", desc: "Weekly rations, langar drives and emergency relief.", icon: Users2, avatar: "https://i.pravatar.cc/200?img=44" },
      { role: "Child Protection Coordinator", name: "Zainab Iqbal", desc: "Orphan care and child-labour rescue & rehabilitation.", icon: Users2, avatar: "https://i.pravatar.cc/200?img=49" },
      { role: "Awareness & Media Coordinator", name: "Ali Hassan", desc: "Community awareness, content and outreach.", icon: Users2, avatar: "https://i.pravatar.cc/200?img=60" },
    ],
  },
  {
    level: "Team Leads",
    tone: "soft",
    nodes: [
      { role: "Area Team Lead", name: "Hassan Sheikh", desc: "Leads volunteer pods in each Faisalabad zone.", icon: HandHeart, avatar: "https://i.pravatar.cc/200?img=68" },
      { role: "Event Team Lead", name: "Mariam Javed", desc: "On-ground lead for camps, drives and campaigns.", icon: HandHeart, avatar: "https://i.pravatar.cc/200?img=32" },
    ],
  },
  {
    level: "Volunteers",
    tone: "soft",
    nodes: [
      { role: "Field Volunteer", name: "Hamza Saeed", desc: "Delivers rations, assists at camps and runs school visits.", icon: UserRound, avatar: "https://i.pravatar.cc/200?img=11" },
      { role: "Skilled Volunteer", name: "Dr. Areeba Khan", desc: "Doctor supporting medical camps and patient care.", icon: UserRound, avatar: "https://i.pravatar.cc/200?img=48" },
      { role: "Campus Ambassador", name: "Ibrahim Yousaf", desc: "Student mobilising peers and running awareness drives.", icon: UserRound, avatar: "https://i.pravatar.cc/200?img=14" },
    ],
  },
];

const toneBadgeClasses = {
  gold: "text-secondary bg-secondary/10",
  blue: "text-primary bg-primary/10",
  soft: "text-muted-foreground bg-muted",
};

const avatarFallbackClasses = {
  gold: "gradient-gold text-secondary-foreground",
  blue: "bg-primary text-primary-foreground",
  soft: "bg-muted text-muted-foreground",
};

function getInitials(name: string | undefined, role: string): string {
  if (name) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }
  return role
    .split(" ")
    .filter((w) => w.length > 2)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function TeamHierarchy() {
  return (
    <section className="section-y container-x">
      <Reveal>
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Our Structure</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold">Team &amp; Volunteer Hierarchy</h2>
          <p className="mt-3 text-muted-foreground">
            A clear chain of responsibility — from leadership to the volunteers on the ground — so every donation and every hour given turns into measurable impact.
          </p>
        </div>
      </Reveal>

      <div className="mt-16 relative max-w-6xl mx-auto">
        {/* Vertical spine */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-secondary/30 to-transparent md:-translate-x-1/2" />

        <div className="space-y-16">
          {tiers.map((tier, ti) => (
            <Reveal key={tier.level} delay={ti}>
              <div className="relative pl-14 md:pl-0">
                {/* Node dot on spine */}
                <div className="absolute left-6 md:left-1/2 top-1 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-secondary ring-4 ring-background z-10" />

                {/* Vertical drop from dot to cards (desktop only) */}
                <div className="hidden md:block absolute left-1/2 top-5 -translate-x-1/2 w-px h-5 bg-linear-to-b from-secondary/30 to-transparent" />

                {/* Tier label */}
                <div className="md:text-center md:pt-6">
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                    {tier.level}
                  </span>
                </div>

                {/* Cards */}
                <div className="mt-5 flex flex-wrap justify-start md:justify-center gap-5">
                  {tier.nodes.map((n) => {
                    const Icon = n.icon;
                    const initials = getInitials(n.name, n.role);

                    return (
                      <div
                        key={n.role}
                        className="group relative flex flex-col items-center text-center p-6 rounded-2xl border border-border bg-card hover:-translate-y-1 transition-all duration-300 hover:shadow-xl w-full sm:w-55"
                      >
                        {/* Avatar */}
                        <Avatar className="h-18 w-18 ring-2 ring-offset-2 ring-offset-background ring-secondary/20">
                          <AvatarImage src={n.avatar} alt={n.name || n.role} />
                          <AvatarFallback className={`text-xl font-bold ${avatarFallbackClasses[tier.tone]}`}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        {/* Name */}
                        {n.name && (
                          <p className="mt-4 text-lg font-semibold text-foreground">{n.name}</p>
                        )}

                        {/* Role badge */}
                        <div className="mt-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${toneBadgeClasses[tier.tone]}`}>
                            <Icon className="h-3.5 w-3.5" />
                            {n.role}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{n.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
