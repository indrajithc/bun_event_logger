import { serve } from "bun";
import path from "path";
import logController from "./controllers/logController.js";

const PORT = 3000;
const htmlFilePath = path.join(process.cwd(), "public", "index.html");
const staticPath = path.join(process.cwd(), "public");

// CORS middleware: Add CORS headers to every response
const addCorsHeaders = (response) => {
  response.headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
};

// Handle OPTIONS preflight requests
const handleOptions = () => {
  const response = new Response(null, {
    status: 204, // No content
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
  return response;
};

const routes = {
  "GET /": async () => {
    const html = await Bun.file(htmlFilePath).text();
    const response = new Response(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
    return addCorsHeaders(response); // Add CORS headers to the response
  },
  "POST /log": async (...ctx) => addCorsHeaders(await logController(...ctx)), // Add CORS headers to the response
  "POST /log-performance": async (req) => {
    try {
      const data = await req.json();
      console.log("Performance Data Logged:", data);

      const response = new Response("Performance data logged successfully", {
        status: 200,
      });
      return addCorsHeaders(response); // Add CORS headers to the response
    } catch (error) {
      console.error("Error logging performance data:", error);
      const response = new Response("Invalid JSON", { status: 400 });
      return addCorsHeaders(response); // Add CORS headers to the response
    }
  },
};

serve({
  fetch(req) {
    const url = new URL(req.url);
    const routeKey = `${req.method} ${url.pathname}`;

    // Handle OPTIONS preflight requests
    if (req.method === "OPTIONS") {
      return handleOptions(); // Handle preflight request with CORS headers
    }

    // Match route
    if (routes[routeKey]) {
      return routes[routeKey](req);
    }

    // Serve static files
    if (req.method === "GET") {
      const filePath = path.join(staticPath, url.pathname);
      try {
        const file = Bun.file(filePath);
        const response = new Response(file.stream(), {
          headers: {
            "Content-Type": Bun.lookup(filePath) || "application/octet-stream",
          },
        });
        return addCorsHeaders(response); // Add CORS headers to the response
      } catch {
        const response = new Response("Not Found", { status: 404 });
        return addCorsHeaders(response); // Add CORS headers to the response
      }
    }

    const response = new Response("Not Found", { status: 404 });
    return addCorsHeaders(response); // Add CORS headers to the response
  },
  port: PORT,
});

console.log(`Server is running on http://localhost:${PORT}`);
