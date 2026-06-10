"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// GET all chats/conversations for the logged-in user (protected)
router.get('/chats', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        // Fetch messages where the user is sender or receiver
        const messages = yield prisma_1.default.message.findMany({
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
        const chatMap = new Map();
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
    }
    catch (error) {
        console.error('Error fetching chat directories:', error);
        res.status(500).json({ error: 'Failed to fetch chat logs' });
    }
}));
// GET message history with a specific user (protected)
router.get('/thread/:partnerId', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const partnerId = String(req.params.partnerId);
        // Mark messages from the partner to me as read
        yield prisma_1.default.message.updateMany({
            where: {
                senderId: partnerId,
                receiverId: userId,
                read: false,
            },
            data: {
                read: true,
            },
        });
        const thread = yield prisma_1.default.message.findMany({
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
    }
    catch (error) {
        console.error('Error fetching message thread:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
}));
// POST: Send a message (protected)
router.post('/', auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const senderId = req.user.userId;
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
        const receiver = yield prisma_1.default.user.findUnique({
            where: { id: receiverId },
        });
        if (!receiver) {
            res.status(404).json({ error: 'Recipient user not found' });
            return;
        }
        const message = yield prisma_1.default.message.create({
            data: {
                senderId,
                receiverId,
                content: String(content),
            },
        });
        res.status(201).json(message);
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to deliver message' });
    }
}));
exports.default = router;
