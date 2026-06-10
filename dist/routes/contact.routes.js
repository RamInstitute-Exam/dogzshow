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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            res.status(400).json({ error: 'Name, email, and message are required' });
            return;
        }
        // MOCK EMAIL SENDER
        // In a real production environment, we would use nodemailer or a service like SendGrid here.
        console.log('\n======================================');
        console.log('📬 NEW CONTACT FORM SUBMISSION');
        console.log('======================================');
        console.log(`From: ${name} <${email}>`);
        console.log(`Message:\n${message}`);
        console.log('======================================\n');
        res.status(200).json({ success: 'Message received successfully! We will get back to you soon.' });
    }
    catch (error) {
        console.error('Error handling contact form submission:', error);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
}));
exports.default = router;
