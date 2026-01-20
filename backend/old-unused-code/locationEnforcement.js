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
exports.generateComplianceReport = exports.blockUSDForSouthAfrica = exports.currencyEnforcement = exports.locationVerification = void 0;
var client_1 = require("@prisma/client");
var locationService_js_1 = require("../services/locationService.js");
var prisma = new client_1.PrismaClient();
/**
 * Location verification middleware - CRITICAL for AdMob compliance
 * This middleware must run on every request that involves money/ads
 */
var locationVerification = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var locationData, isMonetaryAction, error_1, isMonetaryAction;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                return [4 /*yield*/, locationService_js_1.locationService.getLocationData(req)];
            case 1:
                locationData = _b.sent();
                req.location = locationData;
                // Check if location is valid (not VPN, high confidence)
                req.isLocationValid = locationService_js_1.locationService.isLocationValid(locationData);
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) return [3 /*break*/, 3];
                return [4 /*yield*/, locationService_js_1.locationService.logSuspiciousActivity(locationData, req.user.id, "".concat(req.method, " ").concat(req.path))];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3:
                isMonetaryAction = req.path.includes('/ads/') ||
                    req.path.includes('/withdraw') ||
                    req.path.includes('/coins/award') ||
                    req.path.includes('/conversions');
                if (isMonetaryAction && !req.isLocationValid) {
                    return [2 /*return*/, res.status(403).json({
                            error: 'Access denied',
                            message: 'Location verification failed. VPN/Proxy usage is not permitted.',
                            code: 'LOCATION_VERIFICATION_FAILED',
                            details: {
                                country: locationData.country,
                                confidence: locationData.confidence,
                                isVPN: locationData.isVPN,
                            },
                        })];
                }
                next();
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                console.error('Location verification error:', error_1);
                isMonetaryAction = req.path.includes('/ads/') ||
                    req.path.includes('/withdraw') ||
                    req.path.includes('/coins/award');
                if (isMonetaryAction) {
                    return [2 /*return*/, res.status(503).json({
                            error: 'Service temporarily unavailable',
                            message: 'Location verification service is currently unavailable.',
                            code: 'LOCATION_SERVICE_ERROR',
                        })];
                }
                next(); // Allow non-monetary actions to proceed
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.locationVerification = locationVerification;
/**
 * Enforce currency restrictions based on location
 */
var currencyEnforcement = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userCountry, requiredCurrency, userProfile, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || !req.location) {
                    return [2 /*return*/, next()];
                }
                userId = req.user.id;
                userCountry = req.location.country;
                requiredCurrency = locationService_js_1.locationService.getCurrencyForCountry(userCountry);
                return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { userId: userId },
                    })];
            case 1:
                userProfile = _b.sent();
                if (!!userProfile) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma.userProfile.create({
                        data: {
                            userId: userId,
                            email: req.user.email,
                            country: userCountry,
                            currency: requiredCurrency,
                            locationLocked: true, // Critical: prevent currency changes
                            verificationData: {
                                ipAddress: req.location.ipAddress,
                                detectedCountry: userCountry,
                                confidence: req.location.confidence,
                                timestamp: new Date().toISOString(),
                            },
                        },
                    })];
            case 2:
                // Create new profile with location-locked currency
                userProfile = _b.sent();
                return [3 /*break*/, 6];
            case 3:
                if (!(userProfile.currency !== requiredCurrency)) return [3 /*break*/, 6];
                // CRITICAL: Currency mismatch detected
                console.error('🚨 CURRENCY VIOLATION DETECTED:', {
                    userId: userId,
                    profileCurrency: userProfile.currency,
                    locationCurrency: requiredCurrency,
                    country: userCountry,
                    ip: req.location.ipAddress,
                    timestamp: new Date().toISOString(),
                });
                // For South African users trying to use USD - strict denial
                if (userCountry === 'ZA' && userProfile.currency === 'USD') {
                    return [2 /*return*/, res.status(403).json({
                            error: 'Currency restriction violation',
                            message: 'USD currency is not available in your region due to regulatory requirements.',
                            code: 'USD_NOT_AVAILABLE_IN_REGION',
                            requiredCurrency: 'ZAR',
                        })];
                }
                // Force update to location-appropriate currency
                return [4 /*yield*/, prisma.userProfile.update({
                        where: { userId: userId },
                        data: {
                            currency: requiredCurrency,
                            country: userCountry,
                            locationLocked: true,
                            verificationData: {
                                ipAddress: req.location.ipAddress,
                                detectedCountry: userCountry,
                                confidence: req.location.confidence,
                                timestamp: new Date().toISOString(),
                                previousCurrency: userProfile.currency, // Track the change
                            },
                        },
                    })
                    // Update associated cash wallet currency
                ];
            case 4:
                // Force update to location-appropriate currency
                _b.sent();
                // Update associated cash wallet currency
                return [4 /*yield*/, prisma.cashWallet.updateMany({
                        where: { userId: userId },
                        data: { currency: requiredCurrency },
                    })];
            case 5:
                // Update associated cash wallet currency
                _b.sent();
                _b.label = 6;
            case 6:
                // Special enforcement for USD-prohibited countries (like South Africa)
                if (userCountry === 'ZA' && requiredCurrency !== 'ZAR') {
                    return [2 /*return*/, res.status(403).json({
                            error: 'Currency not available',
                            message: 'Due to local regulations, only ZAR (South African Rand) is available in South Africa.',
                            code: 'USD_PROHIBITED_ZA',
                        })];
                }
                next();
                return [3 /*break*/, 8];
            case 7:
                error_2 = _b.sent();
                console.error('Currency enforcement error:', error_2);
                res.status(500).json({
                    error: 'Currency enforcement failed',
                    message: 'Unable to verify currency requirements.',
                });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.currencyEnforcement = currencyEnforcement;
