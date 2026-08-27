import Link from "next/link";
import { OfficeClock } from "./OfficeClock";

const OFFICES = [
  { city: "Los Angeles", timeZone: "America/Los_Angeles", email: "usa@theunmarketing.agency", clockAttr: "PST" },
  { city: "Singapore", timeZone: "Asia/Singapore", email: "singapore@theunmarketing.agency", clockAttr: "+08" },
  { city: "Mumbai / Goa", timeZone: "Asia/Kolkata", email: "india@theunmarketing.agency", clockAttr: "IST" },
] as const;

const ADDITIONAL_PAGES = [
  { href: "/authors", label: "Authors" },
  { href: "/startups", label: "Startups" },
  { href: "/vc", label: "Venture capital" },
  { href: "/branding-for-startups", label: "Branding for startups" },
  { href: "/branding-for-professional-services", label: "Branding for professional services" },
  { href: "/real-estate-branding", label: "Real estate branding" },
  { href: "/luxury-branding", label: "Luxury branding" },
  { href: "/healthcare-branding", label: "Healthcare branding" },
] as const;

export function Footer() {
  const year = new Date().getUTCFullYear();

  return (
    <footer className="footer-wrap">
      <div className="country-bar-container">
        <div className="country-bar-wrap">
          {OFFICES.map((office) => (
            <div className="country" data-timezone={office.timeZone} key={office.city}>
              <h5 className="heading country-name">{office.city}</h5>
              <div className="city-time">
                <OfficeClock timeZone={office.timeZone} />
              </div>
              <p className="paragraph-tiny gray">
                <a href={`mailto:${office.email}`}>{office.email}</a>
              </p>
            </div>
          ))}
        </div>
      </div>

      <nav aria-label="Additional pages" className="visually-hidden">
        <ul>
          {ADDITIONAL_PAGES.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="footer-lowest">
        <Link className="webflow-link w-inline-block" href="/privacy-policy">
          <div className="paragraph-tiny">
            © {year} The Unmarketing Agency Pte. Ltd., All Rights Reserved - Privacy Policy
          </div>
        </Link>
        <div className="footer-links">
          <a
            aria-label="Instagram"
            className="social-icon-wrap w-inline-block"
            href="https://www.instagram.com/theunmarketing/"
            rel="noreferrer noopener"
            target="_blank"
          >
            <svg className="social-icon" fill="currentColor" height="20" viewBox="0 0 54.6 54.6" width="20">
              <path d="M39.49,0H15.07C6.74,0,0,6.74,0,15.07v24.46c0,8.29,6.74,15.07,15.07,15.07h24.46c8.29,0,15.07-6.74,15.07-15.07V15.07c-.03-8.32-6.81-15.07-15.1-15.07h0ZM49.72,39.49c0,5.65-4.58,10.23-10.23,10.23H15.07c-5.65,0-10.23-4.58-10.23-10.23V15.07c0-5.65,4.58-10.23,10.23-10.23h24.46c5.65,0,10.23,4.58,10.23,10.23l-.03,24.42h0Z" />
              <path d="M27.26,13.23c-7.74,0-14.04,6.29-14.04,14.04s6.29,14.07,14.07,14.07,14.07-6.29,14.07-14.07c-.03-7.74-6.32-14.04-14.1-14.04ZM27.26,36.49c-5.07,0-9.23-4.13-9.23-9.23.03-5.07,4.16-9.2,9.23-9.2s9.23,4.13,9.23,9.23-4.13,9.2-9.23,9.2Z" />
              <path d="M41.91,9.13c-.94,0-1.84.39-2.52,1.03-.68.65-1.03,1.58-1.03,2.52s.39,1.84,1.03,2.52c.65.65,1.58,1.03,2.52,1.03s1.84-.39,2.52-1.03,1.03-1.58,1.03-2.52-.39-1.84-1.03-2.52c-.65-.68-1.58-1.03-2.52-1.03Z" />
            </svg>
          </a>
          <a
            aria-label="X"
            className="social-icon-wrap w-inline-block"
            href="https://www.x.com/theunmarketing"
            rel="noreferrer noopener"
            target="_blank"
          >
            <svg className="social-icon" fill="currentColor" height="18" viewBox="0 0 300.1 271" width="18">
              <path d="M237.1,0h46l-101,115,118,156h-92.6l-72.5-94.8-83,94.8H6l107-123L0,0h94.9l65.5,86.6L237.1,0ZM221,244h25.5L81.5,26h-27.4l166.9,218Z" />
            </svg>
          </a>
          <a
            aria-label="LinkedIn"
            className="social-icon-wrap w-inline-block"
            href="https://www.linkedin.com/company/theunmarketingagency/"
            rel="noreferrer noopener"
            target="_blank"
          >
            <svg className="social-icon" fill="currentColor" height="18" viewBox="0 0 52.01 52" width="18">
              <path fillRule="evenodd" d="M52,52h-10.68v-18.2c0-4.99-1.9-7.78-5.84-7.78-4.3,0-6.54,2.9-6.54,7.78v18.2h-10.3V17.33h10.3v4.67s3.1-5.73,10.45-5.73,12.62,4.49,12.62,13.78v21.95h0ZM6.35,12.79c-3.51,0-6.35-2.86-6.35-6.4S2.84,0,6.35,0s6.35,2.86,6.35,6.4-2.84,6.4-6.35,6.4h0ZM1.03,52h10.74V17.33H1.03v34.67Z" />
            </svg>
          </a>
          <a
            aria-label="Vimeo"
            className="social-icon-wrap w-inline-block"
            href="https://vimeo.com/theunmarketingagency"
            rel="noreferrer noopener"
            target="_blank"
          >
            <svg className="social-icon" fill="currentColor" height="18" viewBox="0 0 55.21 47.74" width="18">
              <path d="M55.19,11.02c-.25,5.35-4.01,12.73-11.26,22.08-7.51,9.74-13.87,14.64-19.03,14.64-3.25,0-5.92-2.99-8.15-8.91-1.46-5.47-2.99-10.88-4.46-16.36-1.65-5.92-3.44-8.91-5.35-8.91-.38,0-1.85.89-4.33,2.61l-2.61-3.37c2.74-2.42,5.41-4.77,8.08-7.19C11.72,2.49,14.46.84,16.3.65c4.26-.38,6.94,2.55,7.96,8.78,1.08,6.81,1.85,11.01,2.23,12.67,1.21,5.6,2.61,8.46,4.07,8.46,1.15,0,2.86-1.85,5.22-5.47,2.29-3.63,3.56-6.43,3.69-8.34.32-3.12-.89-4.71-3.69-4.71-1.34,0-2.67.32-4.07.89C34.44,4.02,39.6-.24,47.23.01c5.6.13,8.27,3.82,7.96,11.01Z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
