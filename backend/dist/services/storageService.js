"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.LocalStorageProvider = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const app_1 = require("@/config/app");
class LocalStorageProvider {
    async savePng(params) {
        const { key, buffer } = params;
        const uploadsRoot = path_1.default.resolve(app_1.config.upload.uploadPath);
        const absPath = path_1.default.join(uploadsRoot, key);
        await promises_1.default.mkdir(path_1.default.dirname(absPath), { recursive: true });
        await promises_1.default.writeFile(absPath, buffer);
        const baseUrl = app_1.config.app.url.replace(/\/$/, '');
        const publicUrl = `${baseUrl}/uploads/${key}`;
        return { key, publicUrl };
    }
}
exports.LocalStorageProvider = LocalStorageProvider;
exports.storage = new LocalStorageProvider();
//# sourceMappingURL=storageService.js.map