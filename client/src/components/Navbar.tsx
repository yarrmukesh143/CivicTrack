"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: "citizen" | "official";
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // -----------------------------------------
  // Check logged-in user
  // -----------------------------------------
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setUser(null);
        return;
      }

      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Invalid user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }
    };

    loadUser();

    // Useful when login/logout happens in another tab
    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  // -----------------------------------------
  // Navbar scroll effect
  // -----------------------------------------
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // -----------------------------------------
  // Logout
  // -----------------------------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setMenuOpen(false);

    window.location.href = "/";
  };

  // -----------------------------------------
  // Close mobile menu
  // -----------------------------------------
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-5 pt-5 sm:px-8 lg:px-12">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-4 backdrop-blur-xl transition-all duration-500 sm:px-6 ${
          scrolled
            ? "border-white/15 bg-[#071312]/90 py-2.5 shadow-lg shadow-black/20"
            : "border-white/10 bg-white/[0.045] py-3"
        }`}
      >
        {/* -----------------------------------------
            LOGO
        ----------------------------------------- */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center transition-transform duration-300 hover:scale-105"
        >
          <Image
            src="/civictrack_logo.png"
            alt="CivicTrack"
            width={155}
            height={96}
            className="h-11 w-auto object-contain transition-all duration-500 sm:h-13"
            priority
          />
        </Link>

        {/* -----------------------------------------
            DESKTOP NAV
        ----------------------------------------- */}
        <div className="hidden items-center gap-6 md:flex">
          {/* Common links */}
          <div className="flex items-center gap-8">
            <a
              href="#how"
              className="relative text-sm text-white/65 transition hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#38d4c8] after:transition-all after:duration-300 hover:after:w-full"
            >
              How it works
            </a>

            <a
              href="#issues"
              className="relative text-sm text-white/65 transition hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#38d4c8] after:transition-all after:duration-300 hover:after:w-full"
            >
              Issues
            </a>

            <a
              href="#about"
              className="relative text-sm text-white/65 transition hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#38d4c8] after:transition-all after:duration-300 hover:after:w-full"
            >
              About
            </a>
          </div>

          {/* -----------------------------------------
              LOGGED OUT
          ----------------------------------------- */}
          {!user && (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium transition-all duration-300 hover:border-[#1db8aa]/50 hover:bg-white/5"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="group relative overflow-hidden rounded-full bg-[#159b91] px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(21,155,145,.35)]"
              >
                <span className="relative z-10">Get Started</span>

                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>
            </div>
          )}

          {/* -----------------------------------------
              LOGGED IN
          ----------------------------------------- */}
          {user && (
            <div className="flex items-center gap-3">
              {/* Official Dashboard */}
              {user.role === "official" && (
                <Link
                  href="/official"
                  className="rounded-full border border-[#159b91]/30 bg-[#159b91]/10 px-5 py-2.5 text-sm font-medium text-[#65d7cd] transition-all duration-300 hover:border-[#159b91]/60 hover:bg-[#159b91]/20"
                >
                  Official Dashboard
                </Link>
              )}

              {/* Citizen Report */}
              {user.role === "citizen" && (
                <Link
                  href="/report"
                  className="rounded-full border border-[#159b91]/30 bg-[#159b91]/10 px-5 py-2.5 text-sm font-medium text-[#65d7cd] transition-all duration-300 hover:border-[#159b91]/60 hover:bg-[#159b91]/20"
                >
                  Report Issue
                </Link>
              )}

              {/* User info */}
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#159b91]/20 text-sm font-semibold text-[#65d7cd]">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="hidden lg:block">
                  <p className="max-w-[120px] truncate text-xs font-semibold text-white">
                    {user.name || "User"}
                  </p>

                  <p className="text-[10px] capitalize text-white/40">
                    {user.role || "citizen"}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-red-400/20 px-5 py-2.5 text-sm font-medium text-red-300 transition-all duration-300 hover:border-red-400/40 hover:bg-red-400/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* -----------------------------------------
            MOBILE MENU BUTTON
        ----------------------------------------- */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-xl border border-white/10 px-3 py-2 transition hover:bg-white/5 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span className="text-lg">{menuOpen ? "×" : "☰"}</span>
        </button>
      </nav>

      {/* -----------------------------------------
          MOBILE MENU
      ----------------------------------------- */}
      <div
        className={`mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b1a18]/95 backdrop-blur-xl transition-all duration-300 md:hidden ${
          menuOpen
            ? "max-h-[600px] p-5 opacity-100"
            : "max-h-0 p-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-5">
          <a
            href="#how"
            onClick={closeMenu}
            className="text-white/80 transition hover:text-white"
          >
            How it works
          </a>

          <a
            href="#issues"
            onClick={closeMenu}
            className="text-white/80 transition hover:text-white"
          >
            Issues
          </a>

          <a
            href="#about"
            onClick={closeMenu}
            className="text-white/80 transition hover:text-white"
          >
            About
          </a>

          <div className="h-px bg-white/10" />

          {/* -----------------------------------------
              MOBILE LOGGED OUT
          ----------------------------------------- */}
          {!user && (
            <>
              <Link
                href="/login"
                onClick={closeMenu}
                className="text-white/70 transition hover:text-white"
              >
                Login
              </Link>

              <Link
                href="/signup"
                onClick={closeMenu}
                className="rounded-full bg-[#159b91] px-5 py-3 text-center font-semibold"
              >
                Get Started
              </Link>
            </>
          )}

          {/* -----------------------------------------
              MOBILE LOGGED IN
          ----------------------------------------- */}
          {user && (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#159b91]/20 font-semibold text-[#65d7cd]">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {user.name || "User"}
                    </p>

                    <p className="text-xs capitalize text-white/40">
                      {user.role || "citizen"}
                    </p>
                  </div>
                </div>
              </div>

              {user.role === "citizen" && (
                <Link
                  href="/report"
                  onClick={closeMenu}
                  className="rounded-full bg-[#159b91] px-5 py-3 text-center font-semibold"
                >
                  Report Issue
                </Link>
              )}

              {user.role === "official" && (
                <Link
                  href="/official"
                  onClick={closeMenu}
                  className="rounded-full bg-[#159b91] px-5 py-3 text-center font-semibold"
                >
                  Official Dashboard
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-red-400/20 px-5 py-3 text-center font-semibold text-red-300 transition hover:bg-red-400/10"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}