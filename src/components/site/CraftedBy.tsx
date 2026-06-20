import { Globe, Mail, MessageCircle } from "lucide-react";
import  { FaGithub, FaLinkedin} from "react-icons/fa";

export function CraftedBy() {
  return (
    <section className="bg-background border-t border-border">
      <div className="container-x py-12 md:py-16">
        <div className="flex flex-col items-center text-center">
          <span className="inline-block rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-secondary">
            Website Crafted By
          </span>
          <h3 className="mt-3 text-2xl md:text-3xl font-bold text-foreground">
            Ali Rashid
          </h3>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground leading-relaxed">
            Passionate about building digital experiences that make a difference.
            Combining modern tech with thoughtful design to help organizations like Wujood Welfare amplify their impact online.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              { label: "React" },
              { label: "TypeScript" },
              { label: "Tailwind CSS" },
              { label: "Framer Motion" },
              { label: "Shadcn UI" },
            ].map((t) => (
              <span
                key={t.label}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {t.label}
              </span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="https://alirashid-sigma.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full gradient-blue px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-blue transition-transform hover:-translate-y-0.5"
            >
              <Globe className="h-4 w-4" /> Portfolio
            </a>
            <a
              href="https://github.com/ali-rashid-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5 hover:border-primary"
            >
              <FaGithub className="h-4 w-4" /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/ali-rashid3/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5 hover:border-primary"
            >
              <FaLinkedin className="h-4 w-4" /> LinkedIn
            </a>
            <a
              href="mailto:alirashid2020e@gmail.com"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5 hover:border-primary"
            >
              <Mail className="h-4 w-4" /> Email
            </a>
            <a
              href="https://wa.me/923287486641"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-transform hover:-translate-y-0.5 hover:border-primary"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
