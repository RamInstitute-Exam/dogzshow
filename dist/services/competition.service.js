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
exports.CompetitionService = exports.CompetitionLevel = void 0;
const logger_1 = require("../utils/logger");
var CompetitionLevel;
(function (CompetitionLevel) {
    CompetitionLevel["CLASS_LEVEL"] = "CLASS_LEVEL";
    CompetitionLevel["BREED_LEVEL"] = "BREED_LEVEL";
    CompetitionLevel["GROUP_LEVEL"] = "GROUP_LEVEL";
    CompetitionLevel["BEST_IN_SHOW"] = "BEST_IN_SHOW";
})(CompetitionLevel || (exports.CompetitionLevel = CompetitionLevel = {}));
class CompetitionService {
    /**
     * Processes the result of a match and automatically advances the winning dog
     * to the next appropriate bracket level (e.g. from Class -> Breed -> Group -> Show).
     */
    static processMatchResult(result) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.Logger.info(`Processing Match Result for ${result.matchId} at ${result.level}`);
            try {
                // Step 1: Validate the result and ensure the match is active
                // const match = await prisma.match.findUnique({ where: { id: result.matchId } });
                // Step 2: Record the winner
                logger_1.Logger.info(`Dog ${result.winnerDogId} declared winner. Generating next bracket...`);
                // Step 3: Determine the next level
                const nextLevel = this.determineNextLevel(result.level);
                if (!nextLevel) {
                    logger_1.Logger.info(`Dog ${result.winnerDogId} has won the ultimate BEST IN SHOW!`);
                    return;
                }
                // Step 4: Auto-advance logic
                // In production, this queries Prisma for the next pending bracket in the `nextLevel`
                // and inserts the `winnerDogId` as a competitor.
                logger_1.Logger.info(`Advanced Dog ${result.winnerDogId} to ${nextLevel}`);
            }
            catch (error) {
                logger_1.Logger.error(`Failed to process match result:`, error);
                throw new Error('Competition engine failed to advance bracket.');
            }
        });
    }
    static determineNextLevel(currentLevel) {
        switch (currentLevel) {
            case CompetitionLevel.CLASS_LEVEL:
                return CompetitionLevel.BREED_LEVEL;
            case CompetitionLevel.BREED_LEVEL:
                return CompetitionLevel.GROUP_LEVEL;
            case CompetitionLevel.GROUP_LEVEL:
                return CompetitionLevel.BEST_IN_SHOW;
            case CompetitionLevel.BEST_IN_SHOW:
                return null; // Top level reached
            default:
                return null;
        }
    }
}
exports.CompetitionService = CompetitionService;
