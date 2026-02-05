"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("@/config/database"));
const app_1 = require("@/config/app");
const auth_1 = require("@/middleware/auth");
class AuthController {
    static async register(req, res) {
        try {
            const { email, password, name } = req.validated || req.body;
            const existingUser = await database_1.default.user.findUnique({ where: { email } });
            if (existingUser) {
                res.status(400).json({ success: false, error: 'User already exists' });
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, app_1.config.security.bcryptRounds);
            const user = await database_1.default.user.create({
                data: { email, password: hashedPassword, name },
                select: { id: true, email: true, name: true, createdAt: true },
            });
            const token = (0, auth_1.generateToken)(user.id);
            res.status(201).json({ success: true, data: { user, token } });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Registration failed' });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.validated || req.body;
            const user = await database_1.default.user.findUnique({ where: { email } });
            if (!user) {
                res.status(401).json({ success: false, error: 'Invalid credentials' });
                return;
            }
            const ok = await bcryptjs_1.default.compare(password, user.password);
            if (!ok) {
                res.status(401).json({ success: false, error: 'Invalid credentials' });
                return;
            }
            const token = (0, auth_1.generateToken)(user.id);
            res.json({
                success: true,
                data: { user: { id: user.id, email: user.email, name: user.name }, token },
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Login failed' });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map