import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// GET all chats/conversations for the logged-in user (protected)
router.get('/chats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    // Fetch messages where the user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: { id: true, email: true },
        },
        receiver: {
          select: { id: true, email: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group messages by the conversation partner
    const chatMap = new Map<string, any>();
    for (const msg of messages) {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!chatMap.has(partner.id)) {
        chatMap.set(partner.id, {
          partner: {
            id: partner.id,
            email: partner.email,
          },
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
            read: msg.read,
          },
        });
      }
    }

    const chats = Array.from(chatMap.values());
    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching chat directories:', error);
    res.status(500).json({ error: 'Failed to fetch chat logs' });
  }
});

// GET message history with a specific user (protected)
router.get('/thread/:partnerId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const partnerId = String(req.params.partnerId);

    // Mark messages from the partner to me as read
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    const thread = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.status(200).json(thread);
  } catch (error) {
    console.error('Error fetching message thread:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// POST: Send a message (protected)
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const senderId = (req as any).user.userId;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      res.status(400).json({ error: 'Receiver ID and content are required' });
      return;
    }

    if (senderId === receiverId) {
      res.status(400).json({ error: 'You cannot send messages to yourself' });
      return;
    }

    // Check if recipient exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      res.status(404).json({ error: 'Recipient user not found' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content: String(content),
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to deliver message' });
  }
});

export default router;
