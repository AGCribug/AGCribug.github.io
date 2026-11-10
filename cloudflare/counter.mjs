// Deploy to the existing `counter` Worker and bind KV as VISIT_KV.
const allowedOrigins = new Set(["https://agcribug.github.io"]);
export default {
    async fetch(request, env) {
        const origin = request.headers.get("Origin");
        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            "Vary": "Origin"
        };
        if (allowedOrigins.has(origin)) {
            headers["Access-Control-Allow-Origin"] = origin;
            headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
            headers["Access-Control-Allow-Headers"] = "Accept, Content-Type";
        }
        const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
        if (origin && !allowedOrigins.has(origin)) return reply({ error: "Origin not allowed" }, 403);
        if (new URL(request.url).pathname !== "/visit") return reply({ error: "Not found" }, 404);
        if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
        if (!["GET", "POST"].includes(request.method)) return reply({ error: "Method not allowed" }, 405);
        try {
            const stored = await env.VISIT_KV.get("site-visits");
            let count = stored === null ? 0 : Number(stored);
            if (!Number.isSafeInteger(count) || count < 0) throw new Error("Invalid stored count");
            if (request.method === "POST") {
                count++;
                if (!Number.isSafeInteger(count)) throw new Error("Count overflow");
                await env.VISIT_KV.put("site-visits", String(count));
            }
            return reply({ count });
        } catch (error) {
            console.error("Visit counter failed", error);
            return reply({ error: "Counter unavailable" }, 503);
        }
    }
};
