"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectCountryFromIP = detectCountryFromIP;
exports.getUserLocationInfo = getUserLocationInfo;
exports.getClientIP = getClientIP;
var geoip_lite_1 = require("geoip-lite");
var currencyService_1 = require("./currencyService");
/**
 * Detect country from IP address
 */
function detectCountryFromIP(ipAddress) {
    try {
        var geo = geoip_lite_1.default.lookup(ipAddress);
        return (geo === null || geo === void 0 ? void 0 : geo.country) || null;
    }
    catch (error) {
        console.error('Error detecting country from IP:', error);
        return null;
    }
}
/**
 * Get user location info from IP
 */
function getUserLocationInfo(ipAddress) {
    var countryCode = detectCountryFromIP(ipAddress);
    var currency = countryCode ? (0, currencyService_1.getCurrencyForCountry)(countryCode) : 'USD';
    return {
        countryCode: countryCode,
        currency: currency,
    };
}
/**
 * Extract IP address from request
 * Handles proxy headers (X-Forwarded-For, X-Real-IP)
 */
function getClientIP(req) {
    var _a, _b;
    var forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        var ips = forwarded.split(',');
        return ips[0].trim();
    }
    var realIP = req.headers['x-real-ip'];
    if (realIP) {
        return realIP;
    }
    return ((_a = req.connection) === null || _a === void 0 ? void 0 : _a.remoteAddress) || ((_b = req.socket) === null || _b === void 0 ? void 0 : _b.remoteAddress) || 'unknown';
}
