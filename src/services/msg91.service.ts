import axios from 'axios';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || 'mock-key';

export const sendSMS = async (phone: string, message: string) => {
  console.log(`[MSG91] Sending SMS to ${phone}: ${message}`);
  // Mock SMS behavior
  return { success: true, messageId: 'mock-msg-id' };
};
