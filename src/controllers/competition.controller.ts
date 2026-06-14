import { Request, Response } from 'express';
import prisma from '../prisma';

export const getMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const matches = await prisma.competitionMatch.findMany({
      include: {
        dog: { include: { breed: true, owner: true } },
        round: { include: { event: true } },
        winners: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: matches });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch matches' });
  }
};

export const scoreMatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matchId, score, notes, isWinner, awardTitle } = req.body;
    
    // Update match score
    const match = await prisma.competitionMatch.update({
      where: { id: matchId },
      data: { score, notes, status: isWinner ? 'ADVANCED' : 'ELIMINATED' },
      include: { dog: true, round: { include: { event: true } } }
    });

    // If marked as winner, create Winner and WinnerTag
    if (isWinner && awardTitle) {
      const winner = await prisma.winner.create({
        data: {
          matchId,
          awardTitle,
          eventName: match.round.event.name,
          eventDate: match.round.event.startDate
        }
      });

      // Auto-tag the dog profile with Champion status if applicable
      if (awardTitle.toLowerCase().includes('champion')) {
        await prisma.dog.update({
          where: { id: match.dogId },
          data: { isChampion: true }
        });
      }

      await prisma.winnerTag.create({
        data: {
          winnerId: winner.id,
          dogId: match.dogId,
          award: awardTitle,
          eventName: match.round.event.name,
          eventDate: match.round.event.startDate
        }
      });
    }

    res.status(200).json({ success: true, data: match });
  } catch (error) {
    console.error('Error scoring match:', error);
    res.status(500).json({ success: false, error: 'Failed to score match' });
  }
};
