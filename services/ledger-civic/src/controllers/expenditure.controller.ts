import { Request, Response } from 'express';
import { ExpenditureEntry } from '@nexus-civic/db';
import { z } from 'zod';
import { logger } from '../utils/logger';
import { postExpenditureOnChain, getExplorerUrl } from '../utils/solana';

const PagedQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  department: z.string().optional(),
});

const CreateExpenditureSchema = z.object({
  department: z.string(),
  category: z.string(),
  amount: z.number().positive(),
  description: z.string(),
});

export const createExpenditure = async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = CreateExpenditureSchema.parse(req.body);
    const officerId = req.user?.id;

    if (!officerId) {
      res.status(401).json({ success: false, error: 'Unauthorized', code: 401 });
      return;
    }

    // Prepare metadata for chain
    const entryId = Math.random().toString(36).substring(2, 12);
    const metadata = {
        department: validated.department,
        category: validated.category,
        amount: validated.amount,
        desc: validated.description
    };

    // Post to Solana
    const signature = await postExpenditureOnChain(entryId, metadata);
    const explorerUrl = getExplorerUrl(signature);
    const isMockSignature = signature.startsWith('mock_');

    const entry = await ExpenditureEntry.create({
      officerId,
      department: validated.department,
      category: validated.category,
      amount: validated.amount,
      description: validated.description,
      solanaSignature: signature,
      explorerUrl,
      isMockSignature
    });

    res.status(201).json({
      success: true,
      message: 'Expenditure created and logged on-chain successfully',
      data: entry
    });
  } catch (error: any) {
    logger.error('Error creating expenditure', { error: error.message });
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: 'Validation failed', code: 400, details: error.errors });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error', code: 500 });
    }
  }
};

export const listExpenditures = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = PagedQuerySchema.parse(req.query);
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const filter: any = {};
    if (query.department) {
      filter.department = query.department;
    }

    const total = await ExpenditureEntry.countDocuments(filter);
    const entries = await ExpenditureEntry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Expenditures fetched successfully',
      data: entries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    logger.error('Error listing expenditures', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error', code: 500 });
  }
};

export const getExpenditure = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const entry = await ExpenditureEntry.findById(id);

    if (!entry) {
      res.status(404).json({ success: false, error: 'Expenditure not found', code: 404 });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Expenditure fetched successfully',
      data: entry
    });
  } catch (error: any) {
    logger.error('Error fetching expenditure', { error: error.message });
    res.status(500).json({ success: false, error: 'Internal server error', code: 500 });
  }
};
