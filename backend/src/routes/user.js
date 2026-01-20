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
var geoService_1 = require("../services/geoService");
var router = (0, express_1.Router)();
var prisma = new client_1.PrismaClient();
// Setup user profile (first-time setup)
router.post('/setup-profile', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, displayName, avatarEmoji, avatarUrl, countryBadge, hideCountry, showOnLeaderboard, existingUser, profile, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                userId = req.user.id;
                _a = req.body, displayName = _a.displayName, avatarEmoji = _a.avatarEmoji, avatarUrl = _a.avatarUrl, countryBadge = _a.countryBadge, hideCountry = _a.hideCountry, showOnLeaderboard = _a.showOnLeaderboard;
                if (!displayName) return [3 /*break*/, 2];
                if (displayName.length < 3 || displayName.length > 20) {
                    return [2 /*return*/, res.status(400).json({ error: 'Display name must be between 3 and 20 characters' })];
                }
                if (!/^[a-zA-Z0-9_]+$/.test(displayName)) {
                    return [2 /*return*/, res.status(400).json({ error: 'Display name can only contain letters, numbers, and underscores' })];
                }
                return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { displayName: displayName },
                    })];
            case 1:
                existingUser = _b.sent();
                if (existingUser && existingUser.userId !== userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Display name is already taken' })];
                }
                _b.label = 2;
            case 2: return [4 /*yield*/, prisma.userProfile.update({
                    where: { userId: userId },
                    data: {
                        displayName: displayName || undefined,
                        avatarEmoji: avatarEmoji || undefined,
                        avatarUrl: avatarUrl || undefined,
                        countryBadge: countryBadge || undefined,
                        hideCountry: hideCountry !== undefined ? hideCountry : false,
                        showOnLeaderboard: showOnLeaderboard !== undefined ? showOnLeaderboard : true,
                        profileSetupCompleted: true,
                    },
                })];
            case 3:
                profile = _b.sent();
                res.json(profile);
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                console.error('Error setting up profile:', error_1);
                res.status(500).json({ error: 'Failed to setup profile' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Get user profile
router.get('/profile', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, profile, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                userId = req.user.id;
                return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { userId: userId },
                    })
                    // Create profile if it doesn't exist
                ];
            case 1:
                profile = _a.sent();
                if (!!profile) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.userProfile.create({
                        data: {
                            userId: userId,
                            email: req.user.email,
                        },
                    })];
            case 2:
                profile = _a.sent();
                return [3 /*break*/, 5];
            case 3: 
            // Update lastLogin
            return [4 /*yield*/, prisma.userProfile.update({
                    where: { userId: userId },
                    data: { lastLogin: new Date() },
                })];
            case 4:
                // Update lastLogin
                _a.sent();
                _a.label = 5;
            case 5:
                res.json(profile);
                return [3 /*break*/, 7];
            case 6:
                error_2 = _a.sent();
                console.error('Error fetching profile:', error_2);
                res.status(500).json({ error: 'Failed to fetch profile' });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
// Update user profile
router.put('/profile', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, name_1, country, paypalEmail, preferredCurrency, autoDetectCurrency, displayName, avatarEmoji, avatarUrl, countryBadge, hideCountry, showOnLeaderboard, updateData, existingUser, profile, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                userId = req.user.id;
                _a = req.body, name_1 = _a.name, country = _a.country, paypalEmail = _a.paypalEmail, preferredCurrency = _a.preferredCurrency, autoDetectCurrency = _a.autoDetectCurrency, displayName = _a.displayName, avatarEmoji = _a.avatarEmoji, avatarUrl = _a.avatarUrl, countryBadge = _a.countryBadge, hideCountry = _a.hideCountry, showOnLeaderboard = _a.showOnLeaderboard;
                updateData = {};
                if (name_1 !== undefined)
                    updateData.name = name_1;
                if (country !== undefined)
                    updateData.country = country;
                if (paypalEmail !== undefined)
                    updateData.paypalEmail = paypalEmail;
                if (preferredCurrency !== undefined)
                    updateData.preferredCurrency = preferredCurrency;
                if (autoDetectCurrency !== undefined)
                    updateData.autoDetectCurrency = autoDetectCurrency;
                if (!(displayName !== undefined)) return [3 /*break*/, 3];
                if (displayName && (displayName.length < 3 || displayName.length > 20)) {
                    return [2 /*return*/, res.status(400).json({ error: 'Display name must be between 3 and 20 characters' })];
                }
                if (displayName && !/^[a-zA-Z0-9_]+$/.test(displayName)) {
                    return [2 /*return*/, res.status(400).json({ error: 'Display name can only contain letters, numbers, and underscores' })];
                }
                if (!displayName) return [3 /*break*/, 2];
                return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { displayName: displayName },
                    })];
            case 1:
                existingUser = _b.sent();
                if (existingUser && existingUser.userId !== userId) {
                    return [2 /*return*/, res.status(400).json({ error: 'Display name is already taken' })];
                }
                _b.label = 2;
            case 2:
                updateData.displayName = displayName || null;
                _b.label = 3;
            case 3:
                if (avatarEmoji !== undefined)
                    updateData.avatarEmoji = avatarEmoji;
                if (avatarUrl !== undefined)
                    updateData.avatarUrl = avatarUrl;
                if (countryBadge !== undefined)
                    updateData.countryBadge = countryBadge;
                if (hideCountry !== undefined)
                    updateData.hideCountry = hideCountry;
                if (showOnLeaderboard !== undefined)
                    updateData.showOnLeaderboard = showOnLeaderboard;
                return [4 /*yield*/, prisma.userProfile.update({
                        where: { userId: userId },
                        data: updateData,
                    })];
            case 4:
                profile = _b.sent();
                res.json(profile);
                return [3 /*break*/, 6];
            case 5:
                error_3 = _b.sent();
                console.error('Error updating profile:', error_3);
                res.status(500).json({ error: 'Failed to update profile' });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Get user balance in local currency
