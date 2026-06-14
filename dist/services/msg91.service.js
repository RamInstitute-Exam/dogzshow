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
exports.sendSMS = void 0;
const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || 'mock-key';
const sendSMS = (phone, message) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[MSG91] Sending SMS to ${phone}: ${message}`);
    // Mock SMS behavior
    return { success: true, messageId: 'mock-msg-id' };
});
exports.sendSMS = sendSMS;
