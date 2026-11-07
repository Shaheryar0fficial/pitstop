// Part B owns this file. Duplicate-question check (Shared Contract → B7).
//
// POST { text, bikeKey }  with  Authorization: Bearer <Firebase ID token>
// → { matches: [{ id, text, replyCount }] }   (up to 3)
//
// 1. Verify the caller's Firebase ID token (so strangers can't spend Claude credits).
// 2. Load the 30 latest question posts for that bike.
// 3. Ask Claude (structured JSON output, low effort, English only) which are similar.
//
// The contract says to use Part A's lib/claude.ts for the Anthropic client. It
// doesn't exist yet, so the client is created here; swap to it once it lands.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-5-5";

const SYSTEM_PROMPT = `You find duplicate questions for PitStop, a community for Pakistani heavy bike owners.
You get a new question and a numbered list of past questions about the same bike.
Return the IDs of past questions that ask about the same problem or topic, so the rider can read the existing answers instead of posting again.
Only include a past question if its answers would genuinely help with the new question. Return at most 3 IDs, most similar first. Return an empty list when nothing is similar.
Use only IDs from the list. Write in English only.`;

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    similar_ids: { type: "array", items: { type: "string" } },
  },
  required: ["similar_ids"],
  additionalProperties: false,
};

type Match = { id: string; text: string; replyCount: number };

export async function POST(request: Request) {
  // Imported lazily so a missing FIREBASE_SERVICE_ACCOUNT can't break the build.
  const { adminDb, verifyRequest } = await import("@/lib/firebase-admin");

  const uid = await verifyRequest(request);
  if (!uid) return Response.json({ error: "Sign in required." }, { status: 401 });

  let body: { text?: unknown; bikeKey?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send JSON: { text, bikeKey }." }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 1000) : "";
  const bikeKey = typeof body.bikeKey === "string" ? body.bikeKey : "";
  if (text.length < 20 || !bikeKey) return Response.json({ matches: [] });

  let candidates: Match[];
  try {
    const snap = await adminDb
      .collection("posts")
      .where("type", "==", "question")
      .where("bikeKey", "==", bikeKey)
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();
    candidates = snap.docs.map((d) => ({
      id: d.id,
      text: String(d.get("text") ?? ""),
      replyCount: Number(d.get("replyCount") ?? 0),
    }));
  } catch (e) {
    // Most likely the posts (type, bikeKey, createdAt desc) index is missing;
    // the message contains the console link to create it.
    console.error("[api/similar] Firestore query failed:", e);
    return Response.json({ matches: [], error: "Could not load past questions." }, { status: 500 });
  }
  if (candidates.length === 0) return Response.json({ matches: [] });

  const pastList = candidates.map((c) => `[${c.id}] ${c.text.replace(/\s+/g, " ")}`).join("\n");

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 2048,
      // On a safety decline, the API re-runs the request on Anthropic's recommended fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `New question:\n${text}\n\nPast questions:\n${pastList}`,
        },
      ],
    });

    if (response.stop_reason === "refusal") return Response.json({ matches: [] });

    const block = response.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") return Response.json({ matches: [] });

    const parsed = JSON.parse(block.text) as { similar_ids?: unknown };
    const ids = Array.isArray(parsed.similar_ids) ? parsed.similar_ids.filter((x): x is string => typeof x === "string") : [];

    // Keep only real candidates, in Claude's order, at most 3.
    const byId = new Map(candidates.map((c) => [c.id, c]));
    const matches = [...new Set(ids)].map((id) => byId.get(id)).filter((m): m is Match => Boolean(m)).slice(0, 3);

    return Response.json({ matches });
  } catch (e) {
    if (e instanceof Anthropic.APIError) {
      console.error(`[api/similar] Claude API error ${e.status}:`, e.message);
      return Response.json({ matches: [], error: "The similarity check is unavailable." }, { status: 502 });
    }
    console.error("[api/similar] Unexpected error:", e);
    return Response.json({ matches: [], error: "The similarity check failed." }, { status: 500 });
  }
}
