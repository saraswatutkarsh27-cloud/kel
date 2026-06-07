import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, model, messages, apiKey } = body;

    if (!provider || !messages) {
      return NextResponse.json({ error: "Missing required fields: provider, messages" }, { status: 400 });
    }

    const key = apiKey || process.env[`${provider.toUpperCase()}_API_KEY`] || "";
    if (!key) {
      return NextResponse.json({ error: `No API key for ${provider}. Set ${provider.toUpperCase()}_API_KEY in env.` }, { status: 401 });
    }

    switch (provider) {
      case "gemini": return handleGemini(model, messages, key);
      case "claude": return handleClaude(model, messages, key);
      case "openai": return handleOpenAI(model, messages, key);
      default: return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

async function handleGemini(model: string, messages: { role: string; content: string }[], apiKey: string): Promise<NextResponse> {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model: model || "gemini-2.0-flash" });
    const history = messages.slice(0, -1).map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
    const lastMsg = messages[messages.length - 1];
    const chat = geminiModel.startChat({ history });
    const result = await chat.sendMessage(lastMsg?.content || "");
    const response = await result.response;
    return NextResponse.json({ role: "assistant", content: response.text() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function handleClaude(model: string, messages: { role: string; content: string }[], apiKey: string): Promise<NextResponse> {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: model || "claude-sonnet-4",
        max_tokens: 8192,
        messages: messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
      }),
    });
    if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
    const data = await response.json();
    return NextResponse.json({ role: "assistant", content: data.content?.[0]?.text || "" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function handleOpenAI(model: string, messages: { role: string; content: string }[], apiKey: string): Promise<NextResponse> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model || "gpt-4o",
        messages: messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
        stream: false,
      }),
    });
    if (!response.ok) return NextResponse.json({ error: await response.text() }, { status: response.status });
    const data = await response.json();
    return NextResponse.json({ role: "assistant", content: data.choices?.[0]?.message?.content || "" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
