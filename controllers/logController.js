import browserDetector from "../utils/browserDetector.js";

export default async function logEvent(req) {
  try {
    const data = await req.json();
    const userAgent = req.headers.get("User-Agent") || "Unknown";
    const browserDetails = browserDetector(userAgent);

    console.log(`Event Logged:\n  Type: ${data.eventType}\n  Target: ${data.targetTag}\n  Browser: ${browserDetails}`);

    return new Response("Event logged successfully", { status: 200 });
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return new Response("Invalid JSON", { status: 400 });
  }
}
