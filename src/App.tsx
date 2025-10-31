import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchModels, streamChat } from './api';

type ChatMessage = {
	role: 'user' | 'assistant' | 'system';
	content: string;
};

export default function App() {
	const [models, setModels] = useState<string[]>([]);
	const [selectedModel, setSelectedModel] = useState<string>('');
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState('');
	const [isStreaming, setIsStreaming] = useState(false);
	const abortRef = useRef<AbortController | null>(null);

	useEffect(() => {
		fetchModels()
			.then((ids) => {
				setModels(ids);
				if (!selectedModel && ids.length > 0) setSelectedModel(ids[0]);
			})
			.catch(() => {
				// ignore, UI will show empty
			});
	}, []);

	const canSend = useMemo(
		() => !isStreaming && input.trim().length > 0 && !!selectedModel,
		[isStreaming, input, selectedModel]
	);

	async function handleSend() {
		if (!canSend) return;
		const userText = input.trim();
		setInput('');
		const nextMessages: ChatMessage[] = [...messages, { role: 'user' as const, content: userText }];
		setMessages(nextMessages);

		setIsStreaming(true);
		abortRef.current?.abort();
		abortRef.current = new AbortController();

		let assistantSoFar = '';
		setMessages((prev) => [...prev, { role: 'assistant' as const, content: '' }]);

		try {
			await streamChat({
				model: selectedModel,
				messages: nextMessages,
				signal: abortRef.current.signal,
				onToken: (token) => {
					assistantSoFar += token;
					setMessages((prev) => {
						const copy = [...prev];
						copy[copy.length - 1] = { role: 'assistant' as const, content: assistantSoFar };
						return copy;
					});
				},
			});
		} catch (err) {
			// Aborted or failed. We keep partial output if any.
		} finally {
			setIsStreaming(false);
		}
	}

	function handleStop() {
		abortRef.current?.abort();
	}

	return (
		<div className="app">
			<header className="app__header">
				<h1>Local LLM Chat</h1>
				<div className="header__controls">
					<select
						value={selectedModel}
						onChange={(e) => setSelectedModel(e.target.value)}
					>
						{models.map((m) => (
							<option key={m} value={m}>
								{m}
							</option>
						))}
					</select>
					{isStreaming ? (
						<button className="btn btn--danger" onClick={handleStop}>Stop</button>
					) : null}
				</div>
			</header>

			<main className="chat">
				<div className="chat__messages">
					{messages.map((m, i) => (
						<div key={i} className={`message message--${m.role}`}>
							<div className="message__role">{m.role === 'user' ? 'You' : 'Assistant'}</div>
							<div className="message__content">{m.content}</div>
						</div>
					))}
				</div>

				<form
					className="chat__input"
					onSubmit={(e) => {
						e.preventDefault();
						handleSend();
					}}
				>
					<textarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={selectedModel ? 'Type a message...' : 'Loading models...'}
						rows={3}
						disabled={isStreaming}
					/>
					<button type="submit" className="btn" disabled={!canSend}>
						Send
					</button>
				</form>
			</main>
		</div>
	);
}


