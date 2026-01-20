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
exports.VIDEO_LIMITS = void 0;
exports.getUserVideoCapStatus = getUserVideoCapStatus;
exports.canWatchRewardedVideo = canWatchRewardedVideo;
exports.recordRewardedVideoWatch = recordRewardedVideoWatch;
exports.recordInterstitialWatch = recordInterstitialWatch;
exports.getTimeUntilReset = getTimeUntilReset;
exports.getVideoCapDisplay = getVideoCapDisplay;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// Tier-based video limits
exports.VIDEO_LIMITS = {
    Bronze: 30,
    Silver: 30,
    Gold: 40,
};
// Free tier interstitial settings
var FREE_TIER_INTERSTITIAL_INTERVAL = 20; // Show interstitial after 20 rewarded videos
var FREE_TIER_INTERSTITIAL_UNLOCK = 2; // Unlock 2 more rewarded videos
/**
 * Get user's current video cap status
 */
function getUserVideoCapStatus(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var profile, now, lastReset, needsReset, dailyLimit, remaining, needsInterstitial, videosSinceLastInterstitial;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { userId: userId },
                        select: {
                            tier: true,
                            dailyVideosWatched: true,
                            forcedAdsWatched: true,
                            lastVideoResetAt: true,
                        },
                    })];
                case 1:
                    profile = _a.sent();
                    if (!profile) {
                        throw new Error('User profile not found');
                    }
                    now = new Date();
                    lastReset = new Date(profile.lastVideoResetAt);
                    needsReset = shouldResetDailyVideos(lastReset, now);
                    if (!needsReset) return [3 /*break*/, 3];
                    return [4 /*yield*/, resetDailyVideos(userId)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, {
                            tier: profile.tier,
                            dailyLimit: exports.VIDEO_LIMITS[profile.tier] || exports.VIDEO_LIMITS.Bronze,
                            videosWatched: 0,
                            forcedAdsWatched: 0,
                            remaining: exports.VIDEO_LIMITS[profile.tier] || exports.VIDEO_LIMITS.Bronze,
                            canWatchVideo: true,
                            needsInterstitial: false,
                            resetAt: now,
                        }];
                case 3:
                    dailyLimit = exports.VIDEO_LIMITS[profile.tier] || exports.VIDEO_LIMITS.Bronze;
                    remaining = Math.max(0, dailyLimit - profile.dailyVideosWatched);
                    needsInterstitial = false;
                    if (profile.tier === 'Bronze' && remaining > 0) {
                        videosSinceLastInterstitial = profile.dailyVideosWatched - (profile.forcedAdsWatched * FREE_TIER_INTERSTITIAL_INTERVAL);
                        needsInterstitial = videosSinceLastInterstitial >= FREE_TIER_INTERSTITIAL_INTERVAL;
                    }
                    return [2 /*return*/, {
                            tier: profile.tier,
                            dailyLimit: dailyLimit,
                            videosWatched: profile.dailyVideosWatched,
                            forcedAdsWatched: profile.forcedAdsWatched,
                            remaining: remaining,
                            canWatchVideo: remaining > 0 && !needsInterstitial,
                            needsInterstitial: needsInterstitial,
                            resetAt: getNextResetTime(lastReset),
                        }];
            }
        });
    });
}
/**
 * Check if user can watch a rewarded video
 */
function canWatchRewardedVideo(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var status;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getUserVideoCapStatus(userId)];
                case 1:
                    status = _a.sent();
                    if (status.videosWatched >= status.dailyLimit) {
                        return [2 /*return*/, {
                                allowed: false,
                                reason: 'Daily video limit reached',
                                status: status,
                            }];
                    }
                    if (status.needsInterstitial) {
                        return [2 /*return*/, {
                                allowed: false,
                                reason: 'Must watch interstitial ad first',
                                status: status,
                            }];
                    }
                    return [2 /*return*/, {
                            allowed: true,
                            status: status,
                        }];
            }
        });
    });
}
/**
 * Record a rewarded video watch
 */
function recordRewardedVideoWatch(userId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.userProfile.update({
                        where: { userId: userId },
                        data: {
                            dailyVideosWatched: { increment: 1 },
                        },
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Record an interstitial watch (unlocks more videos for Free tier)
 */
function recordInterstitialWatch(userId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.userProfile.update({
                        where: { userId: userId },
                        data: {
                            forcedAdsWatched: { increment: 1 },
                        },
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if daily videos should be reset
 */
function shouldResetDailyVideos(lastReset, now) {
    // Check if it's a new day (midnight has passed)
    var lastResetDay = new Date(lastReset);
    lastResetDay.setHours(0, 0, 0, 0);
    var nowDay = new Date(now);
    nowDay.setHours(0, 0, 0, 0);
    return nowDay > lastResetDay;
}
/**
 * Reset daily video count
 */
function resetDailyVideos(userId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.userProfile.update({
                        where: { userId: userId },
                        data: {
                            dailyVideosWatched: 0,
                            forcedAdsWatched: 0,
                            lastVideoResetAt: new Date(),
                        },
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Get next reset time (midnight in user's timezone)
 */
function getNextResetTime(lastReset) {
    var nextReset = new Date(lastReset);
    nextReset.setDate(nextReset.getDate() + 1);
    nextReset.setHours(0, 0, 0, 0);
    return nextReset;
}
/**
 * Get time until next reset
 */
function getTimeUntilReset(resetAt) {
    var now = new Date();
    var diff = resetAt.getTime() - now.getTime();
    if (diff <= 0)
        return '0h 0m';
    var hours = Math.floor(diff / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return "".concat(hours, "h ").concat(minutes, "m");
}
/**
 * Get video cap info for display
 */
function getVideoCapDisplay(status) {
    var videosWatched = status.videosWatched, dailyLimit = status.dailyLimit, tier = status.tier, needsInterstitial = status.needsInterstitial, resetAt = status.resetAt;
    var nextMilestone = '';
    if (tier === 'Bronze' && needsInterstitial) {
        nextMilestone = 'Watch 1 ad to unlock 2 more videos';
    }
    else if (videosWatched < dailyLimit) {
        var remaining = dailyLimit - videosWatched;
        nextMilestone = "".concat(remaining, " videos remaining today");
    }
    else {
        nextMilestone = 'Daily limit reached';
    }
    return {
        currentProgress: "Videos watched today: ".concat(videosWatched, "/").concat(dailyLimit),
        nextMilestone: nextMilestone,
        resetTime: "Resets in ".concat(getTimeUntilReset(resetAt)),
    };
}
