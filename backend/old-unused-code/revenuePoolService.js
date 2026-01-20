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
exports.revenuePoolService = void 0;
var client_1 = require("@prisma/client");
var locationService_js_1 = require("./locationService.js");
var prisma = new client_1.PrismaClient();
var RevenuePoolService = /** @class */ (function () {
    function RevenuePoolService() {
    }
    /**
     * Initialize revenue pools for all supported countries
     */
    RevenuePoolService.prototype.initializeRevenuePools = function () {
        return __awaiter(this, void 0, void 0, function () {
            var supportedCountries, _i, supportedCountries_1, _a, countryCode, currency;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        supportedCountries = [
                            { countryCode: 'ZA', currency: 'ZAR' },
                            { countryCode: 'US', currency: 'USD' },
                            { countryCode: 'CA', currency: 'CAD' },
                            { countryCode: 'GB', currency: 'GBP' },
                            { countryCode: 'AU', currency: 'AUD' },
                            { countryCode: 'DE', currency: 'EUR' },
                            { countryCode: 'FR', currency: 'EUR' },
                            { countryCode: 'ES', currency: 'EUR' },
                            { countryCode: 'IT', currency: 'EUR' },
                            { countryCode: 'NL', currency: 'EUR' },
                            { countryCode: 'JP', currency: 'JPY' },
                            { countryCode: 'CH', currency: 'CHF' },
                            { countryCode: 'SE', currency: 'SEK' },
                        ];
                        _i = 0, supportedCountries_1 = supportedCountries;
                        _b.label = 1;
                    case 1:
                        if (!(_i < supportedCountries_1.length)) return [3 /*break*/, 4];
                        _a = supportedCountries_1[_i], countryCode = _a.countryCode, currency = _a.currency;
                        return [4 /*yield*/, prisma.locationRevenuePool.upsert({
                                where: { countryCode: countryCode },
                                create: {
                                    countryCode: countryCode,
                                    currency: currency,
                                    totalRevenue: 0n,
                                    userRevenue: 0n,
                                    platformRevenue: 0n,
                                    totalUsers: 0,
                                    totalAdViews: 0,
                                    averageRewardPerAd: 0,
                                    exchangeRateToUSD: 1.0,
                                    isActive: true,
                                },
                                update: {
                                    currency: currency,
                                    isActive: true,
                                    lastUpdated: new Date(),
                                },
                            })];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.log('✅ Revenue pools initialized for all supported countries');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process ad revenue and distribute to pools
     */
    RevenuePoolService.prototype.processAdRevenue = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var countryCode, userId, adRevenue, rewardAmount, currency, platformRevenue, userActualRevenue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        countryCode = data.countryCode, userId = data.userId, adRevenue = data.adRevenue, rewardAmount = data.rewardAmount;
                        currency = locationService_js_1.locationService.getCurrencyForCountry(countryCode);
                        platformRevenue = Math.round(adRevenue * 0.15);
                        userActualRevenue = adRevenue - platformRevenue;
                        // Update revenue pool
                        return [4 /*yield*/, prisma.locationRevenuePool.update({
                                where: { countryCode: countryCode },
                                data: {
                                    totalRevenue: {
                                        increment: BigInt(adRevenue),
                                    },
                                    userRevenue: {
                                        increment: BigInt(userActualRevenue),
                                    },
                                    platformRevenue: {
                                        increment: BigInt(platformRevenue),
                                    },
                                    totalAdViews: {
                                        increment: 1,
                                    },
                                    lastUpdated: new Date(),
                                },
                            })
                            // Calculate new average reward per ad
                        ];
                    case 1:
                        // Update revenue pool
                        _a.sent();
                        // Calculate new average reward per ad
                        return [4 /*yield*/, this.updateAverageReward(countryCode)];
                    case 2:
                        // Calculate new average reward per ad
                        _a.sent();
                        console.log("\uD83D\uDCB0 Revenue processed for ".concat(countryCode, ": ").concat(adRevenue, " ").concat(currency, " cents"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update average reward per ad for a country
     */
    RevenuePoolService.prototype.updateAverageReward = function (countryCode) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, averageReward;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.locationRevenuePool.findUnique({
                            where: { countryCode: countryCode },
                        })];
                    case 1:
                        pool = _a.sent();
                        if (!(pool && pool.totalAdViews > 0)) return [3 /*break*/, 3];
                        averageReward = Number(pool.userRevenue) / pool.totalAdViews;
                        return [4 /*yield*/, prisma.locationRevenuePool.update({
                                where: { countryCode: countryCode },
                                data: {
                                    averageRewardPerAd: Math.round(averageReward),
                                },
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get revenue pool statistics for a country
     */
    RevenuePoolService.prototype.getPoolStats = function (countryCode) {
        return __awaiter(this, void 0, void 0, function () {
            var pool;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.locationRevenuePool.findUnique({
                            where: { countryCode: countryCode },
                        })];
                    case 1:
                        pool = _a.sent();
                        if (!pool)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                countryCode: pool.countryCode,
                                currency: pool.currency,
                                totalRevenue: pool.totalRevenue,
                                userRevenue: pool.userRevenue,
                                platformRevenue: pool.platformRevenue,
                                totalUsers: pool.totalUsers,
                                totalAdViews: pool.totalAdViews,
                                averageRewardPerAd: pool.averageRewardPerAd,
                                exchangeRateToUSD: Number(pool.exchangeRateToUSD),
                            }];
                }
            });
        });
    };
    /**
     * Get all revenue pools for admin dashboard
     */
    RevenuePoolService.prototype.getAllPoolStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pools;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.locationRevenuePool.findMany({
                            where: { isActive: true },
                            orderBy: { totalRevenue: 'desc' },
                        })];
                    case 1:
                        pools = _a.sent();
                        return [2 /*return*/, pools.map(function (pool) { return ({
                                countryCode: pool.countryCode,
                                currency: pool.currency,
                                totalRevenue: pool.totalRevenue,
                                userRevenue: pool.userRevenue,
                                platformRevenue: pool.platformRevenue,
                                totalUsers: pool.totalUsers,
                                totalAdViews: pool.totalAdViews,
                                averageRewardPerAd: pool.averageRewardPerAd,
                                exchangeRateToUSD: Number(pool.exchangeRateToUSD),
                            }); })];
                }
            });
        });
    };
    /**
     * Update user count for a country (called when user profile is updated)
     */
    RevenuePoolService.prototype.updateUserCount = function (countryCode) {
        return __awaiter(this, void 0, void 0, function () {
            var userCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.userProfile.count({
                            where: {
                                country: countryCode,
                                locationLocked: true,
                            },
                        })];
                    case 1:
                        userCount = _a.sent();
                        return [4 /*yield*/, prisma.locationRevenuePool.update({
                                where: { countryCode: countryCode },
                                data: {
                                    totalUsers: userCount,
                                    lastUpdated: new Date(),
                                },
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update exchange rates for reporting (called periodically)
     */
    RevenuePoolService.prototype.updateExchangeRates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var exchangeRates, _i, _a, _b, currency, rate, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        exchangeRates = {
                            ZAR: 18.5, // ZAR to USD
                            USD: 1.0, // USD to USD
                            CAD: 1.35, // CAD to USD
                            GBP: 0.75, // GBP to USD
                            EUR: 0.85, // EUR to USD
                            AUD: 1.45, // AUD to USD
                            JPY: 150.0, // JPY to USD
                            CHF: 0.9, // CHF to USD
                            SEK: 10.5, // SEK to USD
                        };
                        _i = 0, _a = Object.entries(exchangeRates);
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        _b = _a[_i], currency = _b[0], rate = _b[1];
                        return [4 /*yield*/, prisma.locationRevenuePool.updateMany({
                                where: { currency: currency },
                                data: {
                                    exchangeRateToUSD: rate,
                                    lastUpdated: new Date(),
                                },
                            })];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.log('✅ Exchange rates updated for all revenue pools');
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _c.sent();
                        console.error('❌ Error updating exchange rates:', error_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get revenue analytics for admin dashboard
     */
    RevenuePoolService.prototype.getRevenueAnalytics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pools, totalRevenueUSD, totalUsers, totalAdViews;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAllPoolStats()];
                    case 1:
                        pools = _a.sent();
                        totalRevenueUSD = pools.reduce(function (sum, pool) {
                            return sum + Number(pool.totalRevenue) / 100 / pool.exchangeRateToUSD;
                        }, 0);
                        totalUsers = pools.reduce(function (sum, pool) { return sum + pool.totalUsers; }, 0);
                        totalAdViews = pools.reduce(function (sum, pool) { return sum + pool.totalAdViews; }, 0);
                        return [2 /*return*/, {
                                totalRevenueUSD: Math.round(totalRevenueUSD * 100) / 100, // Round to 2 decimal places
                                totalUsers: totalUsers,
                                totalAdViews: totalAdViews,
                                poolCount: pools.length,
                                topCountries: pools.slice(0, 5).map(function (pool) { return ({
                                    country: pool.countryCode,
                                    revenue: Number(pool.totalRevenue),
                                    currency: pool.currency,
                                    users: pool.totalUsers,
                                }); }),
                                revenueByCountry: pools,
                            }];
                }
            });
        });
    };
    return RevenuePoolService;
}());
exports.revenuePoolService = new RevenuePoolService();
