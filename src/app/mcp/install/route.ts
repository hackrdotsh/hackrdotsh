export function GET() {
  return new Response(
    "Add https://hackr.sh/mcp as a remote Streamable HTTP MCP server in your client. Choose OAuth, sign in with your owner passkey, and approve the connection. For clients without OAuth, use an Authorization: Bearer header with your portfolio token.",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
