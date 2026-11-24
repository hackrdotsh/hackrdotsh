"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { authClient } from "~/lib/auth-client";
import { api } from "../../../../convex/_generated/api";

export default function SignInPage() {
  const router = useRouter();
  const hasPasskeys = useQuery(api.auth.hasPasskeys);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupToken, setSetupToken] = useState("");
  const [setupDone, setSetupDone] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    const { error } = await authClient.signIn.passkey();
    setLoading(false);
    if (error) {
      setError(error.message ?? "Sign in failed");
      return;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("manage") === "mcp") {
      window.location.assign("/admin/mcp");
      return;
    }
    const authorize = params.get("authorize");
    if (authorize) {
      window.location.assign(
        `/oauth/authorize?${new URLSearchParams(authorize)}`,
      );
      return;
    }
    router.push("/");
    router.refresh();
  };

  const handleRegister = async () => {
    setError(null);
    setLoading(true);
    const { error } = await authClient.passkey.addPasskey({
      name: "admin",
      context: setupToken,
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Passkey registration failed");
      return;
    }
    setSetupDone(true);
    setSetupToken("");
  };

  return (
    <main
      id="main-content"
      className="mx-auto grid w-full max-w-xs gap-6 px-5 py-24"
    >
      <h1 className="pixel-33 text-foreground">Sign in</h1>
      {setupDone && (
        <p className="text-sm text-muted-foreground">
          Passkey registered. You can sign in now.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="pr-2 pb-2">
        <Button onClick={handleSignIn} loading={loading} className="w-full">
          Sign in with passkey
        </Button>
      </div>
      {hasPasskeys === false && (
        <>
          <Button
            variant="link"
            className="justify-self-start"
            onClick={() => setSetupOpen((open) => !open)}
            aria-expanded={setupOpen}
          >
            First-time setup
          </Button>
          {setupOpen && (
            <div className="grid gap-3">
              <label
                htmlFor="setup-token"
                className="pixel-11 text-muted-foreground uppercase"
              >
                Setup token
              </label>
              <Input
                id="setup-token"
                type="password"
                autoComplete="off"
                value={setupToken}
                onChange={(e) => setSetupToken(e.target.value)}
              />
              <div className="pt-1 pr-2 pb-2">
                <Button
                  variant="secondary"
                  disabled={loading || !setupToken}
                  onClick={handleRegister}
                  className="w-full"
                >
                  Register passkey
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
