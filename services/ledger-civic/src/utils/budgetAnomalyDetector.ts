import { ExpenditureEntry, BudgetAnomaly } from '@nexus-civic/db';
import { logger } from './logger';

export const BUDGET_ALLOCATIONS: Record<string, Record<string, number>> = {
  'Police': {
    'Equipment': 50000,
    'Training': 20000,
    'Operations': 100000,
  },
  'Fire': {
    'Equipment': 60000,
    'Training': 15000,
    'Operations': 80000,
  },
  'Health': {
    'Supplies': 100000,
    'Facilities': 150000,
    'Outreach': 30000,
  },
  'Education': {
    'Supplies': 80000,
    'Facilities': 200000,
    'Programs': 50000,
  },
  'Public Works': {
    'Maintenance': 150000,
    'Infrastructure': 300000,
    'Equipment': 50000,
  },
  'Transportation': {
    'Maintenance': 120000,
    'Infrastructure': 250000,
    'Operations': 100000,
  },
  'Parks & Recreation': {
    'Maintenance': 40000,
    'Facilities': 60000,
    'Programs': 25000,
  },
  'Housing': {
    'Development': 200000,
    'Subsidies': 150000,
    'Administration': 50000,
  }
};

export async function detectAnomalies() {
  logger.info('Running budget anomaly detection...');
  const currentMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM'

  try {
    for (const [department, categories] of Object.entries(BUDGET_ALLOCATIONS)) {
      for (const [category, expectedAllocation] of Object.entries(categories)) {
        
        // Aggregate expenditures for this department + category for the current month
        const startDate = new Date(`${currentMonth}-01T00:00:00Z`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const result = await ExpenditureEntry.aggregate([
          {
            $match: {
              department,
              category,
              createdAt: { $gte: startDate, $lt: endDate }
            }
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: '$amount' }
            }
          }
        ]);

        const actualTotal = result.length > 0 ? result[0].totalAmount : 0;
        
        if (actualTotal > expectedAllocation * 1.1) { // > 110%
          const variancePercentage = ((actualTotal - expectedAllocation) / expectedAllocation) * 100;
          
          // Check if anomaly is already logged for this month/dept/category
          const existing = await BudgetAnomaly.findOne({
            department,
            category,
            month: currentMonth,
          });

          if (!existing) {
            await BudgetAnomaly.create({
              department,
              category,
              expectedAllocation,
              actualTotal,
              variancePercentage,
              month: currentMonth,
              status: 'FLAGGED'
            });
            logger.warn(`Anomaly logged for ${department} - ${category}. Actual: ${actualTotal}, Expected: ${expectedAllocation}`);
          } else {
            // Update actualTotal and variance if it has grown
            if (actualTotal > existing.actualTotal) {
                existing.actualTotal = actualTotal;
                existing.variancePercentage = variancePercentage;
                await existing.save();
            }
          }
        }
      }
    }
    logger.info('Budget anomaly detection completed.');
  } catch (error) {
    logger.error('Error during budget anomaly detection:', error);
  }
}
