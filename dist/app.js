"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const ocr_routes_1 = __importDefault(require("./routes/ocr.routes"));
const dog_routes_1 = __importDefault(require("./routes/dog.routes"));
const breed_routes_1 = __importDefault(require("./routes/breed.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const registration_routes_1 = __importDefault(require("./routes/registration.routes"));
const winner_routes_1 = __importDefault(require("./routes/winner.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const gallery_routes_1 = __importDefault(require("./routes/gallery.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const cms_routes_1 = __importDefault(require("./routes/cms.routes"));
const fci_routes_1 = __importDefault(require("./routes/fci.routes"));
const pageBanner_routes_1 = __importDefault(require("./routes/pageBanner.routes"));
const homepageBanner_routes_1 = __importDefault(require("./routes/homepageBanner.routes"));
const ageClass_routes_1 = __importDefault(require("./routes/ageClass.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const role_routes_1 = __importDefault(require("./routes/role.routes"));
const club_routes_1 = __importDefault(require("./routes/club.routes"));
const judge_routes_1 = __importDefault(require("./routes/judge.routes"));
const competition_routes_1 = __importDefault(require("./routes/competition.routes"));
const report_routes_1 = __importDefault(require("./routes/report.routes"));
const app = (0, express_1.default)();
// Security and Rate Limiting
app.use((0, helmet_1.default)());
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);
// Middleware
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://juztdog.web.app",
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/uploads', express_1.default.static('uploads'));
// Routes
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/ocr', ocr_routes_1.default);
app.use('/api/v1/dogs', dog_routes_1.default);
app.use('/api/v1/breeds', breed_routes_1.default);
app.use('/api/v1/events', event_routes_1.default);
app.use('/api/v1/registrations', registration_routes_1.default);
app.use('/api/v1/winners', winner_routes_1.default);
app.use('/api/v1/dashboard', dashboard_routes_1.default);
app.use('/api/v1/gallery', gallery_routes_1.default);
app.use('/api/v1/payments', payment_routes_1.default);
app.use('/api/v1/cms', cms_routes_1.default);
app.use('/api/v1/groups', fci_routes_1.default);
app.use('/api/v1/page-banners', pageBanner_routes_1.default);
app.use('/api/v1/homepage/banners', homepageBanner_routes_1.default);
app.use('/api/v1/age-classes', ageClass_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/roles', role_routes_1.default);
app.use('/api/v1/clubs', club_routes_1.default);
app.use('/api/v1/judges', judge_routes_1.default);
app.use('/api/v1/competitions', competition_routes_1.default);
app.use('/api/v1/reports', report_routes_1.default);
// Basic health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Juzdog Backend is running!' });
});
exports.default = app;