router.get('/balance', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, ipAddress, profile, cashUSD, currencyInfo, cashLocal, cashLocalFormatted, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                userId = req.user.id;
                ipAddress = (0, geoService_1.getClientIP)(req);
                return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { userId: userId },
                        select: {
                            coinsBalance: true,
                            cashBalanceUsd: true,
                            preferredCurrency: true,
                        },
                    })];
            case 1:
                profile = _a.sent();
                if (!profile) {
                    return [2 /*return*/, res.status(404).json({ error: 'Profile not found' })];
                }
                cashUSD = parseFloat(profile.cashBalanceUsd.toString());
                return [4 /*yield*/, (0, currencyService_1.getUserCurrencyInfo)(userId, ipAddress)];
            case 2:
                currencyInfo = _a.sent();
                cashLocal = cashUSD * currencyInfo.exchangeRate;
                cashLocalFormatted = "".concat(currencyInfo.formatting.symbol).concat(cashLocal.toFixed(currencyInfo.formatting.decimals));
                res.json({
                    coins: profile.coinsBalance.toString(),
                    cashUsd: cashUSD.toFixed(4),
                    cashLocal: cashLocal.toFixed(2),
                    cashLocalFormatted: cashLocalFormatted,
                    displayCurrency: currencyInfo.displayCurrency,
                    displayCountry: currencyInfo.displayCountry,
                    revenueCountry: currencyInfo.revenueCountry,
                    exchangeRate: currencyInfo.exchangeRate.toFixed(6),
                    currencySymbol: currencyInfo.formatting.symbol,
                    currencyPosition: currencyInfo.formatting.position,
                });
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.error('Error fetching balance:', error_4);
                res.status(500).json({ error: 'Failed to fetch balance' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Get user's currency info
router.get('/currency-info', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, ipAddress, currencyInfo, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.user.id;
                ipAddress = (0, geoService_1.getClientIP)(req);
                return [4 /*yield*/, (0, currencyService_1.getUserCurrencyInfo)(userId, ipAddress)];
            case 1:
                currencyInfo = _a.sent();
                res.json(currencyInfo);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('Error fetching currency info:', error_5);
                res.status(500).json({ error: 'Failed to fetch currency info' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get user transaction history
router.get('/transactions', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, page, perPage, type, result, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.user.id;
                page = parseInt(req.query.page) || 1;
                perPage = parseInt(req.query.perPage) || 20;
                type = req.query.type;
                return [4 /*yield*/, (0, transactionService_1.getUserTransactions)(userId, page, perPage, type)];
            case 1:
                result = _a.sent();
                res.json(result);
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('Error fetching transactions:', error_6);
                res.status(500).json({ error: 'Failed to fetch transactions' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Detect country from IP
router.get('/detect-country', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var ipAddress, countryCode;
    return __generator(this, function (_a) {
        try {
            ipAddress = (0, geoService_1.getClientIP)(req);
            countryCode = (0, geoService_1.detectCountryFromIP)(ipAddress);
            res.json({
                countryCode: countryCode,
                ipAddress: ipAddress !== 'unknown' ? ipAddress : null
            });
        }
        catch (error) {
            console.error('Error detecting country:', error);
            res.status(500).json({ error: 'Failed to detect country' });
        }
        return [2 /*return*/];
    });
}); });
exports.default = router;
