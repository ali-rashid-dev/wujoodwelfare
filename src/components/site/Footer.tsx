import  Link  from "next/link";
import Image from "next/image";
import { Phone, MapPin, Mail } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="mt-24 bg-primary-dark text-primary-foreground">
      <div className="container-x py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Wujood Welfare" className="h-12 w-12 rounded-full bg-primary" width={48} height={48} />
            <div>
              <p className="text-lg font-bold">Wujood Welfare</p>
              <p className="text-xs text-primary-foreground/70 tracking-wider">Zindagi Ko Wujood Do</p>
            </div>
          </div>
          <p className="mt-5 text-sm text-primary-foreground/75 leading-relaxed">
            A Faisalabad-based welfare organization restoring dignity through food,
            healthcare, education, and emergency relief.
          </p>
          <p className="mt-4 font-urdu text-base text-secondary">زندگی کو وجو د دو</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            {[
              ["/about", "About"],
              ["/programs", "Programs"],
              ["/projects", "Projects"],
              ["/gallery", "Gallery"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-secondary transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary">Get Involved</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li><Link href="/donate" className="hover:text-secondary">Donate</Link></li>
            <li><Link href="/volunteer" className="hover:text-secondary">Volunteer</Link></li>
            <li><Link href="/contact" className="hover:text-secondary">Contact</Link></li>
            <li><Link href="/admin" className="hover:text-secondary">Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary">Reach Us</h4>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
            <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-secondary" />0329-5941457</li>
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-secondary" />Faisalabad, Pakistan</li>
            <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-secondary" />wujoodwelfare@gmail.com</li>
          </ul>
          <div className="mt-5 flex gap-2">
            <a href="https://www.facebook.com/p/Wujood-Welfare-61576104369942/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition">
              <FaFacebook className="h-4 w-4" />
            </a>
            <a href="https://www.instagram.com/wujoodwelfare/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition">
              <FaInstagram className="h-4 w-4" />
            </a>
            <a href="https://www.threads.com/@wujoodwelfare?xmt=AQG0980fGcEra097cMAPk0ALumZ1QnhgxTFZZQBUF-i2EK0" target="_blank" rel="noopener noreferrer" aria-label="Threads" className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition">
              <FaTwitter className="h-4 w-4" />
            </a>
            <a href="https://www.youtube.com/@WujoodWelfare4" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10 hover:bg-secondary hover:text-secondary-foreground transition">
              <FaYoutube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="container-x flex flex-col sm:flex-row items-center justify-between gap-2 py-5 text-xs text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Wujood Welfare. All rights reserved.</p>
          <p>Made with ❤ in Faisalabad, Pakistan.</p>
        </div>
      </div>
    </footer>
  );
}
