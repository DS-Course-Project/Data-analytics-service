import { Request, Response, NextFunction } from "express";

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: "ADMIN" | "USER";
            };
        }
    }
}

export const extractUser = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers["x-user-id"] as string;
    const userRole = req.headers["x-user-role"] as "ADMIN" | "USER";

    if (userId) {
        req.user = {
            id: userId,
            role: userRole || "USER", // Default to USER if no role specified
        };
    }
    next();
};

export const requireRole = (role: "ADMIN" | "USER") => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized: Missing user headers" });
            return;
        }

        if (req.user.role !== role) {
            res.status(403).json({ error: "Forbidden: Insufficient permissions" });
            return;
        }

        next();
    };
};
