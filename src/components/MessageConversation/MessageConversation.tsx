import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Message, fetchMessages } from '../../utils/contactsApi';

const INITIAL_MESSAGES = 15;
const LOAD_MORE_MESSAGES = 30;

interface MessageConversationProps {
	phoneNumber: string;
	contactName: string;
}

function formatMessageDate(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	} else if (diffDays === 1) {
		return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	} else if (diffDays < 7) {
		return (
			date.toLocaleDateString('en-US', { weekday: 'short' }) +
			' ' +
			date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
		);
	} else {
		return (
			date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
			' ' +
			date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
		);
	}
}

function shouldShowDateSeparator(current: Message, previous: Message | null): boolean {
	if (!previous) return true;
	const currentDate = new Date(current.date).toDateString();
	const previousDate = new Date(previous.date).toDateString();
	return currentDate !== previousDate;
}

function formatDateSeparator(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return 'Today';
	if (diffDays === 1) return 'Yesterday';
	if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
	return date.toLocaleDateString('en-US', {
		weekday: 'long',
		month: 'long',
		day: 'numeric',
	});
}

export default function MessageConversation({ phoneNumber, contactName }: MessageConversationProps) {
	const [allMessages, setAllMessages] = useState<Message[]>([]);
	const [displayCount, setDisplayCount] = useState(INITIAL_MESSAGES);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<string | null>(null);
	// eslint-disable-next-line no-undef
	const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
	const initialScrollDone = useRef(false);

	// Load all messages once
	useEffect(() => {
		let cancelled = false;

		async function loadMessages() {
			setLoading(true);
			setError(null);
			initialScrollDone.current = false;
			setDisplayCount(INITIAL_MESSAGES);
			try {
				const data = await fetchMessages(phoneNumber, 200);
				if (!cancelled) {
					// Data comes newest first, keep it that way for slicing
					setAllMessages(data);
				}
			} catch (err) {
				if (!cancelled) {
					setError('Failed to load messages');
					console.error('Error loading messages:', err);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		loadMessages();

		return () => {
			cancelled = true;
		};
	}, [phoneNumber]);

	// Scroll to bottom on initial load
	useEffect(() => {
		if (!loading && containerEl && !initialScrollDone.current && allMessages.length > 0) {
			containerEl.scrollTop = containerEl.scrollHeight;
			initialScrollDone.current = true;
		}
	}, [loading, allMessages.length, containerEl]);

	// Handle scroll to load more messages
	const handleScroll = useCallback(() => {
		if (!containerEl || loadingMore) return;

		const scrollTop = containerEl.scrollTop;
		const scrollHeight = containerEl.scrollHeight;
		const clientHeight = containerEl.clientHeight;

		// If scrolled to top half of content, load more
		if (scrollTop < clientHeight / 2 && displayCount < allMessages.length) {
			setLoadingMore(true);
			const prevScrollHeight = scrollHeight;

			// Use setTimeout to allow state update before measuring
			window.setTimeout(() => {
				setDisplayCount((prev) => Math.min(prev + LOAD_MORE_MESSAGES, allMessages.length));
				// Maintain scroll position after adding messages
				window.requestAnimationFrame(() => {
					if (containerEl) {
						const newScrollHeight = containerEl.scrollHeight;
						containerEl.scrollTop = newScrollHeight - prevScrollHeight + scrollTop;
					}
					setLoadingMore(false);
				});
			}, 0);
		}
	}, [containerEl, loadingMore, displayCount, allMessages.length]);

	// Get displayed messages (most recent N, reversed for display order)
	const displayedMessages = allMessages.slice(0, displayCount).reverse();

	if (loading) {
		return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 200 }}>
				<CircularProgress size={24} />
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ p: 2, textAlign: 'center' }}>
				<Typography color='error'>{error}</Typography>
			</Box>
		);
	}

	if (allMessages.length === 0) {
		return (
			<Box sx={{ p: 2, textAlign: 'center' }}>
				<Typography color='text.secondary'>No messages found</Typography>
			</Box>
		);
	}

	return (
		<Box
			ref={setContainerEl}
			onScroll={handleScroll}
			sx={{
				display: 'flex',
				flexDirection: 'column',
				gap: 0.5,
				p: 2,
				height: '100%',
				overflowY: 'auto',
				bgcolor: 'background.default',
			}}>
			{loadingMore && (
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
					<CircularProgress size={16} />
				</Box>
			)}
			{displayedMessages.map((msg, idx) => {
				const previous = idx > 0 ? displayedMessages[idx - 1] : null;
				const showDateSeparator = shouldShowDateSeparator(msg, previous);

				return (
					<React.Fragment key={`${msg.date}-${idx}`}>
						{showDateSeparator && (
							<Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
								<Typography
									variant='caption'
									sx={{
										bgcolor: 'action.hover',
										px: 2,
										py: 0.5,
										borderRadius: 1,
										color: 'text.secondary',
									}}>
									{formatDateSeparator(msg.date)}
								</Typography>
							</Box>
						)}
						<Box
							sx={{
								display: 'flex',
								justifyContent: msg.isFromMe ? 'flex-end' : 'flex-start',
								mb: 0.5,
							}}>
							<Box
								sx={{
									maxWidth: '75%',
									px: 1.5,
									py: 1,
									borderRadius: 1.25,
									bgcolor: msg.isFromMe ? 'primary.main' : 'grey.800',
									color: msg.isFromMe ? 'primary.contrastText' : 'text.primary',
								}}>
								<Typography
									variant='body2'
									sx={{
										whiteSpace: 'pre-wrap',
										wordBreak: 'break-word',
									}}>
									{msg.message}
								</Typography>
								<Typography
									variant='caption'
									sx={{
										display: 'block',
										mt: 0.5,
										opacity: 0.7,
										textAlign: msg.isFromMe ? 'right' : 'left',
										fontSize: '0.65rem',
									}}>
									{formatMessageDate(msg.date)}
								</Typography>
							</Box>
						</Box>
					</React.Fragment>
				);
			})}
		</Box>
	);
}
