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
var geoService_1 = require("../services/geoService");
var transactionService_1 = require("../services/transactionService");
var fraudDetection_1 = require("../services/fraudDetection");
var router = (0, express_1.Router)();
var prisma = new client_1.PrismaClient();
var COINS_PER_AD = parseInt(process.env.COINS_PER_AD || '100');
// Get all active ads
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ads, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.ad.findMany({
                        where: { isActive: true },
                        orderBy: { createdAt: 'desc' },
                    })];
            case 1:
                ads = _a.sent();
                res.json(ads);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error fetching ads:', error_1);
                res.status(500).json({ error: 'Failed to fetch ads' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get specific ad
router.get('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var adId, ad, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                adId = parseInt(req.params.id);
                return [4 /*yield*/, prisma.ad.findUnique({
                        where: { id: adId },
                    })];
            case 1:
                ad = _a.sent();
                if (!ad || !ad.isActive) {
                    return [2 /*return*/, res.status(404).json({ error: 'Ad not found' })];
                }
                res.json(ad);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching ad:', error_2);
                res.status(500).json({ error: 'Failed to fetch ad' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Record ad view (legacy endpoint - kept for backward compatibility)
router.post('/:id/watch', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, adId, _a, watchedSeconds, completed, ad, rewardCents, adView, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                userId = req.user.id;
                adId = parseInt(req.params.id);
                _a = req.body, watchedSeconds = _a.watchedSeconds, completed = _a.completed;
                return [4 /*yield*/, prisma.ad.findUnique({
                        where: { id: adId },
                    })];
            case 1:
                ad = _b.sent();
                if (!ad || !ad.isActive) {
                    return [2 /*return*/, res.status(404).json({ error: 'Ad not found' })];
                }
                rewardCents = completed ? ad.rewardCents : 0;
                return [4 /*yield*/, prisma.adView.create({
                        data: {
                            userId: userId,
                            adId: adId,
                            watchedSeconds: watchedSeconds,
                            completed: completed,
                            rewardCents: rewardCents,
                        },
                    })
                    // Update user profile if completed
                ];
            case 2:
                adView = _b.sent();
                if (!completed) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma.userProfile.update({
                        where: { userId: userId },
                        data: {
                            walletBalance: { increment: rewardCents },
                            totalEarned: { increment: rewardCents },
                            adsWatched: { increment: 1 },
                        },
                    })];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                res.json({ adView: adView, rewardCents: rewardCents });
                return [3 /*break*/, 6];
            case 5:
                error_3 = _b.sent();
                console.error('Error recording ad view:', error_3);
                res.status(500).json({ error: 'Failed to record ad view' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Complete ad view - NEW endpoint for coin-based system with VPN-proof location tracking
router.post('/complete', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, adUnitId, watchedSeconds, admobImpressionId, countryCode, estimatedEarnings, currency // AdMob currency
    , ipAddress, userAgent, ipCountry, dailyLimit, rapidCheck, duplicateCheck, vpnCheck, adView, userProfile, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 12, , 13]);
                userId = req.user.id;
                _a = req.body, adUnitId = _a.adUnitId, watchedSeconds = _a.watchedSeconds, admobImpressionId = _a.admobImpressionId, countryCode = _a.countryCode, estimatedEarnings = _a.estimatedEarnings, currency = _a.currency;
                // Validate required fields
                if (!countryCode) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Country code from AdMob is required'
                        })];
                }
                ipAddress = (0, geoService_1.getClientIP)(req);
                userAgent = req.headers['user-agent'] || '';
                ipCountry = (0, geoService_1.detectCountryFromIP)(ipAddress);
                return [4 /*yield*/, (0, fraudDetection_1.checkDailyAdLimit)(userId)];
            case 1:
                dailyLimit = _b.sent();
                if (!dailyLimit.allowed) {
                    return [2 /*return*/, res.status(429).json({
                            success: false,
                            error: 'Daily ad limit reached',
                            remaining: 0
                        })];
                }
                return [4 /*yield*/, (0, fraudDetection_1.checkRapidAdViewing)(userId)];
            case 2:
                rapidCheck = _b.sent();
                if (!rapidCheck.allowed) {
                    return [2 /*return*/, res.status(429).json({
                            success: false,
                            error: rapidCheck.reason || 'Too many ads watched too quickly'
                        })];
                }
                if (!admobImpressionId) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, fraudDetection_1.checkDuplicateImpression)(admobImpressionId)];
            case 3:
                duplicateCheck = _b.sent();
                if (duplicateCheck.duplicate) {
                    return [2 /*return*/, res.status(409).json({
                            success: false,
                            error: 'Duplicate ad impression detected'
                        })];
                }
                _b.label = 4;
            case 4: return [4 /*yield*/, (0, fraudDetection_1.detectVPNMismatch)(userId, ipAddress, countryCode)];
            case 5:
                vpnCheck = _b.sent();
                if (vpnCheck.vpnSuspected) {
                    console.log("\uD83D\uDEA8 VPN detected: User ".concat(userId, ", IP=").concat(vpnCheck.ipCountry, ", AdMob=").concat(vpnCheck.admobCountry));
                    // We still allow the ad, but log the mismatch for monitoring
                }
                return [4 /*yield*/, prisma.adView.create({
                        data: {
                            userId: userId,
                            adUnitId: adUnitId,
                            watchedSeconds: watchedSeconds || 0,
                            completed: true,
                            rewardCents: 0, // Legacy field, not used in coin system
                            coinsEarned: COINS_PER_AD,
                            // AdMob data (TRUSTED - VPN-proof)
                            admobImpressionId: admobImpressionId || undefined,
                            countryCode: countryCode, // SOURCE OF TRUTH for revenue pool
                            estimatedEarningsUsd: estimatedEarnings ? parseFloat(estimatedEarnings) : undefined,
                            admobCurrency: currency || 'USD',
                            // Audit trail (for fraud detection, NOT for location)
                            ipAddress: ipAddress,
                            ipCountry: ipCountry || undefined,
                            userAgent: userAgent,
                            converted: false,
                        },
                    })
                    // 6. Award coins to user (creates transaction record)
                ];
            case 6:
                adView = _b.sent();
                // 6. Award coins to user (creates transaction record)
                return [4 /*yield*/, (0, transactionService_1.awardCoins)(userId, COINS_PER_AD, "Earned ".concat(COINS_PER_AD, " coins for watching ad"), parseInt(adView.id), 'ad_view')
                    // 7. Update user's ad watch count
                ];
            case 7:
                // 6. Award coins to user (creates transaction record)
                _b.sent();
                // 7. Update user's ad watch count
                return [4 /*yield*/, prisma.userProfile.update({
                        where: { userId: userId },
                        data: {
                            adsWatched: { increment: 1 },
                        },
                    })
                    // 8. Track user's revenue country
                ];
            case 8:
                // 7. Update user's ad watch count
                _b.sent();
                // 8. Track user's revenue country
                return [4 /*yield*/, (0, fraudDetection_1.trackUserRevenueCountry)(userId, countryCode)
                    // 9. Update user's last known IP location
                ];
            case 9:
                // 8. Track user's revenue country
                _b.sent();
                // 9. Update user's last known IP location
                return [4 /*yield*/, (0, fraudDetection_1.updateUserLocation)(userId, ipAddress)
                    // Get updated user profile to return current balance
                ];
            case 10:
                // 9. Update user's last known IP location
                _b.sent();
                return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { userId: userId },
                        select: { coinsBalance: true },
                    })];
            case 11:
                userProfile = _b.sent();
                res.json({
                    success: true,
                    coinsEarned: COINS_PER_AD,
                    totalCoins: (userProfile === null || userProfile === void 0 ? void 0 : userProfile.coinsBalance.toString()) || '0',
                    message: "You earned ".concat(COINS_PER_AD, " coins!"),
                    remaining: dailyLimit.remaining - 1,
                    vpnDetected: vpnCheck.vpnSuspected,
                });
                return [3 /*break*/, 13];
            case 12:
                error_4 = _b.sent();
                console.error('Error completing ad view:', error_4);
                res.status(500).json({
                    success: false,
                    error: 'Failed to complete ad view'
                });
                return [3 /*break*/, 13];
            case 13: return [2 /*return*/];
        }
    });
}); });
// Track ad impression with revenue data
router.post('/track-impression', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, adType, adUnitId, revenueUsd, country, currency, userEarningsUsd, companyRevenueUsd, userShare, impression, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = req.user.id;
                _a = req.body, adType = _a.adType, adUnitId = _a.adUnitId, revenueUsd = _a.revenueUsd, country = _a.country, currency = _a.currency;
                // Validate required fields
                if (!adType || !adUnitId || !country) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Missing required fields: adType, adUnitId, country',
                        })];
                }
                userEarningsUsd = 0;
                companyRevenueUsd = parseFloat(revenueUsd || '0');
                if (adType === 'rewarded') {
                    userShare = parseFloat(process.env.USER_REVENUE_SHARE || '0.85');
                    userEarningsUsd = companyRevenueUsd * userShare;
                    companyRevenueUsd = companyRevenueUsd * (1 - userShare);
                }
                return [4 /*yield*/, prisma.adImpression.create({
                        data: {
                            userId: userId,
                            adType: adType,
                            adUnitId: adUnitId,
                            revenueUsd: parseFloat(revenueUsd || '0'),
                            userEarningsUsd: userEarningsUsd,
                            companyRevenueUsd: companyRevenueUsd,
                            country: country,
                            currency: currency || 'USD',
                        },
                    })];
            case 1:
                impression = _b.sent();
                res.json({
                    success: true,
                    impressionId: impression.id,
                    userEarningsUsd: userEarningsUsd,
                    companyRevenueUsd: companyRevenueUsd,
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _b.sent();
                console.error('Error tracking ad impression:', error_5);
                res.status(500).json({
                    success: false,
                    error: 'Failed to track ad impression',
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
