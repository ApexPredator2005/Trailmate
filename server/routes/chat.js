/**
 * server/routes/chat.js — Chat & Conversation Intake Route
 * POST /api/chat
 *
 * Receives:
 *   { message: string, tripState: object, stage: Stage }
 *
 * Dispatches to chatService.js which routes per stage:
 *   PARSING / CLARIFYING → Gemini extracts structured trip fields
 *   COMPOSING            → Gemini sequences real selections into itinerary
 *   DONE                 → Gemini-backed grounded follow-up answers
 *   All other stages     → lightweight acknowledgement (client drives flow)
 */

import { Router } from 'express';
import { handleChatTurn } from '../services/chatService.js';
import { validateBody } from '../middleware/validate.js';
import { chatTurnSchema } from '../schemas/index.js';

const router = Router();

router.post('/', validateBody(chatTurnSchema), async (req, res, next) => {
  try {
    const { message, tripState = {}, stage = 'WELCOME' } = req.body;
    const result = await handleChatTurn({ message, tripState, stage });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
