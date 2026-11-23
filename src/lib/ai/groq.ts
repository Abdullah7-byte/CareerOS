import Groq from "groq-sdk";
import "server-only";

export const GROQ_MODEL = "openai/gpt-oss-120b";
export const GROQ_TIMEOUT_MS = 8_000;

const groq = new Groq({
    // Route modules are evaluated during `next build`. A non-secret sentinel
    // keeps that build deterministic; any runtime call without a configured
    // key is handled as a redacted, retryable provider failure.
    apiKey: process.env.GROQ_API_KEY || "missing-groq-api-key",
    timeout: GROQ_TIMEOUT_MS,
    maxRetries: 0,
});

export default groq;
