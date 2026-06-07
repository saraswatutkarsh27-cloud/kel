import { createServer, type Server } from "http";
import { parse } from "url";
import next from "next";
import ShellManager from "./shell-manager.js";
import WSShellHandler from "./websocket.js";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "localhost";

async function main() {
  // Initialize Next.js
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  // Create HTTP server
  const server: Server = createServer((req, res) => {
    const parsedUrl = parse(req.url || "", true);
    handle(req, res, parsedUrl);
  });

  // Initialize shell manager and WebSocket handler
  const shellManager = new ShellManager();
  const wsHandler = new WSShellHandler(shellManager);

  // Attach WebSocket server to the HTTP server
  wsHandler.attach(server, "/ws/terminal");

  // Graceful shutdown
  const cleanup = () => {
    console.log("\nShutting down...");
    wsHandler.cleanup();
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  server.listen(port, () => {
    console.log(
      `> KEL IDE Server ready on http://${hostname}:${port}` +
        (dev ? " (development mode)" : "")
    );
    console.log(`> Terminal WebSocket: ws://${hostname}:${port}/ws/terminal`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
