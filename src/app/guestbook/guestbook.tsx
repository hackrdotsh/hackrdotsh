"use client";

import { GithubLogo, Trash } from "@phosphor-icons/react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Tag } from "~/components/ui/tag";
import { Textarea } from "~/components/ui/textarea";
import { isOwnerEmail } from "~/lib/admin";
import { authClient } from "~/lib/auth-client";
import { api } from "../../../convex/_generated/api";

// Mirrors MAX_MESSAGE_LENGTH in convex/guestbook.ts (server enforces it too).
const MAX_LENGTH = 500;

function Avatar({ name, image }: { name: string; image?: string }) {
  if (image) {
    return (
      // biome-ignore lint/performance/noImgElement: external avatar URLs can't use next/image
      <img
        src={image}
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="pixel-11 flex size-8 shrink-0 select-none items-center justify-center bg-surface-3 text-muted-foreground"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function RoleBadge({ isOwner }: { isOwner: boolean }) {
  return isOwner ? <Tag tone="accent">Owner</Tag> : <Tag>Guest</Tag>;
}

export function Guestbook() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const entries = useQuery(api.guestbook.list);
  const sign = useMutation(api.guestbook.sign);
  const remove = useMutation(api.guestbook.remove);

  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isOwner = isOwnerEmail(session?.user?.email);

  const handleGitHubSignIn = async () => {
    setError(null);
    const { error } = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/guestbook",
    });
    if (error) setError(error.message ?? "Sign in failed");
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  const handleSign = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setError(null);
    setSubmitting(true);
    try {
      await sign({ message: trimmed });
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to sign the guestbook");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      {isPending ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : session ? (
        <section aria-label="Leave a note" className="panel grid gap-5 p-5">
          <div className="flex items-center gap-4">
            <Avatar
              name={session.user.name}
              image={session.user.image ?? undefined}
            />
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
              <p className="truncate font-medium text-foreground">
                {session.user.name}
              </p>
              <RoleBadge isOwner={isOwner} />
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="guestbook-message"
              className="pixel-11 text-muted-foreground uppercase"
            >
              Note
            </label>
            <Textarea
              id="guestbook-message"
              value={message}
              maxLength={MAX_LENGTH}
              rows={3}
              placeholder="Say hi, be nice."
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between gap-4 pr-2 pb-2">
            <p className="pixel-11 text-faint">
              {message.length}/{MAX_LENGTH}
            </p>
            <Button
              onClick={handleSign}
              disabled={!message.trim()}
              loading={submitting}
            >
              Sign guestbook
            </Button>
          </div>
        </section>
      ) : (
        <section
          aria-label="Sign in to leave a note"
          className="panel flex flex-wrap items-center justify-between gap-4 p-5 pr-7 pb-7"
        >
          <p className="text-sm text-muted-foreground">
            Sign in with GitHub to leave a note.
          </p>
          <Button onClick={handleGitHubSignIn}>
            <GithubLogo size={16} />
            Sign in with GitHub
          </Button>
        </section>
      )}
      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-10">
        {entries === undefined && (
          <p className="text-sm text-muted-foreground">Loading…</p>
        )}

        {entries && entries.length === 0 && (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        )}

        {entries && entries.length > 0 && (
          <ul className="rows">
            {entries.map((entry) => {
              const canDelete =
                !!session && (isOwner || entry.userId === session.user.id);
              return (
                <li key={entry._id} className="row flex items-start gap-4">
                  <Avatar name={entry.name} image={entry.image} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-medium text-foreground">
                        {entry.name}
                      </p>
                      <RoleBadge isOwner={entry.isOwner} />
                      <time
                        dateTime={new Date(entry.createdAt).toISOString()}
                        className="pixel-11 text-faint"
                      >
                        {new Date(entry.createdAt).toLocaleDateString("en-CA")}
                      </time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {entry.message}
                    </p>
                  </div>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove({ id: entry._id })}
                      aria-label={`Remove note from ${entry.name}`}
                    >
                      <Trash className="text-danger" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
