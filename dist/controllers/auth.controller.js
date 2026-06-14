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
exports.socialLogin = exports.refreshToken = exports.login = exports.register = exports.verifyOtp = exports.sendOtp = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_REFRESH_SECRET || 'refresh_secret', { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
// ----------------------------------------------------------------------
// OTP FLOW
// ----------------------------------------------------------------------
const sendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone } = req.body;
        if (!phone) {
            res.status(400).json({ error: 'Mobile number is required' });
            return;
        }
        // Check if user already exists
        const existingUser = yield prisma_1.default.user.findFirst({ where: { phone } });
        if (existingUser) {
            res.status(400).json({ error: 'Phone number already registered' });
            return;
        }
        let otp = '';
        let message = '';
        if (process.env.OTP_MODE === 'development') {
            otp = process.env.DUMMY_OTP || '123456';
            message = `Development Mode: Your OTP is ${otp}`;
        }
        else {
            // Production SMS Gateway logic would go here
            otp = Math.floor(100000 + Math.random() * 900000).toString();
            message = 'OTP sent successfully';
            // sendSMS(phone, otp);
        }
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
        yield prisma_1.default.otpVerification.upsert({
            where: { phone },
            update: { otpCode: otp, otpExpiry, otpAttempts: 0, isVerified: false },
            create: { phone, otpCode: otp, otpExpiry }
        });
        res.status(200).json({ success: true, message });
    }
    catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.sendOtp = sendOtp;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) {
            res.status(400).json({ error: 'Phone and OTP are required' });
            return;
        }
        const record = yield prisma_1.default.otpVerification.findUnique({ where: { phone } });
        if (!record) {
            res.status(404).json({ error: 'No OTP requested for this number' });
            return;
        }
        if (record.otpAttempts >= 5) {
            res.status(429).json({ error: 'Too many failed attempts. Request a new OTP.' });
            return;
        }
        if (new Date() > record.otpExpiry) {
            res.status(400).json({ error: 'OTP has expired' });
            return;
        }
        if (record.otpCode !== otp) {
            yield prisma_1.default.otpVerification.update({
                where: { phone },
                data: { otpAttempts: record.otpAttempts + 1 }
            });
            res.status(400).json({ error: 'Invalid OTP' });
            return;
        }
        yield prisma_1.default.otpVerification.update({
            where: { phone },
            data: { isVerified: true, otpAttempts: 0 }
        });
        res.status(200).json({ success: true, message: 'OTP Verified successfully' });
    }
    catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.verifyOtp = verifyOtp;
// ----------------------------------------------------------------------
// REGISTRATION
// ----------------------------------------------------------------------
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, title, firstName, lastName, phone, altPhone, dob, gender, doorNo, buildingName, street, landmark, address1, address2, city, state, country, pincode, occupation, organization, website, kciMembershipNo, breederLicenseNo, kennelClubName, experienceInDogShows, prefSms, prefEmail, prefWhatsapp, termsAccepted, privacyAccepted } = req.body;
        // 1. Verify OTP Status First
        const otpRecord = yield prisma_1.default.otpVerification.findUnique({ where: { phone } });
        if (!otpRecord || !otpRecord.isVerified) {
            res.status(403).json({ error: 'Mobile number must be verified via OTP before registration' });
            return;
        }
        const existingUser = yield prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Find or create User role
        let userRole = yield prisma_1.default.role.findUnique({ where: { name: 'User' } });
        if (!userRole) {
            userRole = yield prisma_1.default.role.create({ data: { name: 'User', description: 'Standard user' } });
        }
        const user = yield prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                title, firstName, lastName, phone, altPhone, dob: dob ? new Date(dob) : null, gender,
                doorNo, buildingName, street, landmark, address1, address2, city, state, country, pincode,
                occupation, organization, website,
                kciMembershipNo, breederLicenseNo, kennelClubName, experienceInDogShows,
                prefSms, prefEmail, prefWhatsapp, termsAccepted, privacyAccepted,
                mobileVerified: true,
                provider: 'local',
                roles: {
                    create: {
                        roleId: userRole.id
                    }
                }
            }
        });
        const tokens = generateTokens(user.id);
        res.status(201).json({ message: 'User registered successfully', tokens, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield prisma_1.default.user.findUnique({
            where: { email },
            include: { roles: { include: { role: true } } }
        });
        if (!user || !user.password) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({ error: 'Account disabled' });
            return;
        }
        const tokens = generateTokens(user.id);
        res.status(200).json({
            message: 'Login successful',
            tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles.map(ur => ur.role.name)
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ error: 'Refresh token required' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
        const tokens = generateTokens(decoded.userId);
        res.status(200).json({ tokens });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});
exports.refreshToken = refreshToken;
const socialLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { provider, providerId, email, firstName, lastName } = req.body;
        if (!provider || !providerId || !email) {
            res.status(400).json({ error: 'Missing social login details' });
            return;
        }
        let user = yield prisma_1.default.user.findUnique({
            where: { email },
            include: { roles: { include: { role: true } } }
        });
        if (!user) {
            let userRole = yield prisma_1.default.role.findUnique({ where: { name: 'User' } });
            if (!userRole) {
                userRole = yield prisma_1.default.role.create({ data: { name: 'User' } });
            }
            user = yield prisma_1.default.user.create({
                data: {
                    email,
                    password: '', // No password for social
                    firstName,
                    lastName,
                    provider,
                    providerId,
                    roles: {
                        create: { roleId: userRole.id }
                    }
                },
                include: { roles: { include: { role: true } } }
            });
        }
        const tokens = generateTokens(user.id);
        res.status(200).json({
            message: 'Login successful',
            tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles.map(ur => ur.role.name)
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.socialLogin = socialLogin;
