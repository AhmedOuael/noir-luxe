import { requireUser } from "@/lib/auth/session";
import Sidebar from "@/components/admin/Sidebar";
import { logoutAction } from "../actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <>
      <Sidebar user={{ name: user.name, email: user.email, role: user.role }} logoutAction={logoutAction} />
      <main className="lg:pl-60">
        <div className="px-5 md:px-10 py-8">{children}</div>
      </main>
    </>
  );
}