/**
 * Middleware to block any request with USD for South African users
 */
var blockUSDForSouthAfrica = function (req, res, next) {
    var _a;
    if (((_a = req.location) === null || _a === void 0 ? void 0 : _a.country) === 'ZA') {
        // Check if request body contains USD currency
        if (req.body &&
            (req.body.currency === 'USD' || req.body.currency === 'usd')) {
            return res.status(403).json({
                error: 'Currency not permitted',
                message: 'USD transactions are not permitted from South Africa due to AdMob policy compliance.',
                code: 'USD_BLOCKED_ZA',
                allowedCurrency: 'ZAR',
            });
        }
        // Check query parameters
        if (req.query &&
            (req.query.currency === 'USD' || req.query.currency === 'usd')) {
            return res.status(403).json({
                error: 'Currency not permitted',
                message: 'USD queries are not permitted from South Africa.',
                code: 'USD_BLOCKED_ZA',
                allowedCurrency: 'ZAR',
            });
        }
    }
    next();
};
exports.blockUSDForSouthAfrica = blockUSDForSouthAfrica;
/**
 * Generate location compliance report for auditing
 */
var generateComplianceReport = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var userProfile;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, prisma.userProfile.findUnique({
                    where: { userId: userId },
                    include: {
                        cashWallet: true,
                        transactions: {
                            take: 5,
                            orderBy: { createdAt: 'desc' },
                        },
                    },
                })];
            case 1:
                userProfile = _c.sent();
                if (!userProfile)
                    return [2 /*return*/, null];
                return [2 /*return*/, {
                        userId: userId,
                        country: userProfile.country,
                        currency: userProfile.currency,
                        locationLocked: userProfile.locationLocked,
                        verificationData: userProfile.verificationData,
                        cashWalletCurrency: (_a = userProfile.cashWallet) === null || _a === void 0 ? void 0 : _a.currency,
                        recentTransactions: userProfile.transactions.length,
                        complianceStatus: userProfile.locationLocked &&
                            userProfile.currency === ((_b = userProfile.cashWallet) === null || _b === void 0 ? void 0 : _b.currency) &&
                            (userProfile.country !== 'ZA' || userProfile.currency === 'ZAR')
                            ? 'COMPLIANT'
                            : 'NON_COMPLIANT',
                        generatedAt: new Date().toISOString(),
                    }];
        }
    });
}); };
exports.generateComplianceReport = generateComplianceReport;
