import { jest, expect, it, describe, beforeEach } from '@jest/globals';

// Mock DB must be defined before the dynamic import
const mockDb = {
    select: jest.fn<any>().mockReturnThis(),
    from: jest.fn<any>().mockReturnThis(),
    groupBy: jest.fn<any>(),
};

// Use unstable_mockModule for ESM mocking
jest.unstable_mockModule('../lib/db/index.js', () => ({
    db: mockDb,
}));

// Dynamically import the controller after mocking the module
const { analyticsController } = await import('../lib/controllers/analytics.controller.js');
import { Request, Response } from 'express';

describe('Analytics Controller - Stats Overview', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let json: jest.Mock<any>;

    beforeEach(() => {
        json = jest.fn();
        req = {};
        res = {
            json: json as any,
            status: jest.fn<any>().mockReturnThis() as any,
        };
        jest.clearAllMocks();
    });

    it('should return ticket counts grouped by status and priority', async () => {
        const mockData = [
            { status: 'OPEN', priority: 'HIGH', count: 5 },
            { status: 'CLOSED', priority: 'LOW', count: 10 },
        ];

        mockDb.groupBy.mockResolvedValueOnce(mockData);

        await analyticsController.getStatsOverview(req as Request, res as Response);

        expect(res.json).toHaveBeenCalledWith(mockData);
        expect(mockDb.select).toHaveBeenCalled();
    });

    it('should return 500 if database call fails', async () => {
        mockDb.groupBy.mockRejectedValueOnce(new Error('DB Error'));

        await analyticsController.getStatsOverview(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Failed to get stats overview' });
    });
});
