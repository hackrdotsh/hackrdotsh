import { PixelMountains } from "~/components/pixel-mountains";
import { contactLinks, projects } from "~/lib/site-data";

const linkClass = "text-sm text-muted-foreground hover:text-foreground";

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="pixel-11 text-faint uppercase">{children}</h2>;
}

export function Footer() {
  return (
    <footer>
      <hr className="rule" />
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-5 py-14 sm:grid-cols-[1.4fr_1fr_1fr] sm:px-8">
        <p className="pixel-22">
          hackr<span className="text-accent">.</span>
        </p>
        <div>
          <FooterHeading>Projects</FooterHeading>
          <ul className="mt-4 grid gap-2">
            {projects.map((project) => (
              <li key={project.title}>
                {project.href ? (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {project.title}
                  </a>
                ) : (
                  <span className="text-sm text-faint">{project.title}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <FooterHeading>Elsewhere</FooterHeading>
          <ul className="mt-4 grid gap-2">
            {contactLinks.map((link) => {
              const external = !link.href.startsWith("mailto:");
              return (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className={linkClass}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <PixelMountains />
    </footer>
  );
}
