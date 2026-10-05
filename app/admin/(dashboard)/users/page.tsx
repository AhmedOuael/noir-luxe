import { requireUser } from "@/lib/auth/session";
import { listUsers } from "@/lib/admin/users";
import TeamManager from "./TeamManager";

export default async function UsersPage() {
  const me = await requireUser("ADMIN");
  const users = await listUsers();

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl mb-2">Team</h1>
      <p className="text-sm text-secondary mb-8">
        Staff can handle orders. Admins can also manage the team (and products, coming next).
      </p>
      <TeamManager users={users} currentUserId={me.id.toString()} />
    </div>
  );
}
