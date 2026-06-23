import { Counter } from "@/components/site/Counter";
import { Reveal } from "@/components/site/Reveal";

const items = [
  { value: 1000, prefix: "", suffix: "+", label: "Donors" },
  { value: 20000, prefix: "", suffix: "+", label: "Beneficiaries" },
  { value: 50, prefix: "", suffix: "+", label: "Projects" },
  { value: 1000, prefix: "", suffix: "+", label: "Volunteers" },
];

export function Impact() {
  return (
    <section className="relative section-y overflow-hidden">
      <div className="absolute inset-0 gradient-blue" />
      <div aria-hidden className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      <div className="container-x relative text-primary-foreground">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-secondary/20 text-secondary px-3 py-1 text-xs font-semibold uppercase tracking-widest">Our impact</span>
          <h2 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight">Numbers that mean lives changed</h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it, i) => (
            <Reveal key={it.label} delay={i} className="text-center rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 backdrop-blur p-6">
              <p className="text-4xl md:text-5xl font-bold text-secondary">
                <Counter to={it.value} prefix={it.prefix} suffix={it.suffix} />
              </p>
              <p className="mt-2 text-sm text-primary-foreground/80">{it.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
