"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavigationItem = { href: string; label: string };

type HeaderInteractiveProps = {
  navigation: readonly NavigationItem[];
};

function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderInteractive({ navigation }: HeaderInteractiveProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 60);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const desktopViewport = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };

    desktopViewport.addEventListener("change", closeOnDesktop);
    return () => desktopViewport.removeEventListener("change", closeOnDesktop);
  }, []);

  const isThoughtArticlePage = pathname?.startsWith("/thoughts/") && pathname.split("/").filter(Boolean).length === 2;
  
  return (
    <header
      className={["site-header", isScrolled ? "is-scrolled" : "", isOpen ? "is-open" : "", isThoughtArticlePage ? "transparent" : ""].join(" ")}
      ref={headerRef}
    >
      <div className="site-header__shell">
        <Link className="wordmark" href="/" aria-label="The Unmarketing Agency home" onClick={() => setIsOpen(false)}>
          <Image
            alt=""
            className="wordmark__image"
            height={50}
            preload
            src="/unmarketing-logo.svg"
            width={150}
          />
        </Link>

        <nav aria-label="Primary navigation" className="site-header__desktop-nav">
          <ul>
            {navigation.map((item) => {
              const active = isNavigationItemActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link aria-current={active ? "page" : undefined} href={item.href}>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          className="site-header__menu-button"
          onClick={() => setIsOpen((open) => !open)}
          ref={menuButtonRef}
          type="button"
        >
          <Image
            alt=""
            className="site-header__menu-icon"
            height={28}
            src="/hamburger.svg"
            unoptimized
            width={28}
          />
        </button>

        <nav
          aria-label="Primary navigation"
          className="site-header__mobile-nav"
          hidden={!isOpen}
          id="mobile-navigation"
          ref={mobileNavRef}
        >
          <ul>
            {navigation.map((item) => {
              const active = isNavigationItemActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
