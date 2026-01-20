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
var currencyService_1 = require("../services/currencyService");
var transactionService_1 = require("../services/transactionService");
var router = (0, express_1.Router)();
var prisma = new client_1.PrismaClient();
var MINIMUM_WITHDRAWAL_USD = parseFloat(process.env.MINIMUM_WITHDRAWAL_USD || '10.00');
// Create withdrawal request
router.post('/request', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId_1, paypalEmail_1, profile, cashBalanceUsd_1, currency_1, exchangeRate_1, amountLocal_1, withdrawal, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                userId_1 = req.user.id;
                paypalEmail_1 = req.body.paypalEmail;
                return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { userId: userId_1 },
                    })];
            case 1:
                profile = _a.sent();
                if (!profile) {
                    return [2 /*return*/, res.status(404).json({ error: 'Profile not found' })];
                }
                cashBalanceUsd_1 = parseFloat(profile.cashBalanceUsd.toString());
                // Check minimum withdrawal
                if (cashBalanceUsd_1 < MINIMUM_WITHDRAWAL_USD) {
                    return [2 /*return*/, res.status(400).json({
                            error: "Minimum withdrawal is $".concat(MINIMUM_WITHDRAWAL_USD.toFixed(2), " USD"),
                            currentBalance: cashBalanceUsd_1.toFixed(2),
                        })];
                }
                // Validate PayPal email
                if (!paypalEmail_1 || !paypalEmail_1.includes('@')) {
                    return [2 /*return*/, res.status(400).json({ error: 'Valid PayPal email is required' })];
                }
                currency_1 = profile.preferredCurrency || 'USD';
                return [4 /*yield*/, (0, currencyService_1.getExchangeRate)(currency_1)];
            case 2:
                exchangeRate_1 = _a.sent();
                return [4 /*yield*/, (0, currencyService_1.convertFromUSD)(cashBalanceUsd_1, currency_1)
                    // Create withdrawal within transaction
                ];
            case 3:
                amountLocal_1 = _a.sent();
                return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var newWithdrawal;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.withdrawal.create({
                                        data: {
                                            userId: userId_1,
                                            amountUsd: cashBalanceUsd_1,
                                            amountLocal: amountLocal_1,
                                            currencyCode: currency_1,
                                            exchangeRate: exchangeRate_1,
                                            method: 'paypal',
                                            paypalEmail: paypalEmail_1,
                                            status: 'pending',
                                        },
                                    })
                                    // Process withdrawal (deduct from balance)
                                ];
                                case 1:
                                    newWithdrawal = _a.sent();
                                    // Process withdrawal (deduct from balance)
                                    return [4 /*yield*/, (0, transactionService_1.processWithdrawal)(userId_1, cashBalanceUsd_1, newWithdrawal.id, tx)];
                                case 2:
                                    // Process withdrawal (deduct from balance)
                                    _a.sent();
                                    return [2 /*return*/, newWithdrawal];
                            }
                        });
                    }); })];
            case 4:
                withdrawal = _a.sent();
                res.json({
                    success: true,
                    withdrawalId: withdrawal.id,
                    amountUSD: cashBalanceUsd_1.toFixed(2),
                    amountLocal: amountLocal_1.toFixed(2),
                    currency: currency_1,
                    status: 'pending',
                    message: 'Withdrawal request submitted successfully',
                });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.error('Error creating withdrawal:', error_1);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create withdrawal request'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Get user withdrawals
router.get('/history', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, page, perPage, skip, _a, withdrawals, total, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = req.user.id;
                page = parseInt(req.query.page) || 1;
                perPage = parseInt(req.query.perPage) || 20;
                skip = (page - 1) * perPage;
                return [4 /*yield*/, Promise.all([
                        prisma.withdrawal.findMany({
                            where: { userId: userId },
                            orderBy: { requestedAt: 'desc' },
                            take: perPage,
                            skip: skip,
                        }),
                        prisma.withdrawal.count({ where: { userId: userId } }),
                    ])];
            case 1:
                _a = _b.sent(), withdrawals = _a[0], total = _a[1];
                res.json({
                    withdrawals: withdrawals,
                    total: total,
                    pages: Math.ceil(total / perPage),
                    currentPage: page,
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error('Error fetching withdrawals:', error_2);
                res.status(500).json({ error: 'Failed to fetch withdrawal history' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get withdrawal by ID
router.get('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, withdrawalId, withdrawal, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
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
                    return [2 /*return*/, res.status(404).json({ error: 'Withdrawal not found' })];
                }
                res.json(withdrawal);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error fetching withdrawal:', error_3);
                res.status(500).json({ error: 'Failed to fetch withdrawal' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
