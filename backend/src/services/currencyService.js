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
exports.CURRENCY_FORMATS = exports.SUPPORTED_CURRENCIES = void 0;
exports.getCurrencyForCountry = getCurrencyForCountry;
exports.updateExchangeRates = updateExchangeRates;
exports.getExchangeRate = getExchangeRate;
exports.convertFromUSD = convertFromUSD;
exports.convertToUSD = convertToUSD;
exports.getUserCurrencyInfo = getUserCurrencyInfo;
exports.formatCurrency = formatCurrency;
var axios_1 = require("axios");
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
// Currency mapping for supported countries
var COUNTRY_TO_CURRENCY = {
    US: 'USD',
    ZA: 'ZAR',
    GB: 'GBP',
    CA: 'CAD',
    AU: 'AUD',
    IN: 'INR',
    NG: 'NGN',
    // Eurozone countries
    AT: 'EUR', BE: 'EUR', CY: 'EUR', EE: 'EUR', FI: 'EUR',
    FR: 'EUR', DE: 'EUR', GR: 'EUR', IE: 'EUR', IT: 'EUR',
    LV: 'EUR', LT: 'EUR', LU: 'EUR', MT: 'EUR', NL: 'EUR',
    PT: 'EUR', SK: 'EUR', SI: 'EUR', ES: 'EUR',
};
// Supported currencies with their full names
// USD - US Dollar, ZAR - South African Rand, EUR - Euro, 
// GBP - British Pound, CAD - Canadian Dollar, AUD - Australian Dollar,
// INR - Indian Rupee, NGN - Nigerian Naira, BRL - Brazilian Real, MXN - Mexican Peso
exports.SUPPORTED_CURRENCIES = ['USD', 'ZAR', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'NGN', 'BRL', 'MXN'];
// Currency formatting configuration with subscription pricing
// Note: Subscription prices are defined here per currency for easy management
// Update these values to change subscription pricing globally
// For more dynamic pricing, consider moving to environment variables or database
exports.CURRENCY_FORMATS = {
    'USD': { symbol: '$', decimals: 2, position: 'before', silverPrice: 4.99, goldPrice: 9.99, minWithdrawal: 10 },
    'ZAR': { symbol: 'R', decimals: 2, position: 'before', silverPrice: 89, goldPrice: 179, minWithdrawal: 180 },
    'EUR': { symbol: '€', decimals: 2, position: 'before', silverPrice: 4.99, goldPrice: 9.99, minWithdrawal: 10 },
    'GBP': { symbol: '£', decimals: 2, position: 'before', silverPrice: 4.49, goldPrice: 8.99, minWithdrawal: 8 },
    'NGN': { symbol: '₦', decimals: 2, position: 'before', silverPrice: 3500, goldPrice: 7000, minWithdrawal: 7000 },
    'CAD': { symbol: 'C$', decimals: 2, position: 'before', silverPrice: 6.99, goldPrice: 13.99, minWithdrawal: 15 },
    'AUD': { symbol: 'A$', decimals: 2, position: 'before', silverPrice: 7.99, goldPrice: 15.99, minWithdrawal: 15 },
    'INR': { symbol: '₹', decimals: 2, position: 'before', silverPrice: 399, goldPrice: 799, minWithdrawal: 800 },
    'BRL': { symbol: 'R$', decimals: 2, position: 'before', silverPrice: 24.99, goldPrice: 49.99, minWithdrawal: 50 },
    'MXN': { symbol: 'MX$', decimals: 2, position: 'before', silverPrice: 89.99, goldPrice: 179.99, minWithdrawal: 180 }
};
/**
 * Get currency code for a country
 */
function getCurrencyForCountry(countryCode) {
    return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || 'USD';
}
/**
 * Fetch latest exchange rates from API and update database
 */
