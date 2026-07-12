"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = createContext;
const prisma_1 = require("../lib/prisma");
function createContext({ req, res }) {
    return {
        req,
        res,
        prisma: prisma_1.prisma,
        user: null,
    };
}
