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
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function setupTwoWalletSystem() {
    return __awaiter(this, void 0, void 0, function () {
        var exchangeRates, _i, exchangeRates_1, rate, existing, defaultAds, _a, defaultAds_1, ad, existing, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 13, 14, 16]);
                    console.log('🔧 Setting up Two-Wallet System...');
                    exchangeRates = [
                        {
                            fromCurrency: 'COINS',
                            toCurrency: 'USD',
                            rate: 1000, // 1000 coins = 1 cent
                            revenueShare: 0.85, // 85% revenue share
                        },
                        {
                            fromCurrency: 'COINS',
                            toCurrency: 'EUR',
                            rate: 1100, // 1100 coins = 1 cent EUR
                            revenueShare: 0.85,
                        },
                        {
                            fromCurrency: 'COINS',
                            toCurrency: 'GBP',
                            rate: 1200, // 1200 coins = 1 cent GBP
                            revenueShare: 0.85,
                        },
                    ];
                    _i = 0, exchangeRates_1 = exchangeRates;
                    _b.label = 1;
                case 1:
                    if (!(_i < exchangeRates_1.length)) return [3 /*break*/, 6];
                    rate = exchangeRates_1[_i];
                    return [4 /*yield*/, prisma.exchangeRate.findFirst({
                            where: {
                                fromCurrency: rate.fromCurrency,
                                toCurrency: rate.toCurrency,
                                isActive: true,
                            },
                        })];
                case 2:
                    existing = _b.sent();
                    if (!!existing) return [3 /*break*/, 4];
                    return [4 /*yield*/, prisma.exchangeRate.create({
                            data: rate,
                        })];
                case 3:
                    _b.sent();
                    console.log("\u2705 Created exchange rate: ".concat(rate.fromCurrency, " -> ").concat(rate.toCurrency));
                    return [3 /*break*/, 5];
                case 4:
                    console.log("\u23ED\uFE0F  Exchange rate already exists: ".concat(rate.fromCurrency, " -> ").concat(rate.toCurrency));
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    defaultAds = [
                        {
                            title: 'AdMob Rewarded Video',
                            description: 'Watch this ad to earn 100 coins!',
                            durationSeconds: 30,
                            rewardCents: 5, // Legacy
                            rewardCoins: BigInt(100),
                            isActive: true,
                            adMobUnitId: process.env.ADMOB_REWARDED_AD_UNIT_ID,
                        },
                        {
                            title: 'Premium Rewarded Ad',
                            description: 'Higher value ad with more coins!',
                            durationSeconds: 45,
                            rewardCents: 8, // Legacy
                            rewardCoins: BigInt(150),
                            isActive: true,
                        },
                    ];
                    _a = 0, defaultAds_1 = defaultAds;
                    _b.label = 7;
                case 7:
                    if (!(_a < defaultAds_1.length)) return [3 /*break*/, 12];
                    ad = defaultAds_1[_a];
                    return [4 /*yield*/, prisma.ad.findFirst({
                            where: { title: ad.title },
                        })];
                case 8:
                    existing = _b.sent();
                    if (!!existing) return [3 /*break*/, 10];
                    return [4 /*yield*/, prisma.ad.create({
                            data: ad,
                        })];
                case 9:
                    _b.sent();
                    console.log("\u2705 Created ad: ".concat(ad.title));
                    return [3 /*break*/, 11];
                case 10:
                    console.log("\u23ED\uFE0F  Ad already exists: ".concat(ad.title));
                    _b.label = 11;
                case 11:
                    _a++;
                    return [3 /*break*/, 7];
                case 12:
                    console.log('🎉 Two-Wallet System setup complete!');
                    return [3 /*break*/, 16];
                case 13:
                    error_1 = _b.sent();
                    console.error('❌ Setup failed:', error_1);
                    return [3 /*break*/, 16];
                case 14: return [4 /*yield*/, prisma.$disconnect()];
                case 15:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 16: return [2 /*return*/];
            }
        });
    });
}
// Run setup
setupTwoWalletSystem();
exports.default = setupTwoWalletSystem;
