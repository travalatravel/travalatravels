"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ASSETS } from "@/data/site-data";
import { useAuth } from "@/context/AuthContext";
import AuthLayout from "@/components/AuthLayout";
import { useTranslations } from "@/i18n/useTranslations";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { login } = useAuth();
  const { messages: m } = useTranslations();
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
    <AuthLayout>
      <div className="mx-auto flex w-full max-w-md justify-center">
      <div className="w-full rounded-2xl bg-white p-5 shadow-lg sm:p-8">
        <div className="mb-8 text-center">
          <Image src={ASSETS.logoBlack} alt="Travala" width={140} height={36} className="mx-auto" unoptimized />
          <h1 className="mt-6 text-xl font-bold text-[#1a1a1a]">{m.auth.welcomeBack}</h1>
          <p className="mt-1 text-sm text-gray-500">{m.auth.logInSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{m.auth.email}</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#2D83C2]"
              placeholder={m.auth.emailPlaceholder}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{m.auth.password}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#2D83C2]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2D83C2] py-3 text-sm font-semibold text-white hover:bg-[#1a5f94] disabled:opacity-50"
          >
            {loading ? m.auth.loggingIn : m.auth.login}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {m.auth.noAccount}{" "}
          <Link href={`/register${redirect !== "/" ? `?redirect=${redirect}` : ""}`} className="font-semibold text-[#2D83C2] hover:underline">
            {m.auth.register}
          </Link>
        </p>
        <Link href="/" className="mt-4 block text-center text-sm text-gray-400 hover:text-gray-600">
          {m.auth.backToHome}
        </Link>
      </div>
      </div>
    </AuthLayout>
  );
}

export default function LoginPage() {
  const { messages: m } = useTranslations();

  return (
    <Suspense fallback={<AuthLayout><div className="py-20 text-center">{m.common.loading}</div></AuthLayout>}>
      <LoginForm />
    </Suspense>
  );
}
