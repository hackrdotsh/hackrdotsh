import { Band } from "~/components/band";
import { Tag } from "~/components/ui/tag";
import type { ResumeData } from "~/lib/resume";

function groupSkills(skills: ResumeData["skills"]) {
  const groups: Record<string, ResumeData["skills"]> = {};
  for (const skill of skills) {
    groups[skill.category] ??= [];
    groups[skill.category].push(skill);
  }
  return Object.entries(groups);
}

function Experience({
  experience,
}: {
  experience: ResumeData["experiences"][number];
}) {
  const { description } = experience;
  return (
    <li className="row">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <h3 className="font-semibold text-foreground">
          {experience.title}
          <span className="text-accent"> @ </span>
          {experience.company}
        </h3>
        <p className="pixel-11 shrink-0 text-faint">
          {experience.years.start} — {experience.years.end}
        </p>
      </div>
      <div className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {typeof description === "string" ? (
          <p>{description}</p>
        ) : (
          <ul className="grid gap-2">
            {description.map((item) => (
              <li key={item.slice(0, 32)} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-[0.55em] size-1 shrink-0 bg-accent"
                />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export function ResumeView({ data }: { data: ResumeData }) {
  return (
    <div>
      <Band title="Profile">
        <p className="max-w-2xl leading-relaxed text-muted-foreground">
          {data.profile}
        </p>
      </Band>

      <Band title="Experience">
        <ul className="rows">
          {data.experiences.map((experience) => (
            <Experience
              key={`${experience.company}-${experience.years.start}`}
              experience={experience}
            />
          ))}
        </ul>
      </Band>

      <Band title="Skills">
        <div className="grid gap-8">
          {groupSkills(data.skills).map(([category, skills]) => (
            <div key={category}>
              <h3 className="pixel-11 text-muted-foreground uppercase">
                {category}
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <li key={skill.name}>
                    <Tag tone={skill.isExpert ? "accent" : "muted"}>
                      {skill.name}
                    </Tag>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Band>

      {data.education && (
        <Band title="Education">
          <h3 className="font-semibold text-foreground">
            {data.education.degreeName}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.education.universityName}
          </p>
          <p className="pixel-11 mt-2 text-faint">
            {data.education.progression}
            {data.education.gpa ? ` · GPA ${data.education.gpa}` : ""}
          </p>
        </Band>
      )}
    </div>
  );
}
