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
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('1. Connecting...');
        yield prisma_1.default.$connect();
        console.log('2. Connected! Running simple query SELECT 1...');
        const res = yield prisma_1.default.$queryRaw `SELECT 1`;
        console.log('3. Simple query response:', res);
        console.log('4. Fetching dashboardMetric...');
        const stats = yield prisma_1.default.dashboardMetric.findMany();
        console.log('5. Dashboard metrics:', stats);
        console.log('6. Done!');
        yield prisma_1.default.$disconnect();
    });
}
test().catch(err => {
    console.error('Test failed:', err);
});
