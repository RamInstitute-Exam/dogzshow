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
exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const client_ses_1 = require("@aws-sdk/client-ses");
const prisma = new client_1.PrismaClient();
// Configure AWS SES
const sesClient = new client_ses_1.SESClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
});
class NotificationService {
    static dispatch(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notification = yield prisma.notification.create({
                    data: {
                        title: payload.title,
                        message: payload.message,
                        shortMessage: payload.shortMessage,
                        notificationType: payload.notificationType,
                        category: payload.category,
                        priority: payload.priority || 'NORMAL',
                        receiverId: payload.receiverId,
                        receiverRole: payload.receiverRole,
                        actionUrl: payload.actionUrl,
                        icon: payload.icon,
                        deliveryStatus: 'PENDING',
                    }
                });
                switch (payload.notificationType) {
                    case 'EMAIL':
                        yield this.sendEmail(notification.id, payload);
                        break;
                    case 'SMS':
                        yield this.sendSMS(notification.id, payload);
                        break;
                    case 'WHATSAPP':
                        yield this.sendWhatsApp(notification.id, payload);
                        break;
                    case 'PUSH':
                        // Push logic here
                        break;
                    case 'IN_APP':
                    default:
                        yield this.sendInAppRealTime(notification.id, payload);
                        break;
                }
                return notification;
            }
            catch (error) {
                console.error('Failed to dispatch notification:', error);
                throw error;
            }
        });
    }
    static sendEmail(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            let status = 'FAILED';
            let responseData = null;
            try {
                if (!payload.receiverEmail)
                    throw new Error('Receiver Email missing');
                if (!process.env.AWS_ACCESS_KEY_ID)
                    throw new Error('AWS Keys missing');
                const command = new client_ses_1.SendEmailCommand({
                    Source: process.env.SES_FROM_EMAIL || 'no-reply@juzdog.com',
                    Destination: { ToAddresses: [payload.receiverEmail] },
                    Message: {
                        Subject: { Data: payload.title },
                        Body: {
                            Html: { Data: payload.message },
                            Text: { Data: payload.shortMessage || payload.message }
                        }
                    }
                });
                const response = yield sesClient.send(command);
                status = 'SENT';
                responseData = response;
            }
            catch (error) {
                console.error(`[EMAIL FAILED] ${error.message}`);
                responseData = { error: error.message };
            }
            finally {
                yield this.logProvider(id, 'EMAIL', 'SMTP_SES', status, responseData);
            }
        });
    }
    static sendSMS(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let status = 'FAILED';
            let responseData = null;
            try {
                if (!payload.receiverPhone)
                    throw new Error('Receiver Phone missing');
                if (!process.env.MSG91_AUTH_KEY)
                    throw new Error('MSG91 Auth Key missing');
                const response = yield axios_1.default.post('https://api.msg91.com/api/v5/flow/', {
                    template_id: payload.templateId || 'default_template_id',
                    short_url: '1',
                    recipients: [
                        {
                            mobiles: payload.receiverPhone.replace('+', ''),
                            message: payload.shortMessage || payload.title
                        }
                    ]
                }, {
                    headers: {
                        authkey: process.env.MSG91_AUTH_KEY,
                        'Content-Type': 'application/json'
                    }
                });
                status = 'SENT';
                responseData = response.data;
            }
            catch (error) {
                console.error(`[SMS FAILED] ${error.message}`);
                responseData = ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || { error: error.message };
            }
            finally {
                yield this.logProvider(id, 'SMS', 'MSG91', status, responseData);
            }
        });
    }
    static sendWhatsApp(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let status = 'FAILED';
            let responseData = null;
            try {
                if (!payload.receiverPhone)
                    throw new Error('Receiver Phone missing');
                if (!process.env.WATI_API_URL || !process.env.WATI_BEARER_TOKEN)
                    throw new Error('WATI Configuration missing');
                const response = yield axios_1.default.post(`${process.env.WATI_API_URL}/api/v1/sendTemplateMessage`, {
                    broadcast_name: payload.category,
                    parameters: [
                        { name: 'message', value: payload.shortMessage || payload.title }
                    ],
                    template_name: payload.templateId || 'default_notification',
                }, {
                    params: { whatsappNumber: payload.receiverPhone.replace('+', '') },
                    headers: {
                        Authorization: `Bearer ${process.env.WATI_BEARER_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                });
                status = 'SENT';
                responseData = response.data;
            }
            catch (error) {
                console.error(`[WHATSAPP FAILED] ${error.message}`);
                responseData = ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || { error: error.message };
            }
            finally {
                yield this.logProvider(id, 'WHATSAPP', 'WATI', status, responseData);
            }
        });
    }
    static sendInAppRealTime(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[IN_APP] Socket emitted to ${payload.receiverId}: ${payload.title}`);
        });
    }
    static logProvider(notificationId, channel, provider, status, response) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma.notificationLog.create({
                data: {
                    notificationId,
                    channel,
                    provider,
                    status,
                    response: response || {},
                    providerMessageId: (response === null || response === void 0 ? void 0 : response.messageId) || (response === null || response === void 0 ? void 0 : response.MessageId) || null
                }
            });
            yield prisma.notification.update({
                where: { id: notificationId },
                data: Object.assign(Object.assign(Object.assign({ deliveryStatus: status === 'SENT' ? 'DELIVERED' : 'FAILED' }, (channel === 'EMAIL' && { emailStatus: status })), (channel === 'SMS' && { smsStatus: status })), (channel === 'WHATSAPP' && { whatsappStatus: status }))
            });
        });
    }
}
exports.NotificationService = NotificationService;
