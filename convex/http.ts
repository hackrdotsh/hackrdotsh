import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { handle } from "./mcp";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);
http.route({ path: "/mcp", method: "POST", handler: handle });

export default http;
