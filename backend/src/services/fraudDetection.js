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
exports.checkDailyAdLimit = checkDailyAdLimit;
exports.checkRapidAdViewing = checkRapidAdViewing;
exports.checkDuplicateImpression = checkDuplicateImpression;
exports.detectVPNMismatch = detectVPNMismatch;
exports.trackUserRevenueCountry = trackUserRevenueCountry;
exports.updateUserLocation = updateUserLocation;
exports.getFraudStats = getFraudStats;
exports.getSuspiciousUsers = getSuspiciousUsers;
exports.getVPNDetections = getVPNDetections;
var client_1 = require("@prisma/client");
var geoService_1 = require("./geoService");
var prisma = new client_1.PrismaClient();
// Rate limiting constants
var MAX_ADS_PER_DAY = parseInt(process.env.MAX_ADS_PER_DAY || '200');
var MAX_ADS_PER_5_MINUTES = parseInt(process.env.MAX_ADS_PER_5_MINUTES || '10');
var VPN_SUSPICION_THRESHOLD = parseInt(process.env.VPN_SUSPICION_THRESHOLD || '10');
/**
 * Check if user has exceeded daily ad limit
 */
function checkDailyAdLimit(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var startOfDay, todayViews, remaining;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startOfDay = new Date();
                    startOfDay.setHours(0, 0, 0, 0);
                    return [4 /*yield*/, prisma.adView.count({
                            where: {
                                userId: userId,
                                createdAt: { gte: startOfDay }
                            }
                        })];
                case 1:
                    todayViews = _a.sent();
                    remaining = Math.max(0, MAX_ADS_PER_DAY - todayViews);
                    return [2 /*return*/, {
                            allowed: todayViews < MAX_ADS_PER_DAY,
                            remaining: remaining
                        }];
            }
        });
    });
}
/**
 * Check if user is watching ads too quickly (possible bot)
 */
function checkRapidAdViewing(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var fiveMinutesAgo, recentViews;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fiveMinutesAgo = new Date();
                    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
                    return [4 /*yield*/, prisma.adView.count({
                            where: {
                                userId: userId,
                                createdAt: { gte: fiveMinutesAgo }
                            }
                        })];
                case 1:
                    recentViews = _a.sent();
                    if (recentViews >= MAX_ADS_PER_5_MINUTES) {
                        return [2 /*return*/, {
                                allowed: false,
                                reason: "Too many ads watched in 5 minutes (".concat(recentViews, "/").concat(MAX_ADS_PER_5_MINUTES, ")")
                            }];
                    }
                    return [2 /*return*/, { allowed: true }];
            }
        });
    });
}
/**
 * Check if impression ID has already been used (duplicate claim prevention)
 */
function checkDuplicateImpression(impressionId) {
    return __awaiter(this, void 0, void 0, function () {
        var existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!impressionId) {
                        return [2 /*return*/, { duplicate: false }];
                    }
                    return [4 /*yield*/, prisma.adView.findUnique({
                            where: { admobImpressionId: impressionId }
                        })];
                case 1:
                    existing = _a.sent();
                    return [2 /*return*/, { duplicate: !!existing }];
            }
        });
    });
}
/**
 * Detect VPN usage by comparing IP location vs AdMob location
 * Returns true if mismatch detected (possible VPN)
 */
function detectVPNMismatch(userId, ipAddress, admobCountryCode) {
    return __awaiter(this, void 0, void 0, function () {
        var ipCountry, vpnSuspected, profile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ipCountry = (0, geoService_1.detectCountryFromIP)(ipAddress);
                    // If we can't detect IP country, we can't determine mismatch
                    if (!ipCountry) {
                        return [2 /*return*/, {
                                vpnSuspected: false,
                                ipCountry: null,
                                admobCountry: admobCountryCode
                            }];
                    }
                    vpnSuspected = ipCountry !== admobCountryCode;
                    if (!vpnSuspected) return [3 /*break*/, 4];
                    // Log the mismatch
                    console.log("\uD83D\uDEA8 VPN mismatch detected for user ".concat(userId, ": IP=").concat(ipCountry, ", AdMob=").concat(admobCountryCode));
                    // Increment user's VPN suspicion score
                    return [4 /*yield*/, prisma.userProfile.update({
                            where: { userId: userId },
                            data: {
                                vpnSuspicionScore: { increment: 1 }
                            }
                        })
                        // Check if suspicion score exceeds threshold
                    ];
                case 1:
                    // Increment user's VPN suspicion score
                    _a.sent();
                    return [4 /*yield*/, prisma.userProfile.findUnique({
                            where: { userId: userId },
                            select: { vpnSuspicionScore: true }
                        })];
                case 2:
                    profile = _a.sent();
                    if (!(profile && profile.vpnSuspicionScore >= VPN_SUSPICION_THRESHOLD)) return [3 /*break*/, 4];
                    // Flag as suspicious
                    return [4 /*yield*/, prisma.userProfile.update({
                            where: { userId: userId },
                            data: { suspiciousActivity: true }
                        })];
                case 3:
                    // Flag as suspicious
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, {
                        vpnSuspected: vpnSuspected,
                        ipCountry: ipCountry,
                        admobCountry: admobCountryCode
                    }];
            }
        });
    });
}
/**
 * Track user's earning countries (for detecting multi-location abuse)
 */
