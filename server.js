import { serve } from "bun";
import path from "path";
import logController from "./controllers/logController.js";

const PORT = 3000;
const htmlFilePath = path.join(process.cwd(), "public", "index.html");
const staticPath = path.join(process.cwd(), "public");

const routes = {
    "GET /": async () => {
        const html = await Bun.file(htmlFilePath).text();
        return new Response(html, {
            headers: {
                "Content-Type": "text/html"
            }
        });
    },
    "POST /log": logController
};

serve({
    fetch(req) {
        const url = new URL(req.url);
        const routeKey = `${req.method} ${url.pathname}`;

        // Match route
        if (routes[routeKey]) {
            return routes[routeKey](req);
        }

        // Serve static files
        if (req.method === "GET") {
            const filePath = path.join(staticPath, url.pathname);
            try {
                const file = Bun.file(filePath);
                return new Response(file.stream(), {
                    headers: {
                        "Content-Type": Bun.lookup(filePath) || "application/octet-stream"
                    }
                });
            } catch {
                return new Response("Not Found", { status: 404 });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
    port: PORT
});

console.log(`Server is running on http://localhost:${PORT}`);
