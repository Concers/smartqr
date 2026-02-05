declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name?: string | null;
            };
            validated?: any;
        }
    }
}
export {};
//# sourceMappingURL=express.d.ts.map