"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var requireAdmin_1 = require("../middleware/requireAdmin");
var logAdminAction_1 = require("../middleware/logAdminAction");
var transactionService_1 = require("../services/transactionService");
var currencyService_1 = require("../services/currencyService");
var router = (0, express_1.Router)();
var prisma = new client_1.PrismaClient();
var USER_REVENUE_SHARE = parseFloat(process.env.USER_REVENUE_SHARE || '0.85');
// Apply admin middleware to ALL admin routes
router.use(requireAdmin_1.requireAdmin);
/**
 * Process monthly coin-to-cash conversion with LOCATION-BASED pools
 * New endpoint that processes revenue separately per country
 */
router.post('/process-location-conversion', (0, logAdminAction_1.logAdminAction)('PROCESS_LOCATION_CONVERSION'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, revenues_2, month_1, notes_1, adminUserId_1, _i, revenues_1, rev, conversionDate_1, results, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, revenues_2 = _a.revenues, month_1 = _a.month, notes_1 = _a.notes;
                adminUserId_1 = req.user.id;
                // Validate input
                if (!revenues_2 || !Array.isArray(revenues_2) || revenues_2.length === 0) {
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid revenues array' })];
                }
                // Validate each revenue entry
                for (_i = 0, revenues_1 = revenues_2; _i < revenues_1.length; _i++) {
                    rev = revenues_1[_i];
                    if (!rev.countryCode || !rev.admobRevenueUsd || rev.admobRevenueUsd <= 0) {
                        return [2 /*return*/, res.status(400).json({ error: 'Each revenue must have countryCode and valid admobRevenueUsd' })];
                    }
                }
                conversionDate_1 = month_1 ? new Date(month_1) : new Date();
                conversionDate_1.setDate(1); // Set to first day of month
                return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var locationResults, _i, revenues_3, revenue, countryCode, admobRevenueUsd, admobRevenueUsdNum, usersInLocation, totalCoins, userShareUsd, conversionRate, totalVideos, pool, totalCashDistributed, userIds, _a, usersInLocation_1, user, coins, cashUsd, profile;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    locationResults = [];
                                    _i = 0, revenues_3 = revenues_2;
                                    _b.label = 1;
                                case 1:
                                    if (!(_i < revenues_3.length)) return [3 /*break*/, 14];
                                    revenue = revenues_3[_i];
                                    countryCode = revenue.countryCode, admobRevenueUsd = revenue.admobRevenueUsd;
                                    admobRevenueUsdNum = parseFloat(admobRevenueUsd);
                                    return [4 /*yield*/, tx.adView.groupBy({
                                            by: ['userId'],
                                            where: {
                                                countryCode: countryCode,
                                                converted: false,
                                                completed: true
                                            },
                                            _sum: {
                                                coinsEarned: true
                                            }
                                        })];
                                case 2:
                                    usersInLocation = _b.sent();
                                    if (usersInLocation.length === 0) {
                                        console.log("\u26A0\uFE0F  No users with unconverted coins in ".concat(countryCode, ", skipping..."));
                                        return [3 /*break*/, 13];
                                    }
                                    totalCoins = usersInLocation.reduce(function (sum, user) { return sum + BigInt(user._sum.coinsEarned || 0); }, BigInt(0));
                                    if (totalCoins === BigInt(0)) {
                                        console.log("\u26A0\uFE0F  Total coins is zero for ".concat(countryCode, ", skipping..."));
                                        return [3 /*break*/, 13];
                                    }
                                    userShareUsd = admobRevenueUsdNum * USER_REVENUE_SHARE;
                                    conversionRate = userShareUsd / Number(totalCoins);
                                    return [4 /*yield*/, tx.adView.count({
                                            where: {
                                                countryCode: countryCode,
                                                converted: false,
                                                completed: true
                                            }
                                        })
                                        // Create location revenue pool
                                    ];
                                case 3:
                                    totalVideos = _b.sent();
                                    return [4 /*yield*/, tx.locationRevenuePool.create({
                                            data: {
                                                countryCode: countryCode,
                                                month: conversionDate_1,
                                                admobRevenueUsd: admobRevenueUsdNum,
                                                totalVideosWatched: totalVideos,
                                                totalCoinsIssued: totalCoins,
                                                userShareUsd: userShareUsd,
                                                conversionRate: conversionRate,
                                                status: 'processing',
                                            }
                                        })
                                        // Convert coins for users in THIS location only
                                    ];
                                case 4:
                                    pool = _b.sent();
                                    totalCashDistributed = 0;
                                    userIds = [];
                                    _a = 0, usersInLocation_1 = usersInLocation;
                                    _b.label = 5;
                                case 5:
                                    if (!(_a < usersInLocation_1.length)) return [3 /*break*/, 10];
                                    user = usersInLocation_1[_a];
                                    coins = BigInt(user._sum.coinsEarned || 0);
                                    cashUsd = Number(coins) * conversionRate;
                                    return [4 /*yield*/, tx.userProfile.findUnique({
                                            where: { userId: user.userId }
                                        })];
                                case 6:
                                    profile = _b.sent();
                                    if (!profile)
                                        return [3 /*break*/, 9];
                                    userIds.push(user.userId);
                                    // Convert user's coins to cash
                                    return [4 /*yield*/, (0, transactionService_1.convertCoinsToUSD)(user.userId, coins, cashUsd, pool.id, tx)
                                        // Create location conversion detail record
                                    ];
                                case 7:
                                    // Convert user's coins to cash
                                    _b.sent();
                                    // Create location conversion detail record
                                    return [4 /*yield*/, tx.locationConversion.create({
                                            data: {
                                                poolId: pool.id,
                                                userId: user.userId,
                                                coinsConverted: coins,
                                                cashReceivedUsd: cashUsd,
                                                conversionRate: conversionRate,
                                            }
                                        })];
                                case 8:
                                    // Create location conversion detail record
                                    _b.sent();
                                    totalCashDistributed += cashUsd;
                                    _b.label = 9;
                                case 9:
                                    _a++;
                                    return [3 /*break*/, 5];
                                case 10: 
                                // Mark ad views from THIS location as converted and link to pool
                                return [4 /*yield*/, tx.adView.updateMany({
                                        where: {
                                            countryCode: countryCode,
                                            converted: false,
                                            userId: { in: userIds }
                                        },
                                        data: {
                                            converted: true,
                                            poolId: pool.id
                                        }
                                    })
                                    // Update pool status
                                ];
                                case 11:
                                    // Mark ad views from THIS location as converted and link to pool
                                    _b.sent();
                                    // Update pool status
                                    return [4 /*yield*/, tx.locationRevenuePool.update({
                                            where: { id: pool.id },
                                            data: {
                                                status: 'completed',
                                                processedAt: new Date()
                                            }
                                        })];
                                case 12:
                                    // Update pool status
                                    _b.sent();
                                    locationResults.push({
                                        countryCode: countryCode,
                                        poolId: pool.id,
                                        admobRevenue: admobRevenueUsdNum,
                                        totalCoins: totalCoins.toString(),
                                        conversionRate: conversionRate,
                                        usersAffected: usersInLocation.length,
                                        totalCashDistributed: totalCashDistributed
                                    });
                                    console.log("\u2705 Processed ".concat(countryCode, ": ").concat(usersInLocation.length, " users, ").concat(totalCoins, " coins, rate $").concat(conversionRate.toFixed(8), "/coin"));
                                    _b.label = 13;
                                case 13:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 14: 
                                // Log admin action
                                return [4 /*yield*/, tx.adminAction.create({
                                        data: {
                                            adminId: adminUserId_1,
                                            action: 'location_conversion',
                                            targetType: 'LOCATION_POOL',
                                            metadata: {
                                                month: month_1,
                                                locationResults: locationResults,
                                                notes: notes_1
                                            }
                                        }
                                    })];
                                case 15:
                                    // Log admin action
                                    _b.sent();
                                    return [2 /*return*/, locationResults];
                            }
                        });
                    }); }, {
                        timeout: 120000, // 2 minute timeout for large conversions
                    })];
            case 1:
                results = _b.sent();
                res.json({
                    success: true,
                    message: 'Location-based conversion completed successfully',
                    results: results
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('Error processing location conversion:', error_1);
                res.status(500).json({
                    success: false,
                    error: error_1 instanceof Error ? error_1.message : 'Failed to process location conversion'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Process monthly coin-to-cash conversion (LEGACY - global pool)
 * This is the critical conversion endpoint that must be transactional
 */
router.post('/process-conversion', (0, logAdminAction_1.logAdminAction)('PROCESS_CONVERSION'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, admobRevenue, month, notes_2, adminUserId_2, admobRevenueUsd_1, conversionDate_2, totalUserPayoutUsd_1, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, admobRevenue = _a.admobRevenue, month = _a.month, notes_2 = _a.notes;
                adminUserId_2 = req.user.id;
                // Validate input
                if (!admobRevenue || admobRevenue <= 0) {
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid AdMob revenue amount' })];
                }
                admobRevenueUsd_1 = parseFloat(admobRevenue);
                conversionDate_2 = month ? new Date(month) : new Date();
                totalUserPayoutUsd_1 = admobRevenueUsd_1 * USER_REVENUE_SHARE;
                return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(void 0, void 0, void 0, function () {
                        var usersWithCoins, totalCoins, conversionRate, conversion, totalCashDistributed, _i, usersWithCoins_1, user, coins, cashUsd;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, tx.userProfile.findMany({
                                        where: {
                                            coinsBalance: { gt: 0 },
                                        },
                                        select: {
                                            userId: true,
                                            coinsBalance: true,
                                        },
                                    })];
                                case 1:
                                    usersWithCoins = _a.sent();
                                    if (usersWithCoins.length === 0) {
                                        throw new Error('No users with coins to convert');
                                    }
                                    totalCoins = usersWithCoins.reduce(function (sum, user) { return sum + user.coinsBalance; }, BigInt(0));
                                    if (totalCoins === BigInt(0)) {
                                        throw new Error('Total coins is zero');
                                    }
                                    conversionRate = totalUserPayoutUsd_1 / Number(totalCoins);
                                    return [4 /*yield*/, tx.coinConversion.create({
                                            data: {
                                                conversionDate: conversionDate_2,
                                                admobRevenueUsd: admobRevenueUsd_1,
                                                userRevenueShare: USER_REVENUE_SHARE,
                                                totalUserPayoutUsd: totalUserPayoutUsd_1,
                                                totalCoinsConverted: totalCoins,
                                                conversionRateUsdPerCoin: conversionRate,
                                                usersAffected: usersWithCoins.length,
                                                status: 'processing',
                                                notes: notes_2,
                                            },
                                        })
                                        // Convert coins for each user
                                    ];
                                case 2:
                                    conversion = _a.sent();
                                    totalCashDistributed = 0;
                                    _i = 0, usersWithCoins_1 = usersWithCoins;
                                    _a.label = 3;
                                case 3:
                                    if (!(_i < usersWithCoins_1.length)) return [3 /*break*/, 7];
                                    user = usersWithCoins_1[_i];
                                    coins = user.coinsBalance;
                                    cashUsd = Number(coins) * conversionRate;
                                    // Convert user's coins to cash
                                    return [4 /*yield*/, (0, transactionService_1.convertCoinsToUSD)(user.userId, coins, cashUsd, conversion.id, tx)
                                        // Create conversion detail record
                                    ];
                                case 4:
                                    // Convert user's coins to cash
                                    _a.sent();
                                    // Create conversion detail record
                                    return [4 /*yield*/, tx.conversionDetail.create({
                                            data: {
                                                conversionId: conversion.id,
                                                userId: user.userId,
                                                coinsConverted: coins,
                                                cashReceivedUsd: cashUsd,
                                                conversionRateUsed: conversionRate,
                                            },
                                        })];
                                case 5:
                                    // Create conversion detail record
                                    _a.sent();
                                    totalCashDistributed += cashUsd;
                                    _a.label = 6;
                                case 6:
                                    _i++;
                                    return [3 /*break*/, 3];
                                case 7: 
                                // Mark all ad views as converted
                                return [4 /*yield*/, tx.adView.updateMany({
                                        where: {
                                            converted: false,
                                            userId: { in: usersWithCoins.map(function (u) { return u.userId; }) },
                                        },
                                        data: {
                                            converted: true,
                                            conversionBatchId: conversion.id,
                                        },
                                    })
                                    // Update conversion status
                                ];
                                case 8:
                                    // Mark all ad views as converted
                                    _a.sent();
                                    // Update conversion status
                                    return [4 /*yield*/, tx.coinConversion.update({
                                            where: { id: conversion.id },
                                            data: {
                                                status: 'completed',
                                                processedAt: new Date(),
                                            },
                                        })
                                        // Log admin action
                                    ];
                                case 9:
                                    // Update conversion status
                                    _a.sent();
                                    // Log admin action
                                    return [4 /*yield*/, tx.adminAction.create({
                                            data: {
                                                adminId: adminUserId_2,
                                                action: 'coin_conversion',
                                                targetType: 'CONVERSION',
                                                targetId: conversion.id,
                                                metadata: {
                                                    conversionId: conversion.id,
                                                    admobRevenue: admobRevenueUsd_1,
                                                    totalCoins: totalCoins.toString(),
                                                    conversionRate: conversionRate,
                                                    usersAffected: usersWithCoins.length,
                                                    totalCashDistributed: totalCashDistributed,
                                                },
                                            },
                                        })];
                                case 10:
                                    // Log admin action
                                    _a.sent();
                                    return [2 /*return*/, {
                                            conversion: conversion,
                                            totalCashDistributed: totalCashDistributed,
                                            usersAffected: usersWithCoins.length,
                                            totalCoinsConverted: totalCoins.toString(),
                                            conversionRate: conversionRate,
                                        }];
                            }
                        });
                    }); }, {
                        timeout: 60000, // 60 second timeout for large conversions
                    })];
            case 1:
                result = _b.sent();
                res.json({
                    success: true,
                    message: 'Conversion completed successfully',
                    data: result,
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error('Error processing conversion:', error_2);
                res.status(500).json({
                    success: false,
                    error: error_2 instanceof Error ? error_2.message : 'Failed to process conversion'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Get conversion history
 */
router.get('/conversions', (0, logAdminAction_1.logAdminAction)('VIEW_CONVERSION_HISTORY'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var page, perPage, skip, _a, conversions, total, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                page = parseInt(req.query.page) || 1;
                perPage = parseInt(req.query.perPage) || 20;
                skip = (page - 1) * perPage;
                return [4 /*yield*/, Promise.all([
                        prisma.coinConversion.findMany({
                            orderBy: { conversionDate: 'desc' },
                            take: perPage,
                            skip: skip,
                            include: {
                                _count: {
                                    select: { conversionDetails: true },
                                },
                            },
                        }),
                        prisma.coinConversion.count(),
                    ])];
            case 1:
                _a = _b.sent(), conversions = _a[0], total = _a[1];
                res.json({
                    conversions: conversions,
                    total: total,
                    pages: Math.ceil(total / perPage),
                    currentPage: page,
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                console.error('Error fetching conversions:', error_3);
                res.status(500).json({ error: 'Failed to fetch conversion history' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Get conversion details for a specific conversion
 */
router.get('/conversions/:id', (0, logAdminAction_1.logAdminAction)('VIEW_CONVERSION_DETAILS'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var conversionId, conversion, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                conversionId = parseInt(req.params.id);
                return [4 /*yield*/, prisma.coinConversion.findUnique({
                        where: { id: conversionId },
                        include: {
                            conversionDetails: {
                                include: {
                                    user: {
                                        select: {
                                            email: true,
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    })];
            case 1:
                conversion = _a.sent();
                if (!conversion) {
                    return [2 /*return*/, res.status(404).json({ error: 'Conversion not found' })];
                }
                res.json(conversion);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error fetching conversion details:', error_4);
                res.status(500).json({ error: 'Failed to fetch conversion details' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Get platform statistics
 */
router.get('/stats', (0, logAdminAction_1.logAdminAction)('VIEW_STATS'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var pendingCoinsResult, totalCashResult, conversionStats, usersWithCoins, error_5;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 5, , 6]);
                return [4 /*yield*/, prisma.userProfile.aggregate({
                        _sum: {
                            coinsBalance: true,
                        },
                    })
                    // Get total cash distributed
                ];
            case 1:
                pendingCoinsResult = _f.sent();
                return [4 /*yield*/, prisma.userProfile.aggregate({
                        _sum: {
                            totalCashEarnedUsd: true,
                            totalWithdrawnUsd: true,
                        },
                    })
                    // Get conversion stats
                ];
            case 2:
                totalCashResult = _f.sent();
                return [4 /*yield*/, prisma.coinConversion.aggregate({
                        _sum: {
                            admobRevenueUsd: true,
                            totalUserPayoutUsd: true,
                        },
                        _count: true,
                    })
                    // Get users with pending coins
                ];
            case 3:
                conversionStats = _f.sent();
                return [4 /*yield*/, prisma.userProfile.count({
                        where: { coinsBalance: { gt: 0 } },
                    })];
            case 4:
                usersWithCoins = _f.sent();
                res.json({
                    pendingCoins: ((_a = pendingCoinsResult._sum.coinsBalance) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
                    totalCashEarned: ((_b = totalCashResult._sum.totalCashEarnedUsd) === null || _b === void 0 ? void 0 : _b.toString()) || '0',
                    totalWithdrawn: ((_c = totalCashResult._sum.totalWithdrawnUsd) === null || _c === void 0 ? void 0 : _c.toString()) || '0',
                    totalRevenue: ((_d = conversionStats._sum.admobRevenueUsd) === null || _d === void 0 ? void 0 : _d.toString()) || '0',
                    totalPayouts: ((_e = conversionStats._sum.totalUserPayoutUsd) === null || _e === void 0 ? void 0 : _e.toString()) || '0',
                    conversionsProcessed: conversionStats._count,
                    usersWithPendingCoins: usersWithCoins,
                });
                return [3 /*break*/, 6];
            case 5:
                error_5 = _f.sent();
                console.error('Error fetching stats:', error_5);
                res.status(500).json({ error: 'Failed to fetch statistics' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
/**
 * Get location-based statistics (per-country breakdown)
 */
router.get('/stats/by-location', (0, logAdminAction_1.logAdminAction)('VIEW_LOCATION_STATS'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var countries, locationStats, _i, countries_1, country, pendingCoins, totalPendingCoins, convertedViews, totalConvertedCoins, poolStats, activeUsers, globalPending, globalRevenue, error_6;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 9, , 10]);
                return [4 /*yield*/, prisma.adView.groupBy({
                        by: ['countryCode'],
                        where: {
                            countryCode: { not: null }
                        },
                        _count: true
                    })];
            case 1:
                countries = _d.sent();
                locationStats = [];
                _i = 0, countries_1 = countries;
                _d.label = 2;
            case 2:
                if (!(_i < countries_1.length)) return [3 /*break*/, 8];
                country = countries_1[_i];
                if (!country.countryCode)
                    return [3 /*break*/, 7];
                return [4 /*yield*/, prisma.adView.groupBy({
                        by: ['userId'],
                        where: {
                            countryCode: country.countryCode,
                            converted: false,
                            completed: true
                        },
                        _sum: {
                            coinsEarned: true
                        }
                    })];
            case 3:
                pendingCoins = _d.sent();
                totalPendingCoins = pendingCoins.reduce(function (sum, user) { return sum + BigInt(user._sum.coinsEarned || 0); }, BigInt(0));
                return [4 /*yield*/, prisma.adView.groupBy({
                        by: ['userId'],
                        where: {
                            countryCode: country.countryCode,
                            converted: true
                        },
                        _sum: {
                            coinsEarned: true
                        }
                    })];
            case 4:
                convertedViews = _d.sent();
                totalConvertedCoins = convertedViews.reduce(function (sum, user) { return sum + BigInt(user._sum.coinsEarned || 0); }, BigInt(0));
                return [4 /*yield*/, prisma.locationRevenuePool.aggregate({
                        where: {
                            countryCode: country.countryCode
                        },
                        _sum: {
                            admobRevenueUsd: true,
                            userShareUsd: true
                        },
                        _avg: {
                            conversionRate: true
                        }
                    })
                    // Active users in this location
                ];
            case 5:
                poolStats = _d.sent();
                return [4 /*yield*/, prisma.adView.groupBy({
                        by: ['userId'],
                        where: {
                            countryCode: country.countryCode
                        }
                    })];
            case 6:
                activeUsers = _d.sent();
                locationStats.push({
                    country: country.countryCode,
                    pendingCoins: totalPendingCoins.toString(),
                    convertedCoins: totalConvertedCoins.toString(),
                    totalRevenue: ((_a = poolStats._sum.admobRevenueUsd) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
                    totalUserPayout: ((_b = poolStats._sum.userShareUsd) === null || _b === void 0 ? void 0 : _b.toString()) || '0',
                    averageConversionRate: ((_c = poolStats._avg.conversionRate) === null || _c === void 0 ? void 0 : _c.toString()) || '0',
                    usersActive: activeUsers.length
                });
                _d.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 2];
            case 8:
                // Sort by revenue descending
                locationStats.sort(function (a, b) { return parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue); });
                globalPending = locationStats.reduce(function (sum, loc) { return sum + BigInt(loc.pendingCoins); }, BigInt(0));
                globalRevenue = locationStats.reduce(function (sum, loc) { return sum + parseFloat(loc.totalRevenue); }, 0);
                res.json({
                    global: {
                        totalPendingCoins: globalPending.toString(),
                        totalRevenue: globalRevenue.toFixed(2)
                    },
                    byLocation: locationStats
                });
                return [3 /*break*/, 10];
            case 9:
                error_6 = _d.sent();
                console.error('Error fetching location stats:', error_6);
                res.status(500).json({ error: 'Failed to fetch location statistics' });
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); });
/**
 * Get fraud detection stats and suspicious users
 */
router.get('/fraud-stats', (0, logAdminAction_1.logAdminAction)('VIEW_FRAUD_STATS'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, getFraudStats, getSuspiciousUsers, getVPNDetections, stats, suspiciousUsers, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../services/fraudDetection'); })];
            case 1:
                _a = _b.sent(), getFraudStats = _a.getFraudStats, getSuspiciousUsers = _a.getSuspiciousUsers, getVPNDetections = _a.getVPNDetections;
                return [4 /*yield*/, getFraudStats()];
            case 2:
                stats = _b.sent();
                return [4 /*yield*/, getSuspiciousUsers(1, 20)];
            case 3:
                suspiciousUsers = _b.sent();
                res.json({
                    stats: stats,
                    suspiciousUsers: suspiciousUsers.users,
                    total: suspiciousUsers.total
                });
                return [3 /*break*/, 5];
            case 4:
                error_7 = _b.sent();
                console.error('Error fetching fraud stats:', error_7);
                res.status(500).json({ error: 'Failed to fetch fraud statistics' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * Get VPN detections for a specific user
 */
router.get('/fraud/user/:userId', (0, logAdminAction_1.logAdminAction)('VIEW_USER_FRAUD'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, getVPNDetections, detections, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                userId = req.params.userId;
                return [4 /*yield*/, Promise.resolve().then(function () { return require('../services/fraudDetection'); })];
            case 1:
                getVPNDetections = (_a.sent()).getVPNDetections;
                return [4 /*yield*/, getVPNDetections(userId)];
            case 2:
                detections = _a.sent();
                res.json({
                    userId: userId,
                    detections: detections
                });
                return [3 /*break*/, 4];
            case 3:
                error_8 = _a.sent();
                console.error('Error fetching user fraud data:', error_8);
                res.status(500).json({ error: 'Failed to fetch user fraud data' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Update exchange rates manually
 */
router.post('/update-exchange-rates', (0, logAdminAction_1.logAdminAction)('UPDATE_EXCHANGE_RATES'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var adminUserId, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                adminUserId = req.user.id;
                return [4 /*yield*/, (0, currencyService_1.updateExchangeRates)()];
            case 1:
                _a.sent();
                res.json({
                    success: true,
                    message: 'Exchange rates updated successfully',
                });
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                console.error('Error updating exchange rates:', error_9);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update exchange rates'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Get exchange rate for a currency
 */
router.get('/exchange-rates/:currency', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var currency, rate, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                currency = req.params.currency.toUpperCase();
                return [4 /*yield*/, (0, currencyService_1.getExchangeRate)(currency)];
            case 1:
                rate = _a.sent();
                res.json({
                    currency: currency,
                    rate: rate.toFixed(6),
                    base: 'USD',
                });
                return [3 /*break*/, 3];
            case 2:
                error_10 = _a.sent();
                console.error('Error fetching exchange rate:', error_10);
                res.status(500).json({ error: 'Failed to fetch exchange rate' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Get admin action logs
 */
router.get('/logs', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, limit, action, adminId, where, logs, total, error_11;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 50 : _c, action = _a.action, adminId = _a.adminId;
                where = {};
                if (action)
                    where.action = action;
                if (adminId)
                    where.adminId = adminId;
                return [4 /*yield*/, prisma.adminAction.findMany({
                        where: where,
                        include: {
                            admin: {
                                select: {
                                    userId: true,
                                    email: true,
                                    name: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                        skip: (parseInt(page) - 1) * parseInt(limit),
                        take: parseInt(limit),
                    })];
            case 1:
                logs = _d.sent();
                return [4 /*yield*/, prisma.adminAction.count({ where: where })];
            case 2:
                total = _d.sent();
                res.json({
                    logs: logs,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: total,
                        pages: Math.ceil(total / parseInt(limit)),
                    },
                });
                return [3 /*break*/, 4];
            case 3:
                error_11 = _d.sent();
                console.error('Error fetching admin logs:', error_11);
                res.status(500).json({ error: 'Failed to fetch admin logs' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Get expiry income report
 */
router.get('/expiry-report', (0, logAdminAction_1.logAdminAction)('VIEW_EXPIRY_REPORT'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var now, startOfMonth, endOfMonth, thisMonthExpired, thisMonthCoins, thisMonthCash, thisMonthStats, allTimeExpired, allTimeTotal, uniqueUsers, error_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                now = new Date();
                startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                return [4 /*yield*/, prisma.expiredBalance.findMany({
                        where: {
                            expiredAt: {
                                gte: startOfMonth,
                                lte: endOfMonth,
                            },
                        },
                    })
                    // Calculate this month's stats
                ];
            case 1:
                thisMonthExpired = _a.sent();
                thisMonthCoins = thisMonthExpired.filter(function (e) { return e.expiryType === 'coins'; });
                thisMonthCash = thisMonthExpired.filter(function (e) { return e.expiryType === 'cash'; });
                thisMonthStats = {
                    expiredCoins: {
                        amount: thisMonthCoins.reduce(function (sum, e) { return sum + Number(e.amount); }, 0),
                        value: thisMonthCoins.reduce(function (sum, e) { return sum + Number(e.cashValue); }, 0),
                        count: thisMonthCoins.length,
                    },
                    expiredCash: {
                        amount: thisMonthCash.reduce(function (sum, e) { return sum + Number(e.amount); }, 0),
                        value: thisMonthCash.reduce(function (sum, e) { return sum + Number(e.cashValue); }, 0),
                        count: thisMonthCash.length,
                    },
                    total: 0,
                };
                thisMonthStats.total = thisMonthStats.expiredCoins.value + thisMonthStats.expiredCash.value;
                return [4 /*yield*/, prisma.expiredBalance.findMany()];
            case 2:
                allTimeExpired = _a.sent();
                allTimeTotal = allTimeExpired.reduce(function (sum, e) { return sum + Number(e.cashValue); }, 0);
                uniqueUsers = new Set(thisMonthExpired.map(function (e) { return e.userId; }));
                res.json({
                    thisMonth: __assign(__assign({}, thisMonthStats), { usersAffected: uniqueUsers.size }),
                    allTime: {
                        total: allTimeTotal,
                        recordCount: allTimeExpired.length,
                    },
                });
                return [3 /*break*/, 4];
            case 3:
                error_12 = _a.sent();
                console.error('Error fetching expiry report:', error_12);
                res.status(500).json({ error: 'Failed to fetch expiry report' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Get paginated list of expired balances
 */
router.get('/expired-balances', (0, logAdminAction_1.logAdminAction)('VIEW_EXPIRED_BALANCES'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, limit, type, userId, where, expiredBalances, total, error_13;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 50 : _c, type = _a.type, userId = _a.userId;
                where = {};
                if (type)
                    where.expiryType = type;
                if (userId)
                    where.userId = userId;
                return [4 /*yield*/, prisma.expiredBalance.findMany({
                        where: where,
                        include: {
                            user: {
                                select: {
                                    email: true,
                                    displayName: true,
                                },
                            },
                        },
                        orderBy: { expiredAt: 'desc' },
                        skip: (parseInt(page) - 1) * parseInt(limit),
                        take: parseInt(limit),
                    })];
            case 1:
                expiredBalances = _d.sent();
                return [4 /*yield*/, prisma.expiredBalance.count({ where: where })];
            case 2:
                total = _d.sent();
                res.json({
                    balances: expiredBalances.map(function (b) { return ({
                        id: b.id,
                        userId: b.userId,
                        userEmail: b.user.email,
                        displayName: b.user.displayName || 'N/A',
                        type: b.expiryType,
                        amount: Number(b.amount).toFixed(2),
                        cashValue: Number(b.cashValue).toFixed(2),
                        reason: b.reason,
                        expiredAt: b.expiredAt,
                    }); }),
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: total,
                        pages: Math.ceil(total / parseInt(limit)),
                    },
                });
                return [3 /*break*/, 4];
            case 3:
                error_13 = _d.sent();
                console.error('Error fetching expired balances:', error_13);
                res.status(500).json({ error: 'Failed to fetch expired balances' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