function trackUserRevenueCountry(userId, countryCode) {
    return __awaiter(this, void 0, void 0, function () {
        var profile, updates;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { userId: userId },
                        select: {
                            revenueCountry: true,
                            revenueCountries: true
                        }
                    })];
                case 1:
                    profile = _a.sent();
                    if (!profile)
                        return [2 /*return*/];
                    updates = {};
                    if (!profile.revenueCountry) {
                        updates.revenueCountry = countryCode;
                    }
                    // Add to revenue countries array if not already present
                    if (!profile.revenueCountries.includes(countryCode)) {
                        updates.revenueCountries = {
                            push: countryCode
                        };
                    }
                    // If user has earned from more than 5 different countries, flag as suspicious
                    if (profile.revenueCountries.length >= 5 && !profile.revenueCountries.includes(countryCode)) {
                        console.log("\uD83D\uDEA8 User ".concat(userId, " has earned from ").concat(profile.revenueCountries.length + 1, " countries"));
                        updates.suspiciousActivity = true;
                    }
                    if (!(Object.keys(updates).length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma.userProfile.update({
                            where: { userId: userId },
                            data: updates
                        })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update user's last known location for fraud tracking
 */
function updateUserLocation(userId, ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var ipCountry;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ipCountry = (0, geoService_1.detectCountryFromIP)(ipAddress);
                    return [4 /*yield*/, prisma.userProfile.update({
                            where: { userId: userId },
                            data: {
                                lastIpAddress: ipAddress,
                                lastDetectedCountry: ipCountry || undefined
                            }
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Get fraud statistics for admin dashboard
 */
function getFraudStats() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, suspicious, highVpn, allUsers, multiCountry;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        prisma.userProfile.count({
                            where: { suspiciousActivity: true }
                        }),
                        prisma.userProfile.count({
                            where: { vpnSuspicionScore: { gte: VPN_SUSPICION_THRESHOLD } }
                        })
                    ])
                    // Count users with multiple countries (3 or more)
                ];
                case 1:
                    _a = _b.sent(), suspicious = _a[0], highVpn = _a[1];
                    return [4 /*yield*/, prisma.userProfile.findMany({
                            where: {
                                revenueCountries: {
                                    isEmpty: false
                                }
                            },
                            select: {
                                revenueCountries: true
                            }
                        })];
                case 2:
                    allUsers = _b.sent();
                    multiCountry = allUsers.filter(function (u) { return u.revenueCountries.length >= 3; }).length;
                    return [2 /*return*/, {
                            totalSuspiciousUsers: suspicious,
                            highVpnSuspicionUsers: highVpn,
                            multiCountryUsers: multiCountry
                        }];
            }
        });
    });
}
/**
 * Get suspicious users list for admin review
 */
function getSuspiciousUsers() {
    return __awaiter(this, arguments, void 0, function (page, perPage) {
        var skip, allUsers, filtered, total, users;
        if (page === void 0) { page = 1; }
        if (perPage === void 0) { perPage = 50; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    skip = (page - 1) * perPage;
                    return [4 /*yield*/, prisma.userProfile.findMany({
                            where: {
                                OR: [
                                    { suspiciousActivity: true },
                                    { vpnSuspicionScore: { gte: 5 } }
                                ]
                            },
                            select: {
                                userId: true,
                                email: true,
                                name: true,
                                revenueCountry: true,
                                revenueCountries: true,
                                vpnSuspicionScore: true,
                                suspiciousActivity: true,
                                lastIpAddress: true,
                                lastDetectedCountry: true,
                                adsWatched: true,
                                createdAt: true
                            },
                            orderBy: [
                                { suspiciousActivity: 'desc' },
                                { vpnSuspicionScore: 'desc' }
                            ]
                        })
                        // Filter for users with 3+ countries or already flagged
                    ];
                case 1:
                    allUsers = _a.sent();
                    filtered = allUsers.filter(function (u) {
                        return u.suspiciousActivity ||
                            u.vpnSuspicionScore >= 5 ||
                            u.revenueCountries.length >= 3;
                    });
                    total = filtered.length;
                    users = filtered.slice(skip, skip + perPage);
                    return [2 /*return*/, {
                            users: users,
                            total: total,
                            pages: Math.ceil(total / perPage),
                            currentPage: page
                        }];
            }
        });
    });
}
/**
 * Get VPN detection records for a user
 */
function getVPNDetections(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var adViews, mismatches, groupedMismatches;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.adView.findMany({
                        where: {
                            userId: userId,
                            ipCountry: { not: null },
                            countryCode: { not: null }
                        },
                        select: {
                            id: true,
                            ipCountry: true,
                            countryCode: true,
                            ipAddress: true,
                            createdAt: true
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 100
                    })
                    // Filter to mismatches
                ];
                case 1:
                    adViews = _a.sent();
                    mismatches = adViews.filter(function (view) { return view.ipCountry !== view.countryCode; });
                    groupedMismatches = mismatches.reduce(function (acc, view) {
                        var key = "".concat(view.ipCountry, "-").concat(view.countryCode);
                        if (!acc[key]) {
                            acc[key] = {
                                ipCountry: view.ipCountry,
                                admobCountry: view.countryCode,
                                count: 0,
                                lastDetected: view.createdAt
                            };
                        }
                        acc[key].count++;
                        if (view.createdAt > acc[key].lastDetected) {
                            acc[key].lastDetected = view.createdAt;
                        }
                        return acc;
                    }, {});
                    return [2 /*return*/, Object.values(groupedMismatches)];
            }
        });
    });
}
