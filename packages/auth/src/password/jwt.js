"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = (id, role) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const ACCESS_TTL = process.env.JWT_ACCESS_TTL;
    if (!JWT_SECRET)
        throw new Error("JWT_SECRET is not defined");
    if (!ACCESS_TTL)
        throw new Error("JWT_ACCESS_TTL is not defined");
    return jsonwebtoken_1.default.sign({ id, role }, JWT_SECRET, {
        expiresIn: ACCESS_TTL,
    });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (id, role) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    const REFRESH_TTL = process.env.JWT_REFRESH_TTL;
    if (!JWT_SECRET)
        throw new Error("JWT_SECRET is not defined");
    if (!REFRESH_TTL)
        throw new Error("JWT_REFRESH_TTL is not defined");
    return jsonwebtoken_1.default.sign({ id, role }, JWT_SECRET, {
        expiresIn: REFRESH_TTL,
    });
};
exports.generateRefreshToken = generateRefreshToken;
