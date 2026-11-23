<div align="center">

# About Me

Hey! I'm **Mohammad**!

I'm a software developer interested in

Web Dev &nbsp;&nbsp; • &nbsp;&nbsp; Desktop Apps &nbsp;&nbsp; • &nbsp;&nbsp; Mobile Apps

Servers &nbsp;&nbsp; • &nbsp;&nbsp; Security &nbsp;&nbsp; • &nbsp;&nbsp; DevOps

[hackr.sh](https://hackr.sh) &nbsp;&nbsp; • &nbsp;&nbsp; [LinkedIn](https://linkedin.com/in/mohammadalahdal)

![hackr-sh's Top Languages](https://git-stats.alahdal.ca/api/top-langs/?username=hackrdotsh&layout=compact&theme=rose_pine)

![hackr-sh's GitHub stats](https://git-stats.alahdal.ca/api?username=hackrdotsh&theme=rose_pine&rank_icon=percentile)

## Currently Working On

[thenix.guide](https://thenix.guide) &nbsp;&nbsp; • &nbsp;&nbsp; [rocky.systems](https://rocky.systems) &nbsp;&nbsp; • &nbsp;&nbsp; [itsasecret.dev](https://itsasecret.dev) &nbsp;&nbsp; • &nbsp;&nbsp; [co.codes](https://co.codes)

</div>

## Portfolio MCP

Set `PORTFOLIO_MCP_TOKEN` to a random secret in the Convex deployment settings.
Use a dedicated token, not a Convex deploy key or an owner session. After deploying
the Convex functions and site, [install in VS Code](https://hackr.sh/mcp/install).
Start VS Code with `PORTFOLIO_MCP_TOKEN` in its environment. The install link
contains only the variable name. For other Streamable HTTP MCP clients, use:

- **URL:** `https://hackr.sh/mcp`
- **Header:** `Authorization: Bearer <PORTFOLIO_MCP_TOKEN>`

`list_records` returns full records from `resumes`, `coverLetters`, `jobPostings`,
`vouches`, and `guestbook`. When `isDone` is false, pass `continueCursor` as the
next call's `cursor`. Use a record's `_id` to update it.

`update_resume` replaces structured resume content. `update_cover_letter`
replaces the letter text. Both preserve existing job links. `update_job` changes
only the fields you supply. Vouches and guestbook entries are read-only. No tool
creates or deletes records. Rotate or remove the token in Convex to revoke access.
