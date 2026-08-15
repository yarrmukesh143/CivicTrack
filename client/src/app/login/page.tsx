"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

type LoginRole = "citizen" | "official";

type User = {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "official";
};

export default function LoginPage() {
  const [role, setRole] = useState<LoginRole>("citizen");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.token) {
        throw new Error("Login successful, but token was not received.");
      }

      if (!data.user) {
        throw new Error("Login successful, but user data was not received.");
      }

      const user: User = data.user;

      /*
       * IMPORTANT:
       * We do NOT trust the role selected in the UI.
       * We trust the role returned by our backend.
       */

      if (user.role !== role) {
        throw new Error(
          `This account is registered as ${user.role}. Please select ${user.role} login.`
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      // Official → Official Dashboard
      if (user.role === "official") {
        window.location.href = "/official";
        return;
      }

      // Citizen → Home
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while logging in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#071110] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 sm:px-8">

        {/* LOGO */}
        <div>
          <Link href="/">
            <Image
              src="/civictrack_logo.png"
              alt="CivicTrack"
              width={155}
              height={80}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* LOGIN */}
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">

            {/* HEADER */}
            <div className="mb-8 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-[#48cec3]">
                Welcome back
              </p>

              <h1 className="mt-3 text-4xl font-semibold">
                Sign in to CivicTrack
              </h1>

              <p className="mt-3 text-sm text-white/40">
                Choose how you want to access CivicTrack.
              </p>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleLogin}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl sm:p-8"
            >

              {/* ROLE SELECTOR */}
              <div>
                <p className="mb-3 text-sm text-white/60">
                  I am signing in as
                </p>

                <div className="grid grid-cols-2 gap-3">

                  {/* CITIZEN */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole("citizen");
                      setError("");
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      role === "citizen"
                        ? "border-[#159b91] bg-[#159b91]/15"
                        : "border-white/10 bg-white/[0.025] hover:border-white/20"
                    }`}
                  >
                    <div className="text-2xl">👤</div>

                    <p className="mt-2 font-semibold">
                      Citizen
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      Report and track civic issues
                    </p>
                  </button>

                  {/* OFFICIAL */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole("official");
                      setError("");
                    }}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      role === "official"
                        ? "border-[#159b91] bg-[#159b91]/15"
                        : "border-white/10 bg-white/[0.025] hover:border-white/20"
                    }`}
                  >
                    <div className="text-2xl">🏛️</div>

                    <p className="mt-2 font-semibold">
                      Official
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      Manage and resolve civic issues
                    </p>
                  </button>

                </div>
              </div>

              {/* SELECTED ROLE */}
              <div className="mt-5 rounded-xl border border-[#159b91]/20 bg-[#159b91]/5 px-4 py-3">
                <p className="text-xs text-white/40">
                  Signing in as
                </p>

                <p className="mt-1 text-sm font-medium text-[#65d7cd]">
                  {role === "citizen"
                    ? "👤 Citizen"
                    : "🏛️ Official"}
                </p>
              </div>

              {/* ERROR */}
              {error && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              {/* EMAIL */}
              <div className="mt-5">
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm text-white/60"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm outline-none transition placeholder:text-white/20 focus:border-[#159b91]/60"
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
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm outline-none transition placeholder:text-white/20 focus:border-[#159b91]/60"
                />
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="mt-7 w-full rounded-xl bg-[#159b91] px-5 py-3.5 font-semibold transition hover:bg-[#18afa4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Signing in..."
                  : role === "official"
                    ? "Official Sign in →"
                    : "Citizen Sign in →"}
              </button>

              {/* SIGNUP */}
              <p className="mt-6 text-center text-sm text-white/40">
                Don't have a citizen account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-[#55d2c8] transition hover:text-white"
                >
                  Create one
                </Link>
              </p>

              {/* OFFICIAL INFO */}
              <div className="mt-5 border-t border-white/10 pt-5">
                <p className="text-center text-xs leading-5 text-white/30">
                  Official accounts are authorized by CivicTrack.
                  <br />
                  If you are an official, use your assigned account.
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>
    </main>
  );
}