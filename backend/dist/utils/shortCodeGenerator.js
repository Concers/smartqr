"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortCodeGenerator = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("@/config/database"));
class ShortCodeGenerator {
    static async generate(customCode) {
        if (customCode) {
            const exists = await database_1.default.qrCode.findUnique({
                where: { shortCode: customCode },
            });
            if (exists) {
                throw new Error('Custom code already exists');
            }
            if (!this.isValidCode(customCode)) {
                throw new Error('Invalid custom code format');
            }
            return customCode;
        }
        for (let attempt = 0; attempt < this.ATTEMPTS; attempt++) {
            const code = this.generateRandom();
            const exists = await database_1.default.qrCode.findUnique({
                where: { shortCode: code },
            });
            if (!exists) {
                return code;
            }
        }
        throw new Error('Failed to generate unique short code');
    }
    static generateRandom() {
        let result = '';
        for (let i = 0; i < this.LENGTH; i++) {
            result += this.ALPHABET.charAt(crypto_1.default.randomInt(0, this.ALPHABET.length));
        }
        return result;
    }
    static isValidCode(code) {
        if (!code || code.length < 3 || code.length > 20) {
            return false;
        }
        const validPattern = /^[a-zA-Z0-9-]+$/;
        return validPattern.test(code);
    }
    static async isAvailable(code) {
        const exists = await database_1.default.qrCode.findUnique({
            where: { shortCode: code },
        });
        return !exists;
    }
}
exports.ShortCodeGenerator = ShortCodeGenerator;
ShortCodeGenerator.LENGTH = 6;
ShortCodeGenerator.ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
ShortCodeGenerator.ATTEMPTS = 10;
//# sourceMappingURL=shortCodeGenerator.js.map