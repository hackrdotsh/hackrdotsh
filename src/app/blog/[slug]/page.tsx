import { ArrowLeft } from "lucide-react";
import { marked } from "marked";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "~/components/page-shell";
import { Button } from "~/components/ui/button";
import { getAllSlugs, getPostBySlug } from "~/lib/blog";
import { generatePageMetadata } from "~/lib/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-static";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const { meta } = getPostBySlug(slug);
    return generatePageMetadata({
      title: meta.title,
      description: meta.description,
      path: `/blog/${meta.slug}`,
    });
  } catch {
    return { title: "Not Found | hackr" };
  }
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;

  let post: ReturnType<typeof getPostBySlug>;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const html = await marked(post.content);

  return (
    <PageShell className="max-w-3xl">
      <article>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2.5"
          render={<Link href="/blog" />}
        >
          <ArrowLeft />
          All posts
        </Button>

        <header className="mt-8">
          <h1 className="pixel-33 text-balance text-foreground">
            {post.meta.title}
          </h1>
          <time
            dateTime={post.meta.date}
            className="pixel-11 mt-4 block text-faint"
          >
            {new Date(post.meta.date).toLocaleDateString("en-CA")}
          </time>
        </header>
        <hr className="rule my-10" />
        <div
          className="blog-prose max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </PageShell>
  );
}
