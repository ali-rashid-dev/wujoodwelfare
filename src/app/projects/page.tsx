import { PageHero } from "@/components/site/SiteLayout";
import { Stagger, StaggerItem } from "@/components/site/Reveal";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";



const projects = [
  {
    img: "/gallery-food.jpg",
    tag: "Food",
    title: "Ramadan Iftar Drive",
    desc: "Daily iftar meals served to 250 families across Faisalabad.",
    progress: 65,
  },
  {
    img: "/gallery-medical.jpg",
    tag: "Medical",
    title: "Free Medical Camp",
    desc: "Free check-ups, medicines and diagnostics in low-income areas.",
    progress: 80,
  },
  {
    img: "/gallery-education.jpg",
    tag: "Education",
    title: "Back to School",
    desc: "School fees, books and uniforms for 120 deserving students.",
    progress: 45,
  },
  {
    img: "/gallery-clothes.jpg",
    tag: "Clothes",
    title: "Winter Warmth",
    desc: "Blankets and warm clothing distributed during winter months.",
    progress: 90,
  },
  {
    img: "/gallery-volunteers.jpg",
    tag: "Relief",
    title: "Flood Relief",
    desc: "Emergency ration packs and shelter for displaced families.",
    progress: 100,
  },
  {
    img: "/gallery-community.jpg",
    tag: "Awareness",
    title: "Hygiene Awareness",
    desc: "Health and hygiene awareness sessions in schools.",
    progress: 30,
  },
];

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Projects"
        title="Work in motion."
        subtitle="A look at active and completed welfare projects."
      />

      <section className="section-y container-x">
        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <StaggerItem key={p.title}>
              <article className="group h-full overflow-hidden rounded-2xl border border-border bg-card card-lift">
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    src={p.img}
                    alt={p.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <span className="absolute top-3 left-3 rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                    {p.tag}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold">{p.title}</h3>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {p.desc}
                  </p>

                  <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full gradient-gold"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {p.progress}% complete
                    </span>

                    <Link
                      href="/donate"
                      className="inline-flex items-center gap-1 font-semibold text-primary"
                    >
                      Support <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
