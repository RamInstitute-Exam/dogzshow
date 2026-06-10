import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import dogRoutes from './routes/dog.routes';
import contactRoutes from './routes/contact.routes';
import adminRoutes from './routes/admin.routes';
import breederRoutes from './routes/breeder.routes';
import subscriptionRoutes from './routes/subscription.routes';
import adoptionRoutes from './routes/adoption.routes';
import messageRoutes from './routes/message.routes';
import appointmentRoutes from './routes/appointment.routes';
import moderationRoutes from './routes/moderation.routes';

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dogs', dogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/breeders', breederRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/moderation', moderationRoutes);

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running!' });
});

export default app;
