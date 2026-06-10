"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const dog_routes_1 = __importDefault(require("./routes/dog.routes"));
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const breeder_routes_1 = __importDefault(require("./routes/breeder.routes"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
const adoption_routes_1 = __importDefault(require("./routes/adoption.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const moderation_routes_1 = __importDefault(require("./routes/moderation.routes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static('uploads'));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/dogs', dog_routes_1.default);
app.use('/api/contact', contact_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/breeders', breeder_routes_1.default);
app.use('/api/subscriptions', subscription_routes_1.default);
app.use('/api/adoptions', adoption_routes_1.default);
app.use('/api/messages', message_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/moderation', moderation_routes_1.default);
// Basic health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running!' });
});
exports.default = app;
