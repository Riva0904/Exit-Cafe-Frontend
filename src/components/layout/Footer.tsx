import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiMapPin, FiMail, FiPhone, FiTwitter } from 'react-icons/fi';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-900/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <span className="font-display text-2xl font-bold text-gradient-gold">Exit Caff</span>
          <p className="mt-3 text-sm leading-relaxed text-cream-200/60">
            Delight in every bite. Handcrafted cakes, pastries and coffee, baked fresh daily at TMJ Complex,
            Azhagiyamandapam.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Facebook" className="text-cream-200/50 hover:text-gold-400">
              <FiFacebook size={18} />
            </a>
            <a href="#" aria-label="Instagram" className="text-cream-200/50 hover:text-gold-400">
              <FiInstagram size={18} />
            </a>
            <a href="#" aria-label="Twitter" className="text-cream-200/50 hover:text-gold-400">
              <FiTwitter size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-gold-400">
            Explore
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-cream-200/60">
            <li><Link to="/menu" className="hover:text-gold-400">Menu</Link></li>
            <li><Link to="/about" className="hover:text-gold-400">About Us</Link></li>
            <li><Link to="/catering" className="hover:text-gold-400">Catering Services</Link></li>
            <li><Link to="/gallery" className="hover:text-gold-400">Gallery</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-gold-400">
            Company
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-cream-200/60">
            <li><Link to="/careers" className="hover:text-gold-400">Careers</Link></li>
            <li><Link to="/faq" className="hover:text-gold-400">FAQ</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-gold-400">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-gold-400">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-gold-400">
            Visit Us
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-cream-200/60">
            <li className="flex items-start gap-2">
              <FiMapPin className="mt-0.5 shrink-0 text-gold-500" /> TMJ Complex, Azhagiyamandapam
            </li>
            <li className="flex items-center gap-2">
              <FiPhone className="shrink-0 text-gold-500" /> +91 00000 00000
            </li>
            <li className="flex items-center gap-2">
              <FiMail className="shrink-0 text-gold-500" /> hello@exitcaff.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-cream-200/40">
        © {new Date().getFullYear()} Exit Caff. All rights reserved.
      </div>
    </footer>
  );
}
