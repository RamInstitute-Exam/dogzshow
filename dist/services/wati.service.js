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
exports.sendWhatsAppMessage = void 0;
const WATI_ENDPOINT = process.env.WATI_ENDPOINT || 'https://mock-wati.com';
const WATI_TOKEN = process.env.WATI_TOKEN || 'mock-token';
const sendWhatsAppMessage = (phone, templateName, parameters) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[WATI] Sending WhatsApp template '${templateName}' to ${phone} with params`, parameters);
    // Mock WhatsApp behavior
    return { success: true, messageId: 'mock-wa-id' };
});
exports.sendWhatsAppMessage = sendWhatsAppMessage;
