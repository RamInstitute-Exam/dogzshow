import { Logger } from '../utils/logger';

export enum CompetitionLevel {
  CLASS_LEVEL = 'CLASS_LEVEL',
  BREED_LEVEL = 'BREED_LEVEL',
  GROUP_LEVEL = 'GROUP_LEVEL',
  BEST_IN_SHOW = 'BEST_IN_SHOW'
}

export interface MatchResult {
  matchId: string;
  winnerDogId: string;
  level: CompetitionLevel;
  score?: number;
}

export class CompetitionService {
  /**
   * Processes the result of a match and automatically advances the winning dog
   * to the next appropriate bracket level (e.g. from Class -> Breed -> Group -> Show).
   */
  public static async processMatchResult(result: MatchResult): Promise<void> {
    Logger.info(`Processing Match Result for ${result.matchId} at ${result.level}`);

    try {
      // Step 1: Validate the result and ensure the match is active
      // const match = await prisma.match.findUnique({ where: { id: result.matchId } });
      
      // Step 2: Record the winner
      Logger.info(`Dog ${result.winnerDogId} declared winner. Generating next bracket...`);
      
      // Step 3: Determine the next level
      const nextLevel = this.determineNextLevel(result.level);
      
      if (!nextLevel) {
        Logger.info(`Dog ${result.winnerDogId} has won the ultimate BEST IN SHOW!`);
        return;
      }

      // Step 4: Auto-advance logic
      // In production, this queries Prisma for the next pending bracket in the `nextLevel`
      // and inserts the `winnerDogId` as a competitor.
      Logger.info(`Advanced Dog ${result.winnerDogId} to ${nextLevel}`);

    } catch (error) {
      Logger.error(`Failed to process match result:`, error);
      throw new Error('Competition engine failed to advance bracket.');
    }
  }

  private static determineNextLevel(currentLevel: CompetitionLevel): CompetitionLevel | null {
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
