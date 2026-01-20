"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var client_1 = require("@prisma/client");
var router = (0, express_1.Router)();
var prisma = new client_1.PrismaClient();
// Get user's cash wallet
router.get('/wallet', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, cashWallet, userProfile, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                userId = req.user.id;
                return [4 /*yield*/, prisma.cashWallet.findUnique({
                        where: { userId: userId },
                    })
                    // Create wallet if doesn't exist
                ];
            case 1:
                cashWallet = _a.sent();
                if (!!cashWallet) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { userId: userId },
                        select: { country: true, currency: true },
                    })];
            case 2:
                userProfile = _a.sent();
                return [4 /*yield*/, prisma.cashWallet.create({
                        data: {
                            userId: userId,
                            currency: (userProfile === null || userProfile === void 0 ? void 0 : userProfile.currency) || 'USD',
                        },
                    })];
            case 3:
                cashWallet = _a.sent();
                _a.label = 4;
            case 4:
                res.json({
                    balance: cashWallet.balance,
                    totalReceived: cashWallet.totalReceived,
                    totalWithdrawn: cashWallet.totalWithdrawn,
                    currency: cashWallet.currency,
                    exchangeRate: cashWallet.exchangeRate,
                });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error('Error fetching cash wallet:', error_1);
                res.status(500).json({ error: 'Failed to fetch cash wallet' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Get cash transaction history
router.get('/transactions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, _b, page, _c, limit, type, skip, whereClause, transactions, total, error_2;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                userId = req.user.id;
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 20 : _c, type = _a.type;
                skip = (Number(page) - 1) * Number(limit);
                whereClause = {
                    userId: userId,
                    type: type
                        ? { in: ['CASH_RECEIVE', 'CASH_WITHDRAW'] }
                        : { in: ['CASH_RECEIVE', 'CASH_WITHDRAW'] },
                };
                if (type) {
                    whereClause.type = type;
                }
                return [4 /*yield*/, prisma.transaction.findMany({
                        where: whereClause,
                        orderBy: { createdAt: 'desc' },
                        skip: skip,
                        take: Number(limit),
                    })];
            case 1:
                transactions = _d.sent();
                return [4 /*yield*/, prisma.transaction.count({
                        where: whereClause,
                    })];
            case 2:
                total = _d.sent();
                res.json({
                    transactions: transactions,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: total,
                        pages: Math.ceil(total / Number(limit)),
                    },
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _d.sent();
                console.error('Error fetching cash transactions:', error_2);
                res.status(500).json({ error: 'Failed to fetch transactions' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Process withdrawal
router.post('/withdraw', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId_1, _a, amount, paypalEmail_1, _b, currency_1, amountCents_1, result, error_3;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                userId_1 = req.user.id;
                _a = req.body, amount = _a.amount, paypalEmail_1 = _a.paypalEmail, _b = _a.currency, currency_1 = _b === void 0 ? 'USD' : _b;
                amountCents_1 = parseInt(amount);
                if (amountCents_1 < 1000) {
                    // $10 minimum
                    return [2 /*return*/, res
                            .status(400)
                            .json({ error: 'Minimum withdrawal amount is $10.00' })];
                }
                return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var cashWallet, updatedWallet, withdrawal, transaction;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.cashWallet.findUnique({
                                        where: { userId: userId_1 },
                                    })];
                                case 1:
                                    cashWallet = _a.sent();
                                    if (!cashWallet || cashWallet.balance < amountCents_1) {
                                        throw new Error('Insufficient balance');
                                    }
                                    return [4 /*yield*/, tx.cashWallet.update({
                                            where: { userId: userId_1 },
                                            data: {
                                                balance: { decrement: amountCents_1 },
                                                totalWithdrawn: { increment: amountCents_1 },
                                            },
                                        })
                                        // Create withdrawal record
                                    ];
                                case 2:
                                    updatedWallet = _a.sent();
                                    return [4 /*yield*/, tx.withdrawal.create({
                                            data: {
                                                userId: userId_1,
                                                amount: amountCents_1,
                                                method: 'PayPal',
                                                status: 'PENDING',
                                                paypalEmail: paypalEmail_1,
                                            },
                                        })
                                        // Record transaction
                                    ];
                                case 3:
                                    withdrawal = _a.sent();
                                    return [4 /*yield*/, tx.transaction.create({
                                            data: {
                                                userId: userId_1,
                                                type: 'CASH_WITHDRAW',
                                                amount: amountCents_1.toString(),
                                                currency: currency_1,
                                                description: "Withdrawal to PayPal: ".concat(paypalEmail_1),
                                                referenceId: withdrawal.id,
                                                balanceSnapshot: {
                                                    cashBalance: updatedWallet.balance.toString(),
                                                },
                                                metadata: { paypalEmail: paypalEmail_1, withdrawalId: withdrawal.id },
                                            },
                                        })];
                                case 4:
                                    transaction = _a.sent();
                                    return [2 /*return*/, { withdrawal: withdrawal, transaction: transaction, updatedWallet: updatedWallet }];
                            }
                        });
                    }); })];
            case 1:
                result = _c.sent();
                res.json({
                    success: true,
                    withdrawal: result.withdrawal,
                    newBalance: result.updatedWallet.balance,
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _c.sent();
                console.error('Error processing withdrawal:', error_3);
                if (error_3 instanceof Error && error_3.message === 'Insufficient balance') {
                    res.status(400).json({ error: 'Insufficient balance for withdrawal' });
                }
                else {
                    res.status(500).json({ error: 'Failed to process withdrawal' });
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
