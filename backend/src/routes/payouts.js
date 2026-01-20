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
var paypalService_1 = require("../services/paypalService");
var currencyService_1 = require("../services/currencyService");
var geoService_1 = require("../services/geoService");
var router = (0, express_1.Router)();
var prisma = new client_1.PrismaClient();
/**
 * GET /api/payouts/minimum
 * Get minimum withdrawal amount in user's currency
 */
router.get('/minimum', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, ipAddress, currencyInfo, minWithdrawalUsd, minWithdrawalLocal, currencyFormat, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                userId = req.user.id;
                ipAddress = (0, geoService_1.getClientIP)(req);
                return [4 /*yield*/, (0, currencyService_1.getUserCurrencyInfo)(userId, ipAddress)];
            case 1:
                currencyInfo = _a.sent();
                minWithdrawalUsd = parseFloat(process.env.MINIMUM_WITHDRAWAL_USD || '10');
                return [4 /*yield*/, (0, currencyService_1.convertFromUSD)(minWithdrawalUsd, currencyInfo.displayCurrency)];
            case 2:
                minWithdrawalLocal = _a.sent();
                currencyFormat = currencyService_1.CURRENCY_FORMATS[currencyInfo.displayCurrency];
                res.json({
                    success: true,
                    minWithdrawalUsd: minWithdrawalUsd,
                    minWithdrawalLocal: minWithdrawalLocal,
                    currency: currencyInfo.displayCurrency,
                    symbol: (currencyFormat === null || currencyFormat === void 0 ? void 0 : currencyFormat.symbol) || '$',
                });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('Error fetching minimum withdrawal:', error_1);
                res.status(500).json({
                    success: false,
                    error: 'Failed to fetch minimum withdrawal',
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/payouts/request
 * Request a payout
 */
router.post('/request', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, ipAddress, profile, currencyInfo, minWithdrawalUsd, balanceUsd, minLocal, payoutAmountLocal, exchangeRate, _a, batchId, status_1, withdrawal, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 10, , 11]);
                userId = req.user.id;
                ipAddress = (0, geoService_1.getClientIP)(req);
                return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { userId: userId },
                        select: {
                            cashBalanceUsd: true,
                            paypalEmail: true,
                            preferredCurrency: true,
                        },
                    })];
            case 1:
                profile = _b.sent();
                if (!profile) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'User profile not found',
                        })];
                }
                // Check if PayPal email is set
                if (!profile.paypalEmail) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'PayPal email not set. Please update your profile.',
                        })];
                }
                return [4 /*yield*/, (0, currencyService_1.getUserCurrencyInfo)(userId, ipAddress)];
            case 2:
                currencyInfo = _b.sent();
                minWithdrawalUsd = parseFloat(process.env.MINIMUM_WITHDRAWAL_USD || '10');
                balanceUsd = parseFloat(profile.cashBalanceUsd.toString());
                if (!(balanceUsd < minWithdrawalUsd)) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, currencyService_1.convertFromUSD)(minWithdrawalUsd, currencyInfo.displayCurrency)];
            case 3:
                minLocal = _b.sent();
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        error: "Minimum withdrawal is ".concat(currencyInfo.formatting.symbol).concat(minLocal.toFixed(2)),
                    })];
            case 4: return [4 /*yield*/, (0, currencyService_1.convertFromUSD)(balanceUsd, currencyInfo.displayCurrency)];
            case 5:
                payoutAmountLocal = _b.sent();
                exchangeRate = currencyInfo.exchangeRate;
                return [4 /*yield*/, (0, paypalService_1.createPayout)(profile.paypalEmail, payoutAmountLocal.toFixed(2), currencyInfo.displayCurrency, "Adify earnings withdrawal")
                    // Create withdrawal record
                ];
            case 6:
                _a = _b.sent(), batchId = _a.batchId, status_1 = _a.status;
                return [4 /*yield*/, prisma.withdrawal.create({
                        data: {
                            userId: userId,
                            amountUsd: balanceUsd,
                            amountLocal: payoutAmountLocal,
                            currencyCode: currencyInfo.displayCurrency,
                            exchangeRate: exchangeRate,
                            method: 'PayPal',
                            status: 'pending',
                            paypalEmail: profile.paypalEmail,
                            paypalTransactionId: batchId,
                        },
                    })
                    // Deduct from user balance
                ];
            case 7:
                withdrawal = _b.sent();
                // Deduct from user balance
                return [4 /*yield*/, prisma.userProfile.update({
                        where: { userId: userId },
                        data: {
                            cashBalanceUsd: 0,
                            totalWithdrawnUsd: { increment: balanceUsd },
                        },
                    })
                    // Create transaction record
                ];
            case 8:
                // Deduct from user balance
                _b.sent();
                // Create transaction record
                return [4 /*yield*/, prisma.transaction.create({
                        data: {
                            userId: userId,
                            type: 'withdrawal',
                            cashChangeUsd: -balanceUsd,
                            cashBalanceAfterUsd: 0,
                            description: "Withdrawal via PayPal to ".concat(profile.paypalEmail),
                            referenceId: parseInt(withdrawal.id.substring(0, 8), 16), // Convert UUID to int for legacy field
                            referenceType: 'withdrawal',
                        },
                    })];
            case 9:
                // Create transaction record
                _b.sent();
                res.json({
                    success: true,
                    withdrawalId: withdrawal.id,
                    batchId: batchId,
                    status: status_1,
                    amountUsd: balanceUsd,
                    amountLocal: payoutAmountLocal,
                    currency: currencyInfo.displayCurrency,
                    message: 'Payout request submitted successfully',
                });
                return [3 /*break*/, 11];
            case 10:
                error_2 = _b.sent();
                console.error('Error requesting payout:', error_2);
                res.status(500).json({
                    success: false,
                    error: error_2.message || 'Failed to request payout',
                });
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/payouts/history
 * Get payout history
 */
