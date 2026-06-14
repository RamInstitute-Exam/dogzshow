import axios from 'axios';

const WATI_ENDPOINT = process.env.WATI_ENDPOINT || 'https://mock-wati.com';
const WATI_TOKEN = process.env.WATI_TOKEN || 'mock-token';

export const sendWhatsAppMessage = async (phone: string, templateName: string, parameters: any[]) => {
  console.log(`[WATI] Sending WhatsApp template '${templateName}' to ${phone} with params`, parameters);
  // Mock WhatsApp behavior
  return { success: true, messageId: 'mock-wa-id' };
};
