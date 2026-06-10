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
const prisma_1 = __importDefault(require("./prisma"));
function promoteAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        const email = process.argv[2];
        if (!email) {
            console.error('Please provide an email address. Usage: npx ts-node src/promoteAdmin.ts user@example.com');
            process.exit(1);
        }
        try {
            const user = yield prisma_1.default.user.update({
                where: { email },
                data: { role: 'ADMIN' },
            });
            console.log(`✅ Success! User ${user.email} is now an ADMIN.`);
        }
        catch (error) {
            console.error(`❌ Failed to promote user. Ensure the email "${email}" exists in the database.`);
            console.error(error);
        }
    });
}
promoteAdmin();
