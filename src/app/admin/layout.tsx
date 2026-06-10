import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = { title: "Admin Dashboard | Travala" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
