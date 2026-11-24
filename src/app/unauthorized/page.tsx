"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const signOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <main
      id="main-content"
      className="mx-auto grid w-full max-w-md justify-items-start gap-5 px-5 py-24"
    >
      <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground">
        Access denied
      </h1>
      <p className="leading-relaxed text-muted-foreground">
        Only the site owner can open this page.
        {session?.user && ` You're signed in as ${session.user.email}.`}
      </p>
      {!isPending &&
        (session ? (
          <Button variant="secondary" onClick={signOut}>
            Sign out
          </Button>
        ) : (
          <Button render={<Link href="/sign-in" />}>Sign in</Button>
        ))}
    </main>
  );
}
