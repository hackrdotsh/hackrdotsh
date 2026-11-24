import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageShell } from "~/components/page-shell";
import { getPostMetaList } from "~/lib/blog";
import { generatePageMetadata } from "~/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Blog",
  description: "Thoughts on software, NixOS, homelabbing, and other things.",
  path: "/blog",
});

export const dynamic = "force-static";

export default function Blog() {
  const posts = getPostMetaList();

  return (
    <PageShell>
      <PageHeader
        title="Writing"
        description="Thoughts on software, NixOS, homelabbing, and other things."
      />

      <ul className="rows mt-12">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="row">
              <span className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-baseline sm:gap-6">
                {post.date && (
                  <time dateTime={post.date} className="pixel-11 text-faint">
                    {new Date(post.date).toLocaleDateString("en-CA")}
                  </time>
                )}
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">
                    {post.title}
                  </span>
                  {post.description && (
                    <span className="mt-1 block max-w-xl text-sm leading-relaxed text-muted-foreground">
                      {post.description}
                    </span>
                  )}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
