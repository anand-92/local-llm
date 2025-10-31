const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

// Headers to bypass localtunnel verification page
const TUNNEL_HEADERS = {
	'bypass-tunnel-reminder': 'true',
	'User-Agent': 'CustomClient/1.0'
};

export async function fetchModels(): Promise<string[]> {
	const res = await fetch(`${API_BASE}/v1/models`, {
		headers: TUNNEL_HEADERS
	});
	if (!res.ok) throw new Error('Failed to fetch models');
	const data = await res.json();
	// OpenAI-style response: { data: [{ id: string }] }
	if (Array.isArray(data?.data)) {
		return data.data.map((m: any) => m.id).filter(Boolean);
	}
	// LM Studio also supports /v1/models returning { object: 'list', data: [...] }
	return [];
}

type Message = { role: 'user' | 'assistant' | 'system'; content: string };

export async function streamChat(args: {
	model: string;
	messages: Message[];
	signal?: AbortSignal;
	onToken: (token: string) => void;
}) {
	const res = await fetch(`${API_BASE}/v1/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...TUNNEL_HEADERS
		},
		body: JSON.stringify({
			model: args.model,
			messages: args.messages,
			stream: true,
		}),
		signal: args.signal,
	});

	if (!res.ok || !res.body) {
		throw new Error('Chat request failed');
	}

	const reader = res.body.getReader();
	const decoder = new TextDecoder('utf-8');
	let buffer = '';

	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		const lines = buffer.split(/\r?\n/);
		buffer = lines.pop() ?? '';
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed.startsWith('data:')) continue;
			const payload = trimmed.slice(5).trim();
			if (payload === '[DONE]') return;
			try {
				const json = JSON.parse(payload);
				const delta = json?.choices?.[0]?.delta?.content ?? '';
				if (typeof delta === 'string' && delta.length > 0) {
					args.onToken(delta);
				}
			} catch {
				// ignore malformed lines
			}
		}
	}
}


