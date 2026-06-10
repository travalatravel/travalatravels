import Header from "./Header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="min-h-[calc(100dvh-4rem)] bg-gray-50 px-3 py-8 sm:px-4">{children}</div>
      <p className="border-t border-gray-200 bg-gray-50 py-4 text-center text-xs text-gray-500">
        © 2017–2026 Travala.com. All rights reserved.
      </p>
    </>
  );
}
