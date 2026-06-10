"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          router.replace("/admin");
          return;
        }
        setConfigured(data.configured);
      })
      .catch(() => setConfigured(false));
  }, [router]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmPassword }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Setup failed");
      return;
    }
    router.push("/admin");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }
    router.push("/admin");
  };

  if (configured === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2dd4bf] border-t-transparent" />
      </div>
    );
  }

  const isSetup = !configured;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1e2e5e] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2dd4bf]/15">
            <ShieldCheck className="text-[#2dd4bf]" size={28} />
          </div>
          <h1 className="mt-5 text-xl font-bold text-white">
            {isSetup ? "Set up admin access" : "Admin dashboard"}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {isSetup
              ? "Create your admin password. This is only needed once."
              : "Enter your admin password to continue."}
          </p>
        </div>

        <form onSubmit={isSetup ? handleSetup : handleLogin} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
          )}

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-white/80">
              <Lock size={14} />
              {isSetup ? "New password" : "Password"}
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#2dd4bf] focus:ring-2 focus:ring-[#2dd4bf]/20"
              placeholder="At least 8 characters"
              autoFocus
            />
          </div>

          {isSetup && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Confirm password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#2dd4bf] focus:ring-2 focus:ring-[#2dd4bf]/20"
                placeholder="Repeat password"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2dd4bf] py-3 text-sm font-bold text-[#1e2e5e] transition hover:bg-[#14b8a6] disabled:opacity-50"
          >
            {loading ? "Please wait…" : isSetup ? "Create admin password" : "Unlock dashboard"}
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm text-white/40 transition hover:text-white/70"
        >
          ← Back to website
        </Link>
      </div>
    </div>
  );
}
