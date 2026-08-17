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

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("storage", loadUser);

    return () => window.removeEventListener("storage", loadUser);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-5 pt-5 sm:px-8 lg:px-12">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-4 backdrop-blur-xl transition-all duration-500 sm:px-6 ${
          scrolled
            ? "border-white/15 bg-[#071312]/90 py-2.5 shadow-lg"
            : "border-white/10 bg-white/5 py-3"
        }`}
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <Image
            src="/civictrack_logo.png"
            alt="CivicTrack"
            width={150}
            height={80}
          />
        </Link>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center gap-6">
          {!user && (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Signup</Link>
            </>
          )}

          {user?.role === "citizen" && (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/report">Report Issue</Link>
            </>
          )}

          {user?.role === "official" && (
            <Link href="/official">Official Dashboard</Link>
          )}

          {user && <button onClick={handleLogout}>Logout</button>}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden"
        >
          ☰
        </button>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden bg-black text-white p-5">
          {!user && (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}>
                Signup
              </Link>
            </>
          )}

          {user?.role === "citizen" && (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link href="/report" onClick={() => setMenuOpen(false)}>
                Report Issue
              </Link>
            </>
          )}

          {user?.role === "official" && (
            <Link href="/official" onClick={() => setMenuOpen(false)}>
              Official Dashboard
            </Link>
          )}

          {user && (
            <button onClick={handleLogout}>Logout</button>
          )}
        </div>
      )}
    </header>
  );
}
