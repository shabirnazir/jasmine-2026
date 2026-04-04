"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Topbar from "./Topbar/Topbar";
import {
  FiMail,
  FiLock,
  FiLoader,
  FiTrendingUp,
  FiShield,
} from "react-icons/fi";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      setLoading(false);
      if (res.error) {
        setError("Invalid Credentials");
        setLoading(false);
        return;
      }

      router.replace("dashboard");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_90%_15%,rgba(249,115,22,0.2),transparent_28%),linear-gradient(165deg,#f8fafc_0%,#eff6ff_45%,#fff7ed_100%)]">
      <Topbar />
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 px-4 py-8 md:grid-cols-[1.05fr_1fr] md:gap-6 md:px-6 md:py-12">
        <section className="rounded-3xl border border-sky-100 bg-slate-900/95 p-6 text-slate-100 shadow-[0_28px_50px_rgba(2,6,23,0.25)] md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
            Jasmine Enterprise
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
            Smarter store operations in one flow
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
            Monitor stock movement, credit journals, and payment updates with a
            focused dashboard built for fast daily entries.
          </p>

          <div className="mt-6 grid gap-3 md:mt-8">
            <div className="flex items-start gap-3 rounded-2xl border border-sky-400/30 bg-slate-800/65 p-3">
              <span className="mt-0.5 rounded-lg bg-sky-400/20 p-2 text-sky-300">
                <FiTrendingUp size={18} />
              </span>
              <div>
                <p className="font-semibold text-slate-100">
                  Daily Performance
                </p>
                <p className="text-sm text-slate-300">
                  Keep purchases, sales, and dues balanced in real time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-amber-300/25 bg-slate-800/65 p-3">
              <span className="mt-0.5 rounded-lg bg-amber-400/20 p-2 text-amber-300">
                <FiShield size={18} />
              </span>
              <div>
                <p className="font-semibold text-slate-100">Secure Access</p>
                <p className="text-sm text-slate-300">
                  Role-based authentication keeps sensitive financial data safe.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_40px_rgba(15,23,42,0.14)] backdrop-blur md:p-8">
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Welcome Back
            </h2>
            <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={20}
                />
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="pl-10"
                  value={email}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <FiLock
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={20}
                />
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="pl-10"
                  value={password}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin" size={18} />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-4 text-center text-sm text-slate-500">
            <p>Store Management System</p>
          </div>
        </section>
      </div>
    </div>
  );
}
