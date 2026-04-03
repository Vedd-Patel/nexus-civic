import { Request, Response } from 'express';
import { BudgetAnomaly, ExpenditureEntry } from '@nexus-civic/db';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { BUDGET_ALLOCATIONS } from '../utils/budgetAnomalyDetector';
import { createGeminiClient } from '@nexus-civic/gemini-client';

const AskQuestionSchema = z.object({
  question: z.string()
});

export const getSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const startDate = new Date(`${currentMonth}-01T00:00:00Z`);
    
    const result = await ExpenditureEntry.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$department',
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    const actualSpending = result.reduce((acc: any, curr: any) => {
      acc[curr._id] = curr.totalSpent;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        allocations: BUDGET_ALLOCATIONS,
        actualSpending
      }
    });
  } catch (error: any) {
    logger.error('Error fetching budget summary', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error', code: 500 });
  }
};

export const getAnomalies = async (req: Request, res: Response): Promise<void> => {
  try {
    const anomalies = await BudgetAnomaly.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({
      success: true,
      data: anomalies
    });
  } catch (error: any) {
    logger.error('Error fetching budget anomalies', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error', code: 500 });
  }
};

export const askQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = AskQuestionSchema.parse(req.body);
    
    // Build context
    const currentMonth = new Date().toISOString().substring(0, 7);
    const anomalies = await BudgetAnomaly.find({ month: currentMonth }).limit(10);
    const info = `Allocations: ${JSON.stringify(BUDGET_ALLOCATIONS)}. Recent Anomalies: ${JSON.stringify(anomalies)}`;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ success: false, error: 'AI features are disabled', code: 500 });
      return;
    }

    const gemini = createGeminiClient(apiKey);
    const answer = await gemini.answerQuestion(validated.question, info);

    res.status(200).json({
      success: true,
      data: answer
    });
  } catch (error: any) {
    logger.error('Error asking budget question', { error: error.message });
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation failed', code: 400, details: error.errors });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error', code: 500 });
    }
  }
};