function updateExchangeRates() {
    return __awaiter(this, void 0, void 0, function () {
        var apiUrl, response, rates, today, _i, SUPPORTED_CURRENCIES_1, currency, rate, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    apiUrl = process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4/latest/USD';
                    return [4 /*yield*/, axios_1.default.get(apiUrl)];
                case 1:
                    response = _a.sent();
                    if (!response.data || !response.data.rates) {
                        throw new Error('Invalid response from exchange rate API');
                    }
                    rates = response.data.rates;
                    today = new Date();
                    today.setHours(0, 0, 0, 0);
                    _i = 0, SUPPORTED_CURRENCIES_1 = exports.SUPPORTED_CURRENCIES;
                    _a.label = 2;
                case 2:
                    if (!(_i < SUPPORTED_CURRENCIES_1.length)) return [3 /*break*/, 5];
                    currency = SUPPORTED_CURRENCIES_1[_i];
                    if (currency === 'USD')
                        return [3 /*break*/, 4]; // Skip base currency
                    rate = rates[currency];
                    if (!rate) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.exchangeRate.upsert({
                            where: {
                                targetCurrency_date: {
                                    targetCurrency: currency,
                                    date: today,
                                },
                            },
                            create: {
                                baseCurrency: 'USD',
                                targetCurrency: currency,
                                rate: rate,
                                date: today,
                            },
                            update: {
                                rate: rate,
                            },
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("\u2705 Exchange rates updated successfully for ".concat(today.toISOString().split('T')[0]));
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('❌ Failed to update exchange rates:', error_1);
                    throw error_1;
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get current exchange rate for a currency
 * Falls back to previous day's rate if today's rate is not available
 */
function getExchangeRate(targetCurrency) {
    return __awaiter(this, void 0, void 0, function () {
        var today, rate, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (targetCurrency === 'USD') {
                        return [2 /*return*/, 1.0];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return [4 /*yield*/, prisma.exchangeRate.findFirst({
                            where: {
                                targetCurrency: targetCurrency,
                                date: today,
                            },
                            orderBy: {
                                date: 'desc',
                            },
                        })
                        // If not found, get the most recent rate
                    ];
                case 2:
                    rate = _a.sent();
                    if (!!rate) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.exchangeRate.findFirst({
                            where: {
                                targetCurrency: targetCurrency,
                            },
                            orderBy: {
                                date: 'desc',
                            },
                        })];
                case 3:
                    rate = _a.sent();
                    _a.label = 4;
                case 4:
                    if (!rate) {
                        console.warn("No exchange rate found for ".concat(targetCurrency, ", using 1.0"));
                        return [2 /*return*/, 1.0];
                    }
                    return [2 /*return*/, parseFloat(rate.rate.toString())];
                case 5:
                    error_2 = _a.sent();
                    console.error("Error fetching exchange rate for ".concat(targetCurrency, ":"), error_2);
                    return [2 /*return*/, 1.0];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Convert USD amount to target currency
 */
function convertFromUSD(amountUSD, targetCurrency) {
    return __awaiter(this, void 0, void 0, function () {
        var rate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (targetCurrency === 'USD') {
                        return [2 /*return*/, amountUSD];
                    }
                    return [4 /*yield*/, getExchangeRate(targetCurrency)];
                case 1:
                    rate = _a.sent();
                    return [2 /*return*/, amountUSD * rate];
            }
        });
    });
}
/**
 * Convert amount from target currency to USD
 */
function convertToUSD(amount, sourceCurrency) {
    return __awaiter(this, void 0, void 0, function () {
        var rate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (sourceCurrency === 'USD') {
                        return [2 /*return*/, amount];
                    }
                    return [4 /*yield*/, getExchangeRate(sourceCurrency)];
                case 1:
                    rate = _a.sent();
                    return [2 /*return*/, amount / rate];
            }
        });
    });
}
/**
 * Get comprehensive currency info for a user
 * Includes display currency, revenue country, exchange rate, and formatting
 */
function getUserCurrencyInfo(userId, ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var profile, displayCurrency, detectedCountry, detectCountryFromIP, ipCountry, exchangeRate, formatting;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { userId: userId },
                        select: {
                            preferredCurrency: true,
                            autoDetectCurrency: true,
                            revenueCountry: true,
                            displayCountry: true,
                            lastDetectedCountry: true
                        }
                    })];
                case 1:
                    profile = _a.sent();
                    if (!profile) {
                        throw new Error('User profile not found');
                    }
                    if (!profile.autoDetectCurrency) return [3 /*break*/, 4];
                    detectedCountry = profile.lastDetectedCountry;
                    if (!ipAddress) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./geoService'); })];
                case 2:
                    detectCountryFromIP = (_a.sent()).detectCountryFromIP;
                    ipCountry = detectCountryFromIP(ipAddress);
                    if (ipCountry) {
                        detectedCountry = ipCountry;
                    }
                    _a.label = 3;
                case 3:
                    displayCurrency = detectedCountry ? getCurrencyForCountry(detectedCountry) : 'USD';
                    return [3 /*break*/, 5];
                case 4:
                    // User manually selected
                    displayCurrency = profile.preferredCurrency || 'USD';
                    _a.label = 5;
                case 5: return [4 /*yield*/, getExchangeRate(displayCurrency)];
                case 6:
                    exchangeRate = _a.sent();
                    formatting = exports.CURRENCY_FORMATS[displayCurrency] || exports.CURRENCY_FORMATS['USD'];
                    return [2 /*return*/, {
                            displayCurrency: displayCurrency,
                            revenueCountry: profile.revenueCountry,
                            displayCountry: profile.displayCountry,
                            exchangeRate: exchangeRate,
                            formatting: formatting
                        }];
            }
        });
    });
}
/**
 * Format amount in user's display currency
 */
function formatCurrency(amountUsd, currencyInfo) {
    var localAmount = amountUsd * currencyInfo.exchangeRate;
    var formatted = localAmount.toFixed(currencyInfo.formatting.decimals);
    var withCommas = parseFloat(formatted).toLocaleString('en-US', {
        minimumFractionDigits: currencyInfo.formatting.decimals,
        maximumFractionDigits: currencyInfo.formatting.decimals
    });
    return currencyInfo.formatting.position === 'before'
        ? "".concat(currencyInfo.formatting.symbol).concat(withCommas)
        : "".concat(withCommas).concat(currencyInfo.formatting.symbol);
}
