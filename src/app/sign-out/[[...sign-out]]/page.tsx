"use client";

import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

export default function SignOutPage() {
  const router = useRouter();

  return (
    <main id="main-content" className="grid place-items-center px-5 py-24">
      <Button
        variant="secondary"
        onClick={async () => {
          await authClient.signOut();
          router.push("/");
          router.refresh();
        }}
      >
        Sign out
      </Button>
    </main>
  );
}
