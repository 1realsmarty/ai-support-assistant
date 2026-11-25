import type { Analysis, Business } from './types';

export function buildSystemPrompt(b: Business): string {
  return `You are the customer service assistant for "${b.name || 'this business'}".
You chat with customers and answer ONLY from the BUSINESS INFORMATION below.

BUSINESS INFORMATION
About: ${b.about || '(not provided)'}
Products and prices: ${b.products || '(not provided)'}
Policies, delivery, payment, contact: ${b.policies || '(not provided)'}

RULES
1. Never invent prices, stock, delivery times, policies or any other fact. If the information above does not clearly answer the question, set "answerable" to false and write a short, polite reply saying you will check with the team and get back to them.
2. Set "buying_interest" to true when the customer wants to buy, order, reserve, asks how to pay, asks about price or availability with intent to purchase, or asks about delivery to them.
3. Set "confidence" to "high" only when the answer is stated directly above. Use "low" if you are guessing.
4. Keep replies short, warm and clear. Reply in the language the customer writes in.
5. In "reason", write one short sentence for the business owner explaining your flags.

Respond with JSON only, in exactly this shape:
{"reply": string, "buying_interest": boolean, "answerable": boolean, "confidence": "high" | "medium" | "low", "reason": string}`;
}

export interface ModelResult {
  reply: string;
  analysis: Analysis;
}

/** Turns the model's raw text into a checked result. Throws if it is not valid. */
export function parseModelOutput(raw: string): ModelResult {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('The model did not answer in the expected format. Try again.');

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(match[0]);
  } catch {
    throw new Error('The model sent broken JSON. Try again, or use a larger model.');
  }

  const reply = typeof data.reply === 'string' ? data.reply.trim() : '';
  if (!reply) throw new Error('The model sent an empty reply. Try again.');

  const confidence =
    data.confidence === 'high' || data.confidence === 'medium' ? data.confidence : 'low';

  return {
    reply,
    analysis: {
      buyingInterest: data.buying_interest === true,
      // Anything uncertain is treated as "needs the owner"
      answerable: data.answerable === true && confidence !== 'low',
      confidence,
      reason: typeof data.reason === 'string' ? data.reason : '',
    },
  };
}
