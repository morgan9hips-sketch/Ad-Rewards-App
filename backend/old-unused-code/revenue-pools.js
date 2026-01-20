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
var auth_js_1 = require("../middleware/auth.js");
var revenuePoolService_js_1 = require("../services/revenuePoolService.js");
var router = (0, express_1.Router)();
// Get all revenue pool statistics (Admin only)
router.get('/', auth_js_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var analytics, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, revenuePoolService_js_1.revenuePoolService.getRevenueAnalytics()];
            case 1:
                analytics = _a.sent();
                res.json(analytics);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error fetching revenue analytics:', error_1);
                res.status(500).json({ error: 'Failed to fetch revenue analytics' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Get specific country revenue pool (Admin only)
router.get('/:countryCode', auth_js_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var countryCode, stats, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                countryCode = req.params.countryCode;
                return [4 /*yield*/, revenuePoolService_js_1.revenuePoolService.getPoolStats(countryCode.toUpperCase())];
            case 1:
                stats = _a.sent();
                if (!stats) {
                    return [2 /*return*/, res
                            .status(404)
                            .json({ error: 'Revenue pool not found for country' })];
                }
                res.json(stats);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching country revenue pool:', error_2);
                res.status(500).json({ error: 'Failed to fetch country revenue pool' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Initialize revenue pools (Admin only)
router.post('/initialize', auth_js_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, revenuePoolService_js_1.revenuePoolService.initializeRevenuePools()];
            case 1:
                _a.sent();
                res.json({
                    success: true,
                    message: 'Revenue pools initialized successfully',
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error initializing revenue pools:', error_3);
                res.status(500).json({ error: 'Failed to initialize revenue pools' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Update exchange rates (Admin only)
router.post('/update-rates', auth_js_1.requireAdmin, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, revenuePoolService_js_1.revenuePoolService.updateExchangeRates()];
            case 1:
                _a.sent();
                res.json({
                    success: true,
                    message: 'Exchange rates updated successfully',
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error updating exchange rates:', error_4);
                res.status(500).json({ error: 'Failed to update exchange rates' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
