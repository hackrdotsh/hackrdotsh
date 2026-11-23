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

Add `https://hackr.sh/mcp` to your client as a remote Streamable HTTP server.
Choose OAuth, sign in with your owner passkey, check the client's return address,
and select **Allow access**. Clients that support dynamic registration need only
the URL. For clients that accept a manual token instead, set
`Authorization: Bearer <PORTFOLIO_MCP_TOKEN>` in the client's secret store.

Each approval creates a separate OAuth authorization, including repeat approvals
for the same client. Open **MCP** in the admin navigation or visit
[`/admin/mcp`](https://hackr.sh/admin/mcp) to revoke one without disconnecting
the others. This page manages OAuth grants, not the shared manual token.

For deployment, bind a dedicated Cloudflare KV namespace as `OAUTH_KV` for OAuth
registrations and grants. Set the same random `PORTFOLIO_MCP_TOKEN` secret in
the Worker and Convex, and point `NEXT_PUBLIC_CONVEX_SITE_URL` at the deployment's
HTTP actions URL. OAuth clients never receive the Worker-to-Convex secret.

`list_records` returns full records from `resumes`, `coverLetters`, `jobPostings`,
`vouches`, and `guestbook`. When `isDone` is false, pass `continueCursor` as the
next call's `cursor`. Use a record's `_id` to update it.

`update_resume` replaces structured resume content. `update_cover_letter`
replaces the letter text. Both preserve existing job links. `update_job` changes
only the fields you supply. Use `create_resume`, `create_cover_letter`, and
`create_job` to create records. Each returns the new ID. Their `delete_*`
counterparts permanently delete by ID. New resumes are unpublished, and MCP
cannot delete the live resume or a job that still has linked documents.
Existing OAuth connections keep their original permissions; reconnect to approve
create and delete access. Vouches and guestbook entries are read-only.
Rotate the shared secret in both deployments to
revoke manual tokens; OAuth grants have their own lifecycle.
