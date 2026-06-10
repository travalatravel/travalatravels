"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ASSETS } from "@/data/site-data";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const err = await login(email, password);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    router.push(redirect);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-3 py-6 sm:px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg sm:p-8">
        <div className="mb-8 text-center">
          <Image src={ASSETS.logoDark} alt="Travala" width={140} height={36} className="mx-auto" />
          <h1 className="mt-6 text-xl font-bold text-[#1e2e5e]">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500">Log in to your Travala account</p>
        </div>

        <div className="mb-4 rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
          <p>Sign in with any email — a guest account is created automatically if needed.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#2577be]"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#2577be]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2577be] py-3 text-sm font-semibold text-white hover:bg-[#1e2e5e] disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href={`/register${redirect !== "/" ? `?redirect=${redirect}` : ""}`} className="font-semibold text-[#2577be] hover:underline">
            Register
          </Link>
        </p>
        <Link href="/" className="mt-4 block text-center text-sm text-gray-400 hover:text-gray-600">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
