"use client";

import { useMutation, useQuery } from "convex/react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
  AdminPageHeader,
  AdminSection,
  AdminShell,
  Field,
} from "~/components/admin/ui";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function AdminVouchesPage() {
  const vouches = useQuery(api.vouches.list);
  const createVouch = useMutation(api.vouches.create);
  const updateVouch = useMutation(api.vouches.update);
  const removeVouch = useMutation(api.vouches.remove);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<Id<"vouches"> | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const handleCreate = async () => {
    if (!name.trim() || !url.trim()) return;
    await createVouch({ name: name.trim(), url: url.trim() });
    setName("");
    setUrl("");
  };

  const startEditing = (vouch: {
    _id: Id<"vouches">;
    name: string;
    url: string;
  }) => {
    setEditingId(vouch._id);
    setEditName(vouch.name);
    setEditUrl(vouch.url);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditUrl("");
  };

  const handleUpdate = async () => {
    if (!editingId || !editName.trim() || !editUrl.trim()) return;
    await updateVouch({
      id: editingId,
      name: editName.trim(),
      url: editUrl.trim(),
    });
    cancelEditing();
  };

  const handleRemove = async (id: Id<"vouches">) => {
    if (editingId === id) cancelEditing();
    await removeVouch({ id });
  };

  const editKeys = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") handleUpdate();
    if (event.key === "Escape") cancelEditing();
  };

  return (
    <AdminShell>
      <AdminPageHeader title="Vouches" />

      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <AdminSection title="Add a vouch">
          <div className="grid gap-4">
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Link">
              <Input
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
              />
            </Field>
            <div className="pt-1 pr-2 pb-2">
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || !url.trim()}
              >
                <Plus />
                Add vouch
              </Button>
            </div>
          </div>
        </AdminSection>

        <div className="min-w-0">
          {vouches === undefined && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}

          {vouches && vouches.length === 0 && (
            <p className="bg-surface-1 px-6 py-14 text-center text-sm text-muted-foreground">
              No vouches yet.
            </p>
          )}

          {vouches && vouches.length > 0 && (
            <ul className="rows 2xl:grid-cols-2">
              {vouches.map((vouch) =>
                editingId === vouch._id ? (
                  <li
                    key={vouch._id}
                    className="row flex flex-col gap-2 sm:flex-row sm:items-center"
                  >
                    <Input
                      aria-label="Name"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={editKeys}
                    />
                    <Input
                      aria-label="Link"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      onKeyDown={editKeys}
                    />
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleUpdate}
                        aria-label="Save"
                        disabled={!editName.trim() || !editUrl.trim()}
                      >
                        <Check />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={cancelEditing}
                        aria-label="Cancel"
                      >
                        <X />
                      </Button>
                    </div>
                  </li>
                ) : (
                  <li key={vouch._id} className="row flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">
                        {vouch.name}
                      </p>
                      <a
                        href={vouch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pixel-11 block truncate text-faint hover:text-foreground"
                      >
                        {vouch.url}
                      </a>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEditing(vouch)}
                        aria-label={`Edit ${vouch.name}`}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(vouch._id)}
                        aria-label={`Remove ${vouch.name}`}
                      >
                        <Trash2 className="text-danger" />
                      </Button>
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
