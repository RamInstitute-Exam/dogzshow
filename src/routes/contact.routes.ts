import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('Error handling contact form submission:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

export default router;
