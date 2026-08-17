"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: "citizen" | "official";
};

/* =========================================================
   SCROLL REVEAL
========================================================= */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-700 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* =========================================================
   TILT CARD
========================================================= */
function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(
    "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)"
  );

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setTransform(
      `perspective(1000px) rotateX(${y * -5}deg) rotateY(${
        x * 5
      }deg) translateY(-5px)`
    );
  }

  function handleLeave() {
    setTransform(
      "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)"
    );
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transform,
        transition: "transform 350ms cubic-bezier(.2,.8,.2,1)",
      }}
      className={className}
    >
      {children}
    </div>
  );
}

/* =========================================================
   COUNTER
========================================================= */
function Counter({
  target,
  suffix = "",
  duration = 1400,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let started = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;

        started = true;

        const start = performance.now();

        function tick(now: number) {
          const progress = Math.min(
            (now - start) / duration,
            1
          );

          const eased = 1 - Math.pow(1 - progress, 3);

          setValue(Math.floor(eased * target));

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            setValue(target);
          }
        }

        requestAnimationFrame(tick);
        observer.unobserve(el);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */
function StatusBadge({
  status,
  color,
}: {
  status: string;
  color: "amber" | "blue" | "teal";
}) {
  const styles = {
    amber:
      "border-amber-300/10 bg-amber-400/10 text-amber-300",
    blue:
      "border-blue-300/10 bg-blue-400/10 text-blue-300",
    teal:
      "border-[#38d4c8]/10 bg-[#38d4c8]/10 text-[#68e1d7]",
  };

  const dots = {
    amber: "bg-amber-300",
    blue: "bg-blue-300",
    teal: "bg-[#48d8ce]",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${styles[color]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[color]}`} />
      {status}
    </span>
  );
}

/* =========================================================
   HOME
========================================================= */
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [cursor, setCursor] = useState({
    x: 50,
    y: 50,
  });

  const heroRef = useRef<HTMLDivElement>(null);

  /* =======================================================
     LOAD USER
  ======================================================= */
  useEffect(() => {
    function loadUser() {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setUser(null);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Invalid stored user:", error);

        localStorage.removeItem("user");
        localStorage.removeItem("token");

        setUser(null);
      }
    }

    loadUser();

    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  /* =======================================================
     SCROLL
  ======================================================= */
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 30);
    }

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* =======================================================
     LOGOUT
  ======================================================= */
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setMenuOpen(false);

    window.location.href = "/";
  }

  /* =======================================================
     HERO MOUSE
  ======================================================= */
  function handleHeroMove(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    const rect = heroRef.current?.getBoundingClientRect();

    if (!rect) return;

    setCursor({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  const issues = [
    {
      title: "Streetlight not working",
      meta: "420m away · 8 min ago",
      status: "Under review",
      color: "amber" as const,
      icon: "💡",
    },
    {
      title: "Pothole on 5th Cross",
      meta: "1.1km away · 2 hr ago",
      status: "In progress",
      color: "blue" as const,
      icon: "🛣️",
    },
    {
      title: "Overflowing garbage bin",
      meta: "600m away · resolved",
      status: "Resolved",
      color: "teal" as const,
      icon: "♻️",
    },
  ];

  const isLoggedIn = !!user;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#040b0a] text-white selection:bg-[#159b91]/40">
      {/* ===================================================
          GLOBAL STYLE
      =================================================== */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes drift {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(35px, -35px, 0) scale(1.08);
          }
        }

        @keyframes driftReverse {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }

          50% {
            transform: translate3d(-30px, 30px, 0) scale(1.05);
          }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(0.8);
            opacity: 0.7;
          }

          80%,
          100% {
            transform: scale(2.3);
            opacity: 0;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-9px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }

          100% {
            background-position: 200% 0;
          }
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }

          100% {
            transform: translateY(500%);
          }
        }

        .animate-drift {
          animation: drift 15s ease-in-out infinite;
        }

        .animate-drift-reverse {
          animation: driftReverse 18s ease-in-out infinite;
        }

        .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }

        .animate-scan {
          animation: scan 5s linear infinite;
        }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            #ffffff 0%,
            #8bf0e7 42%,
            #ffffff 75%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: shimmer 5s linear infinite;
        }

        .hero-grid {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.035) 1px,
              transparent 1px
            );
          background-size: 42px 42px;
          mask-image: linear-gradient(
            to bottom,
            black 0%,
            rgba(0, 0, 0, 0.7) 55%,
            transparent 100%
          );
        }

        .glass {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.09);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .animate-drift,
          .animate-drift-reverse,
          .animate-float,
          .animate-marquee,
          .animate-scan,
          .shimmer-text {
            animation: none !important;
          }
        }
      `}</style>

      {/* ===================================================
          AMBIENT BACKGROUND
      =================================================== */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-drift absolute left-[-220px] top-[100px] h-[500px] w-[500px] rounded-full bg-[#0d8179]/20 blur-[140px]" />

        <div className="animate-drift-reverse absolute right-[-220px] top-[480px] h-[560px] w-[560px] rounded-full bg-[#18b7aa]/10 blur-[160px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(21,155,145,.08),transparent_35%)]" />
      </div>

      {/* ===================================================
          NAVBAR
      =================================================== */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-10">
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-2xl border px-4 transition-all duration-500 sm:px-6 ${
            scrolled
              ? "border-white/15 bg-[#071312]/90 py-2.5 shadow-[0_15px_50px_rgba(0,0,0,.25)] backdrop-blur-2xl"
              : "border-white/10 bg-white/[0.045] py-3 backdrop-blur-xl"
          }`}
        >
          {/* LOGO */}
          <a
            href="/"
            className="group flex items-center"
            aria-label="CivicTrack home"
          >
            <Image
              src="/civictrack_logo.png"
              alt="CivicTrack"
              width={155}
              height={96}
              priority
              className="h-11 w-auto object-contain transition duration-300 group-hover:scale-[1.03] sm:h-12"
            />
          </a>

          {/* DESKTOP NAV */}
          <div className="hidden items-center gap-2 md:flex">
            <a
              href="#how"
              className="rounded-full px-4 py-2 text-sm text-white/55 transition hover:bg-white/[0.05] hover:text-white"
            >
              How it works
            </a>

            <a
              href="#issues"
              className="rounded-full px-4 py-2 text-sm text-white/55 transition hover:bg-white/[0.05] hover:text-white"
            >
              Issues
            </a>

            <a
              href="#about"
              className="rounded-full px-4 py-2 text-sm text-white/55 transition hover:bg-white/[0.05] hover:text-white"
            >
              About
            </a>

            <div className="mx-2 h-5 w-px bg-white/10" />

            {!isLoggedIn && (
              <>
                <a
                  href="/login"
                  className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                >
                  Login
                </a>

                <a
                  href="/signup"
                  className="rounded-full bg-[#159b91] px-5 py-2.5 text-sm font-semibold shadow-[0_8px_30px_rgba(21,155,145,.18)] transition hover:-translate-y-0.5 hover:bg-[#18afa4] hover:shadow-[0_12px_35px_rgba(21,155,145,.3)]"
                >
                  Get Started
                </a>
              </>
            )}

            {isLoggedIn && (
              <>
                <div className="mr-1 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#159b91]/15 text-sm font-bold text-[#6ce0d6]">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>

                  <div className="hidden leading-tight lg:block">
                    <p className="max-w-[120px] truncate text-xs font-semibold">
                      {user?.name || "User"}
                    </p>

                    <p className="mt-0.5 text-[10px] capitalize text-white/35">
                      {user?.role || "citizen"}
                    </p>
                  </div>
                </div>

                {user?.role === "official" ? (
                  <a
                    href="/official"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl border border-[#159b91]/25 bg-[#159b91]/10 px-5 py-3 text-center text-sm font-semibold text-[#65d7cd]"
                  >
                    Official Dashboard
                  </a>
                ) : (
                  <a
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl bg-[#159b91] px-5 py-3 text-center text-sm font-semibold"
                  >
                    Citizen Dashboard
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-red-400/15 px-4 py-2.5 text-sm font-medium text-red-300 transition hover:border-red-400/30 hover:bg-red-400/10"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-lg transition hover:bg-white/[0.07] md:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </nav>

        {/* MOBILE MENU */}
        <div
          className={`mx-auto mt-2 max-w-7xl overflow-hidden rounded-2xl border border-white/10 bg-[#081513]/95 backdrop-blur-2xl transition-all duration-300 md:hidden ${
            menuOpen
              ? "max-h-[700px] p-5 opacity-100 shadow-2xl"
              : "max-h-0 border-transparent p-0 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-2">
            {[
              ["#how", "How it works"],
              ["#issues", "Issues"],
              ["#about", "About"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-white/65 transition hover:bg-white/[0.05] hover:text-white"
              >
                {label}
              </a>
            ))}

            <div className="my-2 h-px bg-white/10" />

            {!isLoggedIn && (
              <>
                <a
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/[0.05]"
                >
                  Login
                </a>

                <a
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-[#159b91] px-4 py-3 text-center text-sm font-semibold"
                >
                  Get Started
                </a>
              </>
            )}

            {isLoggedIn && (
              <>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#159b91]/15 font-bold text-[#65d7cd]">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        {user?.name || "User"}
                      </p>

                      <p className="mt-1 text-xs capitalize text-white/40">
                        {user?.role || "citizen"}
                      </p>
                    </div>
                  </div>

                  {user?.email && (
                    <p className="mt-3 truncate text-xs text-white/30">
                      {user.email}
                    </p>
                  )}
                </div>

                {user?.role === "official" ? (
                  <a
                    href="/official"
                    className="rounded-full border border-[#159b91]/25 bg-[#159b91]/10 px-5 py-2.5 text-sm font-semibold text-[#65d7cd]"
                  >
                    Official Dashboard
                  </a>
                ) : (
                  <a
                    href="/dashboard"
                    className="rounded-full bg-[#159b91] px-5 py-2.5 text-sm font-semibold transition hover:bg-[#18afa4]"
                  >
                    Citizen Dashboard
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-red-400/15 px-5 py-3 text-sm font-semibold text-red-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ===================================================
          HERO
      =================================================== */}
      <section
        ref={heroRef}
        onMouseMove={handleHeroMove}
        className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-32 sm:px-8 sm:pt-36 lg:px-12 lg:pb-28"
      >
        <div className="hero-grid pointer-events-none absolute inset-x-0 top-0 h-[650px] opacity-70" />

        <div
          className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-[#159b91]/10 blur-[120px] transition-all duration-500"
          style={{
            left: `${cursor.x}%`,
            top: `${cursor.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />

        <div className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          {/* HERO COPY */}
          <div>
            <Reveal>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#1aa99e]/20 bg-[#0c211f]/80 px-4 py-2 text-xs font-medium text-[#65d7cd] shadow-[0_0_30px_rgba(21,155,145,.08)] backdrop-blur-xl">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#38d4c8] opacity-50" />
                  <span className="relative h-2 w-2 rounded-full bg-[#38d4c8]" />
                </span>
                Building better neighborhoods
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
                Your city.
                <br />
                <span className="shimmer-text">Your voice.</span>
                <br />
                <span className="text-white/35">Real change.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-7 max-w-xl text-base leading-7 text-white/50 sm:text-lg">
                CivicTrack gives citizens a direct way to report local problems,
                discover issues nearby, and follow every report from{" "}
                <span className="font-medium text-white/80">reported</span> to{" "}
                <span className="font-medium text-[#62ddd3]">resolved.</span>
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/report"
                  className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-[#159b91] px-7 py-4 font-semibold shadow-[0_15px_50px_rgba(21,155,145,.18)] transition duration-300 hover:-translate-y-1 hover:bg-[#18afa4] hover:shadow-[0_20px_60px_rgba(21,155,145,.3)]"
                >
                  <span className="relative z-10">Report an issue</span>

                  <span className="relative z-10 text-lg transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>

                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </a>

                <a
                  href="/map"
                  className="group flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-7 py-4 font-medium text-white/70 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#1db8aa]/30 hover:bg-white/[0.07] hover:text-white"
                >
                  Explore your city
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>
            </Reveal>

            {/* STATS */}
            <Reveal delay={320}>
              <div className="mt-12 grid max-w-xl grid-cols-3 border-y border-white/10">
                <div className="py-6 pr-4">
                  <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    <Counter target={24} />/
                    <Counter target={7} />
                  </p>

                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-white/30 sm:text-xs">
                    Community reporting
                  </p>
                </div>

                <div className="border-x border-white/10 px-4 py-6">
                  <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Live
                  </p>

                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-white/30 sm:text-xs">
                    Issue tracking
                  </p>
                </div>

                <div className="py-6 pl-4">
                  <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    1 place
                  </p>

                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-white/30 sm:text-xs">
                    Civic action
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* =================================================
              HERO VISUAL
          ================================================= */}
          <Reveal delay={180} className="relative">
            <div className="relative mx-auto max-w-[570px]">
              <div className="absolute -inset-10 rounded-[4rem] bg-[#159b91]/10 blur-3xl" />

              <div className="animate-float relative">
                <TiltCard className="relative rounded-[2rem] border border-white/10 bg-[#0a1514]/90 p-2.5 shadow-[0_30px_100px_rgba(0,0,0,.4)] backdrop-blur-xl sm:p-3">
                  <div className="relative h-[430px] overflow-hidden rounded-[1.5rem] bg-[#0c1c1a] sm:h-[475px]">
                    {/* MAP GRID */}
                    <div className="absolute inset-0 opacity-25">
                      <div className="absolute left-[8%] top-[-20%] h-[150%] w-px rotate-[24deg] bg-[#8bc5be]" />

                      <div className="absolute left-[30%] top-[-20%] h-[150%] w-px rotate-[-12deg] bg-[#8bc5be]" />

                      <div className="absolute left-[55%] top-[-20%] h-[150%] w-px rotate-[20deg] bg-[#8bc5be]" />

                      <div className="absolute left-[82%] top-[-20%] h-[150%] w-px rotate-[-25deg] bg-[#8bc5be]" />

                      <div className="absolute left-[-20%] top-[25%] h-px w-[150%] rotate-[9deg] bg-[#8bc5be]" />

                      <div className="absolute left-[-20%] top-[58%] h-px w-[150%] rotate-[-7deg] bg-[#8bc5be]" />

                      <div className="absolute left-[-20%] top-[78%] h-px w-[150%] rotate-[13deg] bg-[#8bc5be]" />
                    </div>

                    {/* MAP BLOCKS */}
                    <div className="absolute left-[8%] top-[13%] h-24 w-40 rounded-2xl border border-white/5 bg-white/[0.025]" />

                    <div className="absolute right-[7%] top-[15%] h-32 w-32 rounded-full border border-white/5 bg-white/[0.025]" />

                    <div className="absolute bottom-[30%] left-[14%] h-28 w-52 rounded-3xl border border-white/5 bg-white/[0.025]" />

                    <div className="absolute bottom-[18%] right-[12%] h-20 w-32 rounded-2xl border border-white/5 bg-white/[0.025]" />

                    {/* TOP LABEL */}
                    <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                      <div className="glass rounded-full px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">
                        Civic map
                      </div>

                      <div className="flex items-center gap-2 rounded-full border border-[#38d4c8]/10 bg-[#38d4c8]/5 px-3 py-2 text-[10px] font-medium text-[#62ddd3]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#38d4c8]" />
                        Live
                      </div>
                    </div>

                    {/* MAP MARKERS */}
                    {[
                      {
                        left: "28%",
                        top: "34%",
                        delay: "0s",
                      },
                      {
                        left: "68%",
                        top: "47%",
                        delay: "0.6s",
                      },
                      {
                        left: "48%",
                        top: "68%",
                        delay: "1.1s",
                      },
                    ].map((pos, i) => (
                      <div
                        key={i}
                        className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-[#18a99e]/10 ring-8 ring-[#18a99e]/5"
                        style={pos}
                      >
                        <span
                          className="absolute h-5 w-5 rounded-full bg-[#36d4c9]/40"
                          style={{
                            animation: `pulseRing ${
                              2 + i * 0.4
                            }s ease-out infinite`,
                          }}
                        />

                        <div className="relative h-3.5 w-3.5 rounded-full bg-[#36d4c9] shadow-[0_0_25px_#36d4c9]" />
                      </div>
                    ))}

                    {/* MINI FLOATING CARD */}
                    <div className="absolute left-5 top-[30%] hidden w-40 rounded-xl border border-white/10 bg-[#081412]/85 p-3 shadow-xl backdrop-blur-xl sm:block">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#159b91]/10 text-xs">
                          📍
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold">
                            3 nearby issues
                          </p>

                          <p className="mt-0.5 text-[9px] text-white/35">
                            Updated just now
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ISSUE CARD */}
                    <div className="absolute bottom-5 left-5 right-5 overflow-hidden rounded-2xl border border-white/10 bg-[#06110f]/90 p-4 shadow-2xl backdrop-blur-2xl sm:p-5">
                      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#38d4c8]/60 to-transparent" />

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#51d3c8]">
                            Live issue
                          </p>

                          <h3 className="mt-2 text-sm font-semibold sm:text-base">
                            Streetlight not working
                          </h3>

                          <p className="mt-1 text-[10px] text-white/35 sm:text-xs">
                            420m away · Reported 8 min ago
                          </p>
                        </div>

                        <StatusBadge status="Under review" color="amber" />
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-[9px] text-white/30">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full w-[38%] rounded-full bg-[#d7a94c]" />
                        </div>

                        <span>38%</span>
                      </div>
                    </div>
                  </div>
                </TiltCard>

                {/* RESOLVED FLOAT CARD */}
                <div
                  className="absolute -right-3 top-12 hidden w-48 rounded-2xl border border-white/10 bg-[#10201e]/90 p-4 shadow-2xl backdrop-blur-xl sm:block"
                  style={{
                    animation: "float 5s ease-in-out infinite",
                    animationDelay: "1s",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#159b91]/15 text-[#49d1c6]">
                      ✓
                    </div>

                    <div>
                      <p className="text-xs font-semibold">Issue resolved</p>

                      <p className="mt-1 text-[10px] text-white/35">Just now</p>
                    </div>
                  </div>
                </div>

                {/* CITIZEN CARD */}
                <div
                  className="absolute -bottom-6 -left-4 hidden w-48 rounded-2xl border border-white/10 bg-[#10201e]/90 p-4 shadow-2xl backdrop-blur-xl sm:block"
                  style={{
                    animation: "float 6s ease-in-out infinite",
                    animationDelay: "1.5s",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-white/35">
                        Community
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        <Counter target={128} suffix="+" />
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#159b91]/10 text-sm text-[#49d1c6]">
                      👥
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================================================
          LIVE ISSUES STRIP
      =================================================== */}
      <section
        id="issues"
        className="relative z-10 overflow-hidden border-y border-white/10 bg-[#07110f]/90"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-4 sm:px-8 lg:px-12">
          <div className="hidden shrink-0 items-center gap-2 border-r border-white/10 pr-5 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#38d4c8]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Live reports
            </span>
          </div>

          <div className="min-w-0 overflow-hidden">
            <div className="animate-marquee flex w-max gap-3">
              {[...issues, ...issues].map((issue, i) => (
                <div
                  key={`${issue.title}-${i}`}
                  className="flex items-center gap-3 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.025] px-4 py-2.5 text-xs transition hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <span>{issue.icon}</span>

                  <span className="font-medium text-white/75">
                    {issue.title}
                  </span>

                  <span className="text-white/25">·</span>

                  <span className="text-white/35">{issue.meta}</span>

                  <StatusBadge status={issue.status} color={issue.color} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          HOW IT WORKS
      =================================================== */}
      <section
        id="how"
        className="relative z-10 border-b border-white/10 bg-white/[0.012]"
      >
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12">
          <Reveal>
            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#48cec3]">
                  Simple by design
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  From problem
                  <br className="sm:hidden" /> to progress.
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-white/40 sm:text-base">
                  CivicTrack removes the noise between spotting a civic problem
                  and getting it in front of the people who can solve it.
                </p>
              </div>

              <div className="hidden rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-xs text-white/35 lg:block">
                Built around transparency
              </div>
            </div>
          </Reveal>

          <div className="relative mt-14">
            {/* CONNECTOR */}
            <div className="absolute left-[16.6%] right-[16.6%] top-12 hidden h-px bg-gradient-to-r from-transparent via-[#159b91]/30 to-transparent md:block" />

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  number: "01",
                  icon: "⌁",
                  title: "Spot it",
                  text: "See something that needs attention? Capture it and add the location.",
                },
                {
                  number: "02",
                  icon: "↗",
                  title: "Report it",
                  text: "Send the issue to CivicTrack with a photo and a short description.",
                },
                {
                  number: "03",
                  icon: "✓",
                  title: "Track it",
                  text: "Follow the status as officials review, work on, and resolve it.",
                },
              ].map((item, i) => (
                <Reveal key={item.number} delay={i * 100}>
                  <TiltCard className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-[#081412] p-7 transition-colors duration-300 hover:border-[#159b91]/25 hover:bg-[#0b1c19] sm:p-9">
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#159b91]/5 blur-3xl transition duration-500 group-hover:bg-[#159b91]/10" />

                    <div className="relative flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#159b91]/20 bg-[#159b91]/10 text-sm font-semibold text-[#58d4ca]">
                        {item.icon}
                      </span>

                      <span className="text-xs font-medium text-white/20">
                        {item.number}
                      </span>
                    </div>

                    <h3 className="relative mt-14 text-xl font-semibold transition-colors group-hover:text-[#58d4ca]">
                      {item.title}
                    </h3>

                    <p className="relative mt-3 text-sm leading-6 text-white/40">
                      {item.text}
                    </p>

                    <div className="relative mt-8 h-px overflow-hidden bg-white/10">
                      <div className="h-full w-0 bg-[#159b91] transition-all duration-500 group-hover:w-full" />
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          STATUS SECTION
      =================================================== */}
      <section className="relative z-10 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12">
          <div className="grid items-center gap-14 lg:grid-cols-[.85fr_1.15fr]">
            <Reveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#48cec3]">
                  Complete visibility
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                  Know what happens
                  <br />
                  after you report.
                </h2>

                <p className="mt-5 max-w-lg text-sm leading-7 text-white/40 sm:text-base">
                  No more sending a complaint into the void. Every report has a
                  visible journey — from the first submission to the final
                  resolution.
                </p>

                <a
                  href={isLoggedIn ? "/report" : "/signup"}
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#159b91]/25 bg-[#159b91]/10 px-5 py-3 text-sm font-semibold text-[#65d7cd] transition hover:border-[#159b91]/45 hover:bg-[#159b91]/15"
                >
                  {isLoggedIn ? "Report an issue" : "Join CivicTrack"}
                  <span>→</span>
                </a>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#081412] p-5 shadow-2xl sm:p-7">
                <div className="absolute right-[-100px] top-[-100px] h-72 w-72 rounded-full bg-[#159b91]/10 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                        Example report
                      </p>

                      <h3 className="mt-2 text-base font-semibold">
                        Streetlight not working
                      </h3>
                    </div>

                    <StatusBadge status="Under review" color="amber" />
                  </div>

                  <div className="mt-8">
                    {[
                      {
                        title: "Reported",
                        text: "Citizen submitted the issue",
                        active: true,
                      },
                      {
                        title: "Under review",
                        text: "Official team is reviewing it",
                        active: true,
                      },
                      {
                        title: "In progress",
                        text: "Work has started",
                        active: false,
                      },
                      {
                        title: "Resolved",
                        text: "Issue has been fixed",
                        active: false,
                      },
                    ].map((step, i) => (
                      <div
                        key={step.title}
                        className="relative flex gap-4 pb-7 last:pb-0"
                      >
                        {i !== 3 && (
                          <div className="absolute left-[7px] top-5 h-full w-px bg-white/10" />
                        )}

                        <div
                          className={`relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-[#081412] ${
                            step.active
                              ? "bg-[#38d4c8] shadow-[0_0_15px_rgba(56,212,200,.45)]"
                              : "bg-white/15"
                          }`}
                        />

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p
                              className={`text-sm font-semibold ${
                                step.active ? "text-white" : "text-white/35"
                              }`}
                            >
                              {step.title}
                            </p>

                            {step.active && (
                              <span className="text-[9px] uppercase tracking-wider text-[#48cec3]">
                                Complete
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-white/30">
                            {step.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================================================
          CTA
      =================================================== */}
      <section
        id="about"
        className="relative z-10 mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12"
      >
        <Reveal>
          <div className="group relative overflow-hidden rounded-[2rem] border border-[#1ba99e]/20 bg-[#0a211e] p-8 shadow-[0_30px_100px_rgba(0,0,0,.25)] sm:p-12 lg:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(32,184,172,.14),transparent_35%)]" />

            <div className="absolute right-[-100px] top-[-120px] h-80 w-80 rounded-full bg-[#20b8ac]/10 blur-3xl transition duration-700 group-hover:scale-110" />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#52d5ca]">
                  Be part of the change
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                  A better city starts with someone speaking up.
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-white/45 sm:text-base">
                  Report what matters. Track what happens. Help your
                  neighborhood move forward.
                </p>
              </div>

              <a
                href={isLoggedIn ? "/report" : "/signup"}
                className="group/btn inline-flex w-fit items-center gap-3 rounded-full bg-white px-7 py-3.5 font-semibold text-[#09201d] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(255,255,255,.12)]"
              >
                {isLoggedIn ? "Report an Issue" : "Join CivicTrack"}

                <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
                  →
                </span>
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===================================================
          CONTACT
      =================================================== */}
      <section className="relative z-10 border-t border-white/10 bg-[#050d0c]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            {/* LEFT */}
            <Reveal>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#48cec3]">
                  Need help?
                </p>

                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  We’re here for your city.
                </h2>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/40 sm:text-base">
                  Have a question, urgent civic problem, or need help with a
                  report? Reach out to the CivicTrack team.
                </p>

                <div className="mt-9 space-y-3">
                  {/* ADDRESS */}
                  <div className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:border-[#159b91]/25 hover:bg-white/[0.045]">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#159b91]/10 text-lg transition group-hover:bg-[#159b91]/15">
                        📍
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          CivicTrack Office
                        </p>

                        <p className="mt-1 text-sm leading-6 text-white/35">
                          Our Head Office
                          <br />
                          Gurugram - Sec-10 Haryana
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PHONE */}
                  <div className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:border-[#159b91]/25 hover:bg-white/[0.045]">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#159b91]/10 text-lg transition group-hover:bg-[#159b91]/15">
                        ☎️
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          CivicTrack Helpline
                        </p>

                        <p className="mt-1 text-sm text-white/35">
                          +91 9891214793
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* EMERGENCY */}
                  <div className="rounded-2xl border border-red-400/10 bg-red-400/[0.025] p-5">
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-lg">
                        🚨
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-red-200">
                          Emergency
                        </p>

                        <p className="mt-1 text-sm leading-6 text-white/35">
                          For immediate danger, contact your local emergency
                          service.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <a
                    href="tel:+919891214793"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#159b91] px-5 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[#18afa4]"
                  >
                    📞 Call Us
                  </a>

                  <a
                    href="https://wa.me/919891214793"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-[#159b91]/20 bg-[#159b91]/5 px-5 py-3.5 text-sm font-semibold text-[#65d7cd] transition hover:-translate-y-0.5 hover:bg-[#159b91]/10"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </Reveal>

            {/* FORM */}
            <Reveal delay={120}>
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.025] p-6 shadow-2xl sm:p-8">
                <div className="absolute right-[-100px] top-[-100px] h-72 w-72 rounded-full bg-[#159b91]/5 blur-3xl" />

                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#48cec3]">
                    Contact us
                  </p>

                  <h3 className="mt-3 text-2xl font-semibold">
                    Tell us what’s happening.
                  </h3>

                  <p className="mt-2 max-w-lg text-sm leading-6 text-white/35">
                    Send us a message and our team will get back to you.
                  </p>

                  <form
                    className="mt-8 space-y-5"
                    onSubmit={(e) => {
                      e.preventDefault();

                      alert("Contact API next step mein connect karenge.");
                    }}
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="name"
                          className="mb-2 block text-xs font-medium text-white/55"
                        >
                          Your name
                        </label>

                        <input
                          id="name"
                          type="text"
                          placeholder="Your name"
                          required
                          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/15 focus:border-[#159b91]/60 focus:bg-black/30"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-xs font-medium text-white/55"
                        >
                          Email address
                        </label>

                        <input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/15 focus:border-[#159b91]/60 focus:bg-black/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="mb-2 block text-xs font-medium text-white/55"
                      >
                        Subject
                      </label>

                      <select
                        id="subject"
                        required
                        defaultValue=""
                        className="w-full rounded-xl border border-white/10 bg-[#0b1917] px-4 py-3.5 text-sm text-white/70 outline-none transition hover:border-white/15 focus:border-[#159b91]/60"
                      >
                        <option value="" disabled>
                          Select a topic
                        </option>

                        <option value="issue">Issue Report</option>

                        <option value="technical">Technical Problem</option>

                        <option value="feedback">Feedback</option>

                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="mb-2 block text-xs font-medium text-white/55"
                      >
                        Message
                      </label>

                      <textarea
                        id="message"
                        rows={5}
                        required
                        placeholder="Tell us how we can help..."
                        className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 hover:border-white/15 focus:border-[#159b91]/60 focus:bg-black/30"
                      />
                    </div>

                    <button
                      type="submit"
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#159b91] px-5 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-[#18afa4] hover:shadow-[0_10px_35px_rgba(21,155,145,.2)]"
                    >
                      Send Message
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===================================================
          FOOTER
      =================================================== */}
      <footer className="relative z-10 border-t border-white/10 bg-[#030807]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
          <div className="grid gap-10 md:grid-cols-[1.5fr_.7fr_.7fr]">
            {/* BRAND */}
            <div className="max-w-sm">
              <Image
                src="/civictrack_logo.png"
                alt="CivicTrack"
                width={150}
                height={80}
                className="h-11 w-auto object-contain"
              />

              <p className="mt-4 text-sm leading-6 text-white/30">
                Making civic problems visible, trackable and easier to resolve.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#159b91]/15 bg-[#159b91]/5 px-3 py-1.5 text-[10px] text-[#55d5ca]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#38d4c8]" />
                Built for better communities
              </div>
            </div>

            {/* LINKS */}
            <div>
              <h4 className="text-sm font-semibold">CivicTrack</h4>

              <div className="mt-4 flex flex-col gap-3 text-sm text-white/35">
                <a href="/" className="transition hover:text-white">
                  Home
                </a>

                <a href="#how" className="transition hover:text-white">
                  How it works
                </a>

                <a href="/report" className="transition hover:text-white">
                  Report Issue
                </a>

                <a href="/login" className="transition hover:text-white">
                  Login
                </a>
              </div>
            </div>

            {/* SOCIAL */}
            <div>
              <h4 className="text-sm font-semibold">Follow us</h4>

              <div className="mt-4 flex gap-2">
                {[
                  ["◎", "Instagram"],
                  ["in", "LinkedIn"],
                  ["𝕏", "X"],
                  ["▶", "YouTube"],
                ].map(([icon, label]) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.025] text-xs text-white/60 transition hover:-translate-y-1 hover:border-[#159b91]/30 hover:bg-[#159b91]/10 hover:text-[#65d7cd]"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 CivicTrack. All rights reserved.</p>

            <p>
              Made with <span className="text-red-400">♥</span> by{" "}
              <span className="font-medium text-white/55">
                Mukesh <span className="text-red-400">♥</span>
              </span>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}