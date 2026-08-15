"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

type Role = "citizen" | "official";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState<Role>("citizen");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Debug
    console.log("SIGNUP PAYLOAD:", {
      name: cleanName,
      email: cleanEmail,
      password,
      role,
    });

    // -------------------------
    // FRONTEND VALIDATION
    // -------------------------

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (cleanName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role !== "citizen" && role !== "official") {
      setError("Please select your account type.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            password,
            role,
          }),
        }
      );

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      console.log("SIGNUP RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Signup failed.");
      }

      if (!data.token) {
        throw new Error(
          "Account created, but JWT token was not received."
        );
      }

      if (!data.user) {
        throw new Error(
          "Account created, but user information was not received."
        );
      }

      const user: User = data.user;

      // -------------------------
      // VERIFY ROLE FROM SERVER
      // -------------------------

      console.log("ROLE FROM SERVER:", user.role);

      if (user.role !== "citizen" && user.role !== "official") {
        throw new Error("Invalid user role received from server.");
      }

      // -------------------------
      // SAVE AUTH DATA
      // -------------------------

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      setSuccess("Account created successfully! Redirecting...");

      // -------------------------
      // ROLE BASED REDIRECT
      // -------------------------

      setTimeout(() => {
        if (user.role === "official") {
          window.location.href = "/official";
        } else {
          window.location.href = "/";
        }
      }, 700);
    } catch (error) {
      console.error("Signup error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong during signup."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#06100f] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-8">

        {/* HEADER */}

        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="transition-transform duration-300 hover:scale-105"
          >
            <Image
              src="/civictrack_logo.png"
              alt="CivicTrack"
              width={155}
              height={80}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:border-[#159b91]/40 hover:bg-white/[0.06] hover:text-white"
          >
            Sign In
          </Link>
        </header>

        {/* MAIN */}

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">

            {/* HEADING */}

            <div className="mb-8 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#48cec3]">
                Join CivicTrack
              </p>

              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Create your account
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/40">
                Choose your account type and join your community.
              </p>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSignup}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl sm:p-8"
            >

              {/* ERROR */}

              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-5 text-red-300"
                >
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div
                  role="status"
                  className="mb-5 rounded-xl border border-[#159b91]/20 bg-[#159b91]/10 px-4 py-3 text-sm leading-5 text-[#65d7cd]"
                >
                  {success}
                </div>
              )}

              {/* ACCOUNT TYPE */}

              <div>
                <label className="mb-3 block text-sm text-white/60">
                  I am a
                </label>

                <div className="grid grid-cols-2 gap-3">

                  {/* CITIZEN */}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setRole("citizen");
                      setError("");
                    }}
                    className={`rounded-2xl border p-4 text-left transition ${
                      role === "citizen"
                        ? "border-[#159b91]/60 bg-[#159b91]/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <div className="text-2xl">
                      👤
                    </div>

                    <p className="mt-3 font-semibold">
                      Citizen
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/35">
                      Report and track civic issues.
                    </p>

                    {role === "citizen" && (
                      <div className="mt-3 text-xs font-medium text-[#55d2c8]">
                        ✓ Selected
                      </div>
                    )}
                  </button>

                  {/* OFFICIAL */}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setRole("official");
                      setError("");
                    }}
                    className={`rounded-2xl border p-4 text-left transition ${
                      role === "official"
                        ? "border-[#159b91]/60 bg-[#159b91]/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <div className="text-2xl">
                      🏛️
                    </div>

                    <p className="mt-3 font-semibold">
                      Official
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/35">
                      Manage and resolve civic reports.
                    </p>

                    {role === "official" && (
                      <div className="mt-3 text-xs font-medium text-[#55d2c8]">
                        ✓ Selected
                      </div>
                    )}
                  </button>
                </div>

                {/* OFFICIAL WARNING */}

                {role === "official" && (
                  <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3">
                    <p className="text-xs leading-5 text-amber-200/70">
                      Official accounts should only be created by
                      authorized government personnel.
                    </p>
                  </div>
                )}
              </div>

              {/* NAME */}

              <div className="mt-5">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm text-white/60"
                >
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mukesh"
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#159b91]/60 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* EMAIL */}

              <div className="mt-5">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm text-white/60"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#159b91]/60 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* PASSWORD */}

              <div className="mt-5">
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm text-white/60"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#159b91]/60 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* CONFIRM PASSWORD */}

              <div className="mt-5">
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm text-white/60"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter password again"
                  disabled={loading}
                  className={`w-full rounded-xl border bg-black/20 px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#159b91]/60 disabled:cursor-not-allowed disabled:opacity-50 ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-400/40"
                      : "border-white/10"
                  }`}
                />

                {confirmPassword &&
                  password !== confirmPassword && (
                    <p className="mt-2 text-xs text-red-300">
                      Passwords do not match.
                    </p>
                  )}
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="mt-7 flex w-full items-center justify-center rounded-xl bg-[#159b91] px-5 py-3.5 font-semibold transition hover:-translate-y-0.5 hover:bg-[#18afa4] hover:shadow-[0_12px_35px_rgba(21,155,145,.25)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </span>
                ) : (
                  "Create account →"
                )}
              </button>

              {/* LOGIN */}

              <p className="mt-6 text-center text-sm text-white/40">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-[#55d2c8] transition hover:text-white"
                >
                  Sign in
                </Link>
              </p>
            </form>

            {/* BACK */}

            <div className="mt-5 text-center">
              <Link
                href="/"
                className="text-sm text-white/35 transition hover:text-white"
              >
                ← Back to CivicTrack
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}