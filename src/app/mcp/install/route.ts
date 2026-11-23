export function GET() {
  const installer = new URL("https://insiders.vscode.dev/redirect/mcp/install");
  installer.searchParams.set("name", "hackr-portfolio");
  installer.searchParams.set(
    "config",
    JSON.stringify({
      type: "http",
      url: "https://hackr.sh/mcp",
      // biome-ignore lint/suspicious/noTemplateCurlyInString: VS Code expands this on the client.
      headers: { Authorization: "Bearer ${env:PORTFOLIO_MCP_TOKEN}" },
    }),
  );
  return new Response(null, {
    status: 302,
    headers: { Location: installer.href },
  });
}
