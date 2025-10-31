import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchModels, streamChat } from './api';

type ChatMessage = {
	role: 'user' | 'assistant' | 'system';
	content: string;
};

export default function App() {
	const [selectedModel, setSelectedModel] = useState<string>('');
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState('');
	const [isStreaming, setIsStreaming] = useState(false);
	const [error, setError] = useState<string>('');
	const abortRef = useRef<AbortController | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetchModels()
			.then((ids) => {
				if (!selectedModel && ids.length > 0) setSelectedModel(ids[0]);
				setError('');
			})
			.catch((err) => {
				setError('Failed to connect to LM Studio. Is it running on port 1234?');
				console.error('Model fetch error:', err);
			});
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const canSend = useMemo(
		() => !isStreaming && input.trim().length > 0 && !!selectedModel,
		[isStreaming, input, selectedModel]
	);

	async function handleSend() {
		if (!canSend) return;
		const userText = input.trim();
		setInput('');
		setError('');
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
		} catch (err: any) {
			if (err.name !== 'AbortError') {
				setError('Failed to get response. Check your connection to LM Studio.');
				console.error('Stream error:', err);
			}
		} finally {
			setIsStreaming(false);
		}
	}

	function handleStop() {
		abortRef.current?.abort();
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text).then(() => {
			// Could add a toast notification here
		});
	}

	return (
		<div className="app">
			<header className="app__header">
				<h1>Local LLM Chat</h1>
				{isStreaming && (
					<button className="btn btn--danger" onClick={handleStop}>
						⏹ Stop
					</button>
				)}
			</header>

			<main className="chat">
				<div className="chat__messages">
					{error && (
						<div style={{ 
							padding: '12px 16px', 
							background: 'rgba(255,107,107,0.1)', 
							border: '1px solid rgba(255,107,107,0.3)',
							borderRadius: '8px',
							color: '#ff6b6b',
							fontSize: '14px'
						}}>
							⚠️ {error}
						</div>
					)}
					{messages.length === 0 && !error ? (
						<div className="chat__empty">
							<div className="chat__empty-icon">💬</div>
							<div className="chat__empty-text">Start a conversation with your local LLM</div>
						</div>
					) : (
						messages.map((m, i) => (
							<div key={i} className={`message message--${m.role}`}>
								<div className="message__avatar">
									{m.role === 'user' ? '👤' : '🤖'}
								</div>
								<div className="message__body">
									<div className="message__role">{m.role === 'user' ? 'You' : 'Assistant'}</div>
									<div className="message__content">
										{m.role === 'assistant' ? (
											<ReactMarkdown remarkPlugins={[remarkGfm]}>
												{m.content || '▋'}
											</ReactMarkdown>
										) : (
											m.content
										)}
									</div>
								</div>
								{m.content && (
									<div className="message__actions">
										<button 
											className="btn btn--icon" 
											onClick={() => copyToClipboard(m.content)}
											title="Copy to clipboard"
										>
											📋
										</button>
									</div>
								)}
							</div>
						))
					)}
					<div ref={messagesEndRef} />
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
						onKeyDown={handleKeyDown}
						placeholder={selectedModel ? 'Type a message... (Enter to send, Shift+Enter for new line)' : 'Loading models...'}
						rows={3}
						disabled={isStreaming || !selectedModel}
					/>
					<button type="submit" className="btn" disabled={!canSend}>
						{isStreaming ? '⏳' : '🚀'} Send
					</button>
				</form>
			</main>
		</div>
	);
}


