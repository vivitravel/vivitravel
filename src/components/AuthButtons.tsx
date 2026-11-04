import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { UserMenu } from "./UserMenu";

export async function AuthButtons() {
  const user = await getCurrentUser();

  if (user) return <UserMenu user={user} />;

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className="text-sm font-semibold text-turquoise hover:underline">
        Entrá
      </Link>
      <Link href="/registro" className="btn-primary rounded-lg px-4 py-1.5 text-sm font-semibold">
        Registrate
      </Link>
    </div>
  );
}
