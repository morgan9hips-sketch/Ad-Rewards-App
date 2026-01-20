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
// Get current exchange rate
router.get('/rate', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, currency, exchangeRate, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.query.currency, currency = _a === void 0 ? 'USD' : _a;
                return [4 /*yield*/, prisma.exchangeRate.findFirst({
                        where: {
                            toCurrency: currency,
                            isActive: true,
                        },
                        orderBy: { effectiveFrom: 'desc' },
                    })];
            case 1:
                exchangeRate = _b.sent();
                if (!exchangeRate) {
                    return [2 /*return*/, res.status(404).json({ error: 'Exchange rate not found' })];
                }
                res.json({
                    rate: exchangeRate.rate,
                    revenueShare: exchangeRate.revenueShare,
                    currency: exchangeRate.toCurrency,
                    effectiveFrom: exchangeRate.effectiveFrom,
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('Error fetching exchange rate:', error_1);
                res.status(500).json({ error: 'Failed to fetch exchange rate' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get user's pending conversion for current month
router.get('/pending', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, currentMonth, pendingConversion, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.user.id;
                currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
                ;
                return [4 /*yield*/, prisma.coinConversion.findFirst({
                        where: {
                            userId: userId,
                            month: currentMonth,
                            status: 'PENDING',
                        },
                        include: {
                            details: true,
                        },
                    })];
            case 1:
                pendingConversion = _a.sent();
                res.json(pendingConversion);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching pending conversion:', error_2);
                res.status(500).json({ error: 'Failed to fetch pending conversion' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get conversion history
router.get('/history', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, _b, page, _c, limit, skip, conversions, total, error_3;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                userId = req.user.id;
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 12 : _c;
                skip = (Number(page) - 1) * Number(limit);
                return [4 /*yield*/, prisma.coinConversion.findMany({
                        where: { userId: userId },
                        orderBy: { createdAt: 'desc' },
                        skip: skip,
                        take: Number(limit),
                        include: {
                            details: true,
                        },
                    })];
            case 1:
                conversions = _d.sent();
                return [4 /*yield*/, prisma.coinConversion.count({
                        where: { userId: userId },
                    })];
            case 2:
                total = _d.sent();
                res.json({
                    conversions: conversions,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total: total,
                        pages: Math.ceil(total / Number(limit)),
                    },
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _d.sent();
                console.error('Error fetching conversion history:', error_3);
                res.status(500).json({ error: 'Failed to fetch conversion history' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Preview conversion for current month
router.get('/preview', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, currentMonth, _a, currency, coinWallet, exchangeRate, coinBalance, rateDecimal, revenueShareDecimal, estimatedCashCents, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                userId = req.user.id;
                currentMonth = new Date().toISOString().slice(0, 7);
                _a = req.query.currency, currency = _a === void 0 ? 'USD' : _a;
                return [4 /*yield*/, prisma.coinWallet.findUnique({
                        where: { userId: userId },
                    })];
            case 1:
                coinWallet = _b.sent();
                if (!coinWallet || coinWallet.balance === BigInt(0)) {
                    return [2 /*return*/, res.json({
                            coinBalance: '0',
                            estimatedCash: 0,
                            currency: currency,
                            canConvert: false,
                        })];
                }
                return [4 /*yield*/, prisma.exchangeRate.findFirst({
                        where: {
                            toCurrency: currency,
                            isActive: true,
                        },
                        orderBy: { effectiveFrom: 'desc' },
                    })];
            case 2:
                exchangeRate = _b.sent();
                if (!exchangeRate) {
                    return [2 /*return*/, res.status(404).json({ error: 'Exchange rate not found' })];
                }
                coinBalance = coinWallet.balance;
                rateDecimal = parseFloat(exchangeRate.rate.toString());
                revenueShareDecimal = parseFloat(exchangeRate.revenueShare.toString());
                estimatedCashCents = Math.floor((Number(coinBalance) / rateDecimal) * revenueShareDecimal);
                res.json({
                    coinBalance: coinBalance.toString(),
                    estimatedCash: estimatedCashCents,
                    currency: currency,
                    rate: exchangeRate.rate,
                    revenueShare: exchangeRate.revenueShare,
                    canConvert: coinBalance > BigInt(0),
                });
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                console.error('Error calculating conversion preview:', error_4);
                res.status(500).json({ error: 'Failed to calculate preview' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Admin: Process monthly conversions
router.post('/process-monthly', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var adminUserId_1, _a, month_1, userIds_1, results, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                adminUserId_1 = req.user.id;
                _a = req.body, month_1 = _a.month, userIds_1 = _a.userIds;
                if (!month_1) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ error: 'Month is required (YYYY-MM format)' })];
                }
                return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var processedConversions, errors, targetUsers, _a, _i, targetUsers_1, userId, result, error_6;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    processedConversions = [];
                                    errors = [];
                                    _a = userIds_1;
                                    if (_a) return [3 /*break*/, 2];
                                    return [4 /*yield*/, tx.coinWallet
                                            .findMany({
                                            where: { balance: { gt: 0 } },
                                            select: { userId: true },
                                        })
                                            .then(function (wallets) { return wallets.map(function (w) { return w.userId; }); })];
                                case 1:
                                    _a = (_b.sent());
                                    _b.label = 2;
                                case 2:
                                    targetUsers = _a;
                                    _i = 0, targetUsers_1 = targetUsers;
                                    _b.label = 3;
                                case 3:
                                    if (!(_i < targetUsers_1.length)) return [3 /*break*/, 8];
                                    userId = targetUsers_1[_i];
                                    _b.label = 4;
                                case 4:
                                    _b.trys.push([4, 6, , 7]);
                                    return [4 /*yield*/, processUserConversion(tx, userId, month_1, adminUserId_1)];
                                case 5:
                                    result = _b.sent();
                                    if (result) {
                                        processedConversions.push(result);
                                    }
                                    return [3 /*break*/, 7];
                                case 6:
                                    error_6 = _b.sent();
                                    errors.push({
                                        userId: userId,
                                        error: error_6 instanceof Error ? error_6.message : 'Unknown error',
                                    });
                                    return [3 /*break*/, 7];
                                case 7:
                                    _i++;
                                    return [3 /*break*/, 3];
                                case 8: 
                                // Record admin action
                                return [4 /*yield*/, tx.adminAction.create({
                                        data: {
                                            adminUserId: adminUserId_1,
                                            action: 'PROCESS_CONVERSIONS',
                                            details: {
                                                month: month_1,
                                                processedCount: processedConversions.length,
                                                errorCount: errors.length,
                                                targetUserCount: targetUsers.length,
                                            },
                                            result: errors.length === 0 ? 'SUCCESS' : 'PARTIAL',
                                        },
                                    })];
                                case 9:
                                    // Record admin action
                                    _b.sent();
                                    return [2 /*return*/, { processedConversions: processedConversions, errors: errors }];
                            }
                        });
                    }); })];
            case 1:
                results = _b.sent();
                res.json({
                    success: true,
                    processed: results.processedConversions.length,
                    errors: results.errors.length,
                    details: results,
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _b.sent();
                console.error('Error processing monthly conversions:', error_5);
                res.status(500).json({ error: 'Failed to process conversions' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
function processUserConversion(tx, userId, month, adminUserId) {
    return __awaiter(this, void 0, void 0, function () {
        var existingConversion, coinWallet, exchangeRate, coinAmount, rateDecimal, revenueShareDecimal, cashAmountCents, conversion, cashWallet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tx.coinConversion.findFirst({
                        where: { userId: userId, month: month, status: 'COMPLETED' },
                    })];
                case 1:
                    existingConversion = _a.sent();
                    if (existingConversion) {
                        return [2 /*return*/, null]; // Already processed
                    }
                    return [4 /*yield*/, tx.coinWallet.findUnique({
                            where: { userId: userId },
                        })];
                case 2:
                    coinWallet = _a.sent();
                    if (!coinWallet || coinWallet.balance === BigInt(0)) {
                        return [2 /*return*/, null]; // No coins to convert
                    }
                    return [4 /*yield*/, tx.exchangeRate.findFirst({
                            where: { toCurrency: 'USD', isActive: true },
                            orderBy: { effectiveFrom: 'desc' },
                        })];
                case 3:
                    exchangeRate = _a.sent();
                    if (!exchangeRate) {
                        throw new Error('No active exchange rate found');
                    }
                    coinAmount = coinWallet.balance;
                    rateDecimal = parseFloat(exchangeRate.rate.toString());
                    revenueShareDecimal = parseFloat(exchangeRate.revenueShare.toString());
                    cashAmountCents = Math.floor((Number(coinAmount) / rateDecimal) * revenueShareDecimal);
                    return [4 /*yield*/, tx.coinConversion.create({
                            data: {
                                userId: userId,
                                coinAmount: coinAmount,
                                cashAmount: cashAmountCents,
                                exchangeRate: exchangeRate.rate,
                                currency: 'USD',
                                month: month,
                                status: 'COMPLETED',
                                processedAt: new Date(),
                            },
                        })
                        // Update coin wallet
                    ];
                case 4:
                    conversion = _a.sent();
                    // Update coin wallet
                    return [4 /*yield*/, tx.coinWallet.update({
                            where: { userId: userId },
                            data: {
                                balance: BigInt(0),
                                totalConverted: { increment: coinAmount },
                            },
                        })
                        // Get or create cash wallet
                    ];
                case 5:
                    // Update coin wallet
                    _a.sent();
                    return [4 /*yield*/, tx.cashWallet.findUnique({
                            where: { userId: userId },
                        })];
                case 6:
                    cashWallet = _a.sent();
                    if (!!cashWallet) return [3 /*break*/, 8];
                    return [4 /*yield*/, tx.cashWallet.create({
                            data: { userId: userId },
                        })];
                case 7:
                    cashWallet = _a.sent();
                    _a.label = 8;
                case 8: 
                // Update cash wallet
                return [4 /*yield*/, tx.cashWallet.update({
                        where: { userId: userId },
                        data: {
                            balance: { increment: cashAmountCents },
                            totalReceived: { increment: cashAmountCents },
                        },
                    })
                    // Record transactions
                ];
                case 9:
                    // Update cash wallet
                    _a.sent();
                    // Record transactions
                    return [4 /*yield*/, tx.transaction.create({
                            data: {
                                userId: userId,
                                type: 'COIN_CONVERT',
                                amount: coinAmount.toString(),
                                description: "Converted ".concat(coinAmount, " coins to cash"),
                                referenceId: conversion.id,
                                balanceSnapshot: {
                                    coinBalance: '0',
                                    cashBalance: (cashWallet.balance + cashAmountCents).toString(),
                                },
                            },
                        })];
                case 10:
                    // Record transactions
                    _a.sent();
                    return [4 /*yield*/, tx.transaction.create({
                            data: {
                                userId: userId,
                                type: 'CASH_RECEIVE',
                                amount: cashAmountCents.toString(),
                                currency: 'USD',
                                description: "Received $".concat((cashAmountCents / 100).toFixed(2), " from coin conversion"),
                                referenceId: conversion.id,
                                balanceSnapshot: {
                                    coinBalance: '0',
                                    cashBalance: (cashWallet.balance + cashAmountCents).toString(),
                                },
                            },
                        })];
                case 11:
                    _a.sent();
                    return [2 /*return*/, conversion];
            }
        });
    });
}
exports.default = router;
