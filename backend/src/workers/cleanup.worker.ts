import { prisma } from '../index';

/**
 * Cleanup Worker
 * Runs every 24 hours to delete ActivityLogs older than 30 days.
 */
export const startCleanupWorker = () => {
    console.log('Cleanup worker started: log retention policy (30 days) active.');
    
    // Run immediately on start
    runCleanup();

    // Set interval for every 24 hours
    setInterval(runCleanup, 24 * 60 * 60 * 1000);
};

const runCleanup = async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await prisma.activityLog.deleteMany({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo
                }
            }
        });

        if (result.count > 0) {
            console.log(`[Cleanup] Deleted ${result.count} old activity logs.`);
        }
    } catch (error) {
        console.error('[Cleanup Error]', error);
    }
};