router.get('/history', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, page, perPage, _a, withdrawals, total, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = req.user.id;
                page = parseInt(req.query.page) || 1;
                perPage = parseInt(req.query.perPage) || 20;
                return [4 /*yield*/, Promise.all([
                        prisma.withdrawal.findMany({
                            where: { userId: userId },
                            orderBy: { requestedAt: 'desc' },
                            skip: (page - 1) * perPage,
                            take: perPage,
                        }),
                        prisma.withdrawal.count({
                            where: { userId: userId },
                        }),
                    ])];
            case 1:
                _a = _b.sent(), withdrawals = _a[0], total = _a[1];
                res.json({
                    success: true,
                    withdrawals: withdrawals,
                    pagination: {
                        page: page,
                        perPage: perPage,
                        total: total,
                        totalPages: Math.ceil(total / perPage),
                    },
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                console.error('Error fetching payout history:', error_3);
                res.status(500).json({
                    success: false,
                    error: 'Failed to fetch payout history',
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/payouts/:id/status
 * Get payout status from PayPal
 */
router.get('/:id/status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, withdrawalId, withdrawal, paypalStatus, error_4, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                userId = req.user.id;
                withdrawalId = req.params.id;
                return [4 /*yield*/, prisma.withdrawal.findFirst({
                        where: {
                            id: withdrawalId,
                            userId: userId,
                        },
                    })];
            case 1:
                withdrawal = _a.sent();
                if (!withdrawal) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'Withdrawal not found',
                        })];
                }
                paypalStatus = null;
                if (!withdrawal.paypalTransactionId) return [3 /*break*/, 5];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, paypalService_1.getPayoutStatus)(withdrawal.paypalTransactionId)];
            case 3:
                paypalStatus = _a.sent();
                return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                console.error('Error fetching PayPal status:', error_4);
                return [3 /*break*/, 5];
            case 5:
                res.json({
                    success: true,
                    withdrawal: withdrawal,
                    paypalStatus: paypalStatus,
                });
                return [3 /*break*/, 7];
            case 6:
                error_5 = _a.sent();
                console.error('Error fetching payout status:', error_5);
                res.status(500).json({
                    success: false,
                    error: 'Failed to fetch payout status',
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
