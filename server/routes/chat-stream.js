// server/routes/chat-stream.js
// ──────────────────────────────────────────────────────────────────────
// Server-Sent Events (SSE) streaming endpoint for the long-running
// COMPOSING stage of the itinerary generation.
// ──────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { handleChatTurn } from '../services/chatService.js';
import { validateBody } from '../middleware/validate.js';
import { chatTurnSchema } from '../schemas/index.js';

const router = Router();

router.post('/', validateBody(chatTurnSchema), async (req, res) => {
  const { message, tripState = {}, stage = 'COMPOSING' } = req.body;

  // Set SSE response headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    if (res.flush) res.flush();
  };

  // Initial acknowledgment event
  sendEvent('progress', { text: 'Starting itinerary composition…' });

  try {
    const result = await handleChatTurn({
      message,
      tripState,
      stage,
      onProgress: (text) => sendEvent('progress', { text }),
    });

    sendEvent('done', result);
  } catch (err) {
    console.error('[chat-stream] Stream error:', err);
    sendEvent('error', { message: err.message || 'Composition error' });
  } finally {
    res.end();
  }
});

export default router;
