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
exports.locationService = void 0;
var geoip_lite_1 = require("geoip-lite");
var node_fetch_1 = require("node-fetch");
// Supported countries and their currencies
var COUNTRY_CURRENCY_MAP = {
    ZA: 'ZAR', // South Africa - Rand (no USD allowed)
    US: 'USD', // United States - Dollar
    CA: 'CAD', // Canada - Dollar
    GB: 'GBP', // United Kingdom - Pound
    AU: 'AUD', // Australia - Dollar
    DE: 'EUR', // Germany - Euro
    FR: 'EUR', // France - Euro
    ES: 'EUR', // Spain - Euro
    IT: 'EUR', // Italy - Euro
    NL: 'EUR', // Netherlands - Euro
    JP: 'JPY', // Japan - Yen
    CH: 'CHF', // Switzerland - Franc
    SE: 'SEK', // Sweden - Krona
};
// Countries where USD is strictly prohibited (AdMob compliance)
var USD_PROHIBITED_COUNTRIES = ['ZA']; // South Africa
// VPN/Proxy detection indicators
var SUSPICIOUS_INDICATORS = [
    'tor-exit',
    'proxy',
    'vpn',
    'anonymizer',
    'datacenter',
    'hosting',
];
var LocationService = /** @class */ (function () {
    function LocationService() {
        this.vpnApiKey = process.env.VPN_DETECTION_API_KEY;
    }
    /**
     * Get real IP address from request (handles proxies and load balancers)
     */
    LocationService.prototype.getRealIP = function (req) {
        var _a;
        return (req.headers['cf-connecting-ip'] || // Cloudflare
            ((_a = req.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.split(',')[0]) || // Proxy
            req.headers['x-real-ip'] || // Nginx
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            '127.0.0.1');
    };
    /**
     * Detect VPN/Proxy using multiple methods
     */
    LocationService.prototype.detectVPN = function (ip) {
        return __awaiter(this, void 0, void 0, function () {
            var geo_1, vpnScore, confidence, response, data, error_1, ipParts, isPrivate, error_2;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 6, , 7]);
                        geo_1 = geoip_lite_1.default.lookup(ip);
                        if (!geo_1) {
                            return [2 /*return*/, { isVPN: false, confidence: 0.1 }]; // No data = low confidence
                        }
                        vpnScore = 0;
                        confidence = 0.5;
                        // Method 2: ASN-based detection (hosting providers often indicate VPN)
                        if (geo_1.region &&
                            SUSPICIOUS_INDICATORS.some(function (indicator) {
                                return geo_1.region.toLowerCase().includes(indicator);
                            })) {
                            vpnScore += 0.4;
                        }
                        if (!this.vpnApiKey) return [3 /*break*/, 5];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, (0, node_fetch_1.default)("https://vpnapi.io/api/".concat(ip, "?key=").concat(this.vpnApiKey), { timeout: 3000 })];
                    case 2:
                        response = _d.sent();
                        return [4 /*yield*/, response.json()];
                    case 3:
                        data = _d.sent();
                        if (((_a = data.security) === null || _a === void 0 ? void 0 : _a.vpn) ||
                            ((_b = data.security) === null || _b === void 0 ? void 0 : _b.proxy) ||
                            ((_c = data.security) === null || _c === void 0 ? void 0 : _c.tor)) {
                            vpnScore += 0.6;
                            confidence = 0.9;
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _d.sent();
                        console.warn('VPN detection API failed:', error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        ipParts = ip.split('.').map(Number);
                        isPrivate = ipParts[0] === 10 ||
                            (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) ||
                            (ipParts[0] === 192 && ipParts[1] === 168);
                        if (isPrivate) {
                            vpnScore += 0.3;
                        }
                        return [2 /*return*/, {
                                isVPN: vpnScore > 0.5,
                                confidence: Math.min(confidence + vpnScore * 0.2, 1.0),
                            }];
                    case 6:
                        error_2 = _d.sent();
                        console.error('VPN detection failed:', error_2);
                        return [2 /*return*/, { isVPN: false, confidence: 0.1 }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get comprehensive location data with VPN detection
     */
    LocationService.prototype.getLocationData = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var ip, geo, vpnDetection, country, countryName, currency, userAgent, isSuspicious, confidence;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        ip = this.getRealIP(req);
                        geo = geoip_lite_1.default.lookup(ip);
                        return [4 /*yield*/, this.detectVPN(ip)
                            // Default to South Africa if no geo data (conservative approach for AdMob compliance)
                        ];
                    case 1:
                        vpnDetection = _c.sent();
                        country = (geo === null || geo === void 0 ? void 0 : geo.country) || 'ZA';
                        countryName = this.getCountryName(country);
                        currency = this.getCurrencyForCountry(country);
                        userAgent = req.headers['user-agent'] || '';
                        isSuspicious = vpnDetection.isVPN ||
                            !userAgent ||
                            userAgent.length < 20 || // Too short user agent
                            userAgent.includes('bot') ||
                            userAgent.includes('crawler');
                        confidence = vpnDetection.confidence;
                        if (!geo)
                            confidence *= 0.3; // No geo data reduces confidence
                        if (isSuspicious)
                            confidence *= 0.5; // Suspicious activity reduces confidence
                        return [2 /*return*/, {
                                country: country,
                                countryName: countryName,
                                currency: currency,
                                city: geo === null || geo === void 0 ? void 0 : geo.city,
                                region: geo === null || geo === void 0 ? void 0 : geo.region,
                                latitude: (_a = geo === null || geo === void 0 ? void 0 : geo.ll) === null || _a === void 0 ? void 0 : _a[0],
                                longitude: (_b = geo === null || geo === void 0 ? void 0 : geo.ll) === null || _b === void 0 ? void 0 : _b[1],
                                timezone: geo === null || geo === void 0 ? void 0 : geo.timezone,
                                isVPN: vpnDetection.isVPN,
                                isSuspicious: isSuspicious,
                                confidence: Math.max(confidence, 0.1), // Minimum 10% confidence
                                ipAddress: ip,
                            }];
                }
            });
        });
    };
    /**
     * Validate if user can use USD currency (AdMob compliance)
     */
    LocationService.prototype.canUseUSD = function (country) {
        return !USD_PROHIBITED_COUNTRIES.includes(country.toUpperCase());
    };
    /**
     * Get currency for country (strict mapping)
     */
    LocationService.prototype.getCurrencyForCountry = function (country) {
        return COUNTRY_CURRENCY_MAP[country.toUpperCase()] || 'ZAR'; // Default to ZAR for safety
    };
    /**
     * Validate location data meets minimum requirements
     */
    LocationService.prototype.isLocationValid = function (locationData) {
        return (!locationData.isVPN &&
            !locationData.isSuspicious &&
            locationData.confidence > 0.6 && // Minimum 60% confidence
            locationData.country in COUNTRY_CURRENCY_MAP);
    };
    /**
     * Get human-readable country name
     */
    LocationService.prototype.getCountryName = function (countryCode) {
        var countryNames = {
            ZA: 'South Africa',
            US: 'United States',
            CA: 'Canada',
            GB: 'United Kingdom',
            AU: 'Australia',
            DE: 'Germany',
            FR: 'France',
            ES: 'Spain',
            IT: 'Italy',
            NL: 'Netherlands',
            JP: 'Japan',
            CH: 'Switzerland',
            SE: 'Sweden',
        };
        return countryNames[countryCode.toUpperCase()] || 'Unknown Country';
    };
    /**
     * Log suspicious activity for monitoring
     */
    LocationService.prototype.logSuspiciousActivity = function (locationData, userId, action) {
        return __awaiter(this, void 0, void 0, function () {
            var PrismaClient, prisma, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(locationData.isSuspicious || locationData.isVPN)) return [3 /*break*/, 6];
                        console.warn('🚨 SUSPICIOUS ACTIVITY DETECTED:', {
                            userId: userId,
                            action: action,
                            ip: locationData.ipAddress,
                            country: locationData.country,
                            isVPN: locationData.isVPN,
                            confidence: locationData.confidence,
                            timestamp: new Date().toISOString(),
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('@prisma/client'); })];
                    case 2:
                        PrismaClient = (_a.sent()).PrismaClient;
                        prisma = new PrismaClient();
                        return [4 /*yield*/, prisma.securityLog.create({
                                data: {
                                    userId: userId,
                                    ipAddress: locationData.ipAddress,
                                    action: action,
                                    country: locationData.country,
                                    currency: this.getCurrencyForCountry(locationData.country),
                                    isVPN: locationData.isVPN,
                                    confidence: locationData.confidence,
                                    suspicious: locationData.isSuspicious,
                                    details: {
                                        city: locationData.city,
                                        region: locationData.region,
                                        timezone: locationData.timezone,
                                        userAgent: '', // Will be added from request if needed
                                    },
                                },
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, prisma.$disconnect()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        console.error('Failed to log security event:', error_3);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return LocationService;
}());
exports.locationService = new LocationService();
