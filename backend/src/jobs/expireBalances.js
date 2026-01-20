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
exports.runExpiryJob = runExpiryJob;
exports.scheduleExpiryJob = scheduleExpiryJob;
var client_1 = require("@prisma/client");
var node_cron_1 = require("node-cron");
var prisma = new client_1.PrismaClient();
// Expiry configuration constants
var COIN_EXPIRY_DAYS = 30;
var CASH_EXPIRY_DAYS = 90;
var COINS_TO_ZAR_RATE = 1000; // 1000 coins = R1 ZAR
/**
 * Expire coin balances after 30 days of inactivity
 */
function expireCoins() {
    return __awaiter(this, void 0, void 0, function () {
        var expiryDate, inactiveUsers, totalExpired, totalValue, _i, inactiveUsers_1, user, coins, cashValue, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() - COIN_EXPIRY_DAYS);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, prisma.userProfile.findMany({
                            where: {
                                lastLogin: {
                                    lt: expiryDate,
                                },
                                coinsBalance: {
                                    gt: 0,
                                },
                            },
                            select: {
                                userId: true,
                                email: true,
                                coinsBalance: true,
                            },
                        })];
                case 2:
                    inactiveUsers = _a.sent();
                    totalExpired = 0;
                    totalValue = 0;
                    _i = 0, inactiveUsers_1 = inactiveUsers;
                    _a.label = 3;
                case 3:
                    if (!(_i < inactiveUsers_1.length)) return [3 /*break*/, 7];
                    user = inactiveUsers_1[_i];
                    coins = Number(user.coinsBalance);
                    cashValue = coins / COINS_TO_ZAR_RATE;
                    // Log expiry
                    return [4 /*yield*/, prisma.expiredBalance.create({
                            data: {
                                userId: user.userId,
                                expiryType: 'coins',
                                amount: coins,
                                cashValue: cashValue,
                                reason: 'coin_inactivity',
                            },
                        })
                        // Reset coin balance
                    ];
                case 4:
                    // Log expiry
                    _a.sent();
                    // Reset coin balance
                    return [4 /*yield*/, prisma.userProfile.update({
                            where: { userId: user.userId },
                            data: { coinsBalance: 0 },
                        })];
                case 5:
                    // Reset coin balance
                    _a.sent();
                    totalExpired += coins;
                    totalValue += cashValue;
                    console.log("Expired ".concat(coins, " coins (R").concat(cashValue.toFixed(2), ") from user ").concat(user.email));
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7:
                    console.log("\u2705 Coin expiry complete: ".concat(inactiveUsers.length, " users, ").concat(totalExpired, " coins (R").concat(totalValue.toFixed(2), ")"));
                    return [2 /*return*/, {
                            usersAffected: inactiveUsers.length,
                            totalCoinsExpired: totalExpired,
                            totalValue: totalValue,
                        }];
                case 8:
                    error_1 = _a.sent();
                    console.error('❌ Error expiring coins:', error_1);
                    throw error_1;
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Expire cash balances after 90 days of inactivity
 */
function expireCash() {
    return __awaiter(this, void 0, void 0, function () {
        var expiryDate, inactiveUsers, totalExpired, _i, inactiveUsers_2, user, cashUsd, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    expiryDate = new Date();
                    expiryDate.setDate(expiryDate.getDate() - CASH_EXPIRY_DAYS);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, prisma.userProfile.findMany({
                            where: {
                                lastLogin: {
                                    lt: expiryDate,
                                },
                                cashBalanceUsd: {
                                    gt: 0,
                                },
                            },
                            select: {
                                userId: true,
                                email: true,
                                cashBalanceUsd: true,
                            },
                        })];
                case 2:
                    inactiveUsers = _a.sent();
                    totalExpired = 0;
                    _i = 0, inactiveUsers_2 = inactiveUsers;
                    _a.label = 3;
                case 3:
                    if (!(_i < inactiveUsers_2.length)) return [3 /*break*/, 7];
                    user = inactiveUsers_2[_i];
                    cashUsd = Number(user.cashBalanceUsd);
                    // Log expiry
                    return [4 /*yield*/, prisma.expiredBalance.create({
                            data: {
                                userId: user.userId,
                                expiryType: 'cash',
                                amount: cashUsd,
                                cashValue: cashUsd,
                                reason: 'cash_inactivity',
                            },
                        })
                        // Reset cash balance
                    ];
                case 4:
                    // Log expiry
                    _a.sent();
                    // Reset cash balance
                    return [4 /*yield*/, prisma.userProfile.update({
                            where: { userId: user.userId },
                            data: { cashBalanceUsd: 0 },
                        })];
                case 5:
                    // Reset cash balance
                    _a.sent();
                    totalExpired += cashUsd;
                    console.log("Expired $".concat(cashUsd.toFixed(2), " USD from user ").concat(user.email));
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 3];
                case 7:
                    console.log("\u2705 Cash expiry complete: ".concat(inactiveUsers.length, " users, $").concat(totalExpired.toFixed(2), " USD"));
                    return [2 /*return*/, {
                            usersAffected: inactiveUsers.length,
                            totalCashExpired: totalExpired,
                        }];
                case 8:
                    error_2 = _a.sent();
                    console.error('❌ Error expiring cash:', error_2);
                    throw error_2;
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Main expiry job that runs both coin and cash expiry
 */
function runExpiryJob() {
    return __awaiter(this, void 0, void 0, function () {
        var coinResults, cashResults, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🕐 Starting balance expiry job...', new Date().toISOString());
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, expireCoins()];
                case 2:
                    coinResults = _a.sent();
                    return [4 /*yield*/, expireCash()];
                case 3:
                    cashResults = _a.sent();
                    console.log('✅ Balance expiry job completed successfully');
                    console.log('Summary:', {
                        coins: coinResults,
                        cash: cashResults,
                    });
                    return [2 /*return*/, {
                            success: true,
                            coins: coinResults,
                            cash: cashResults,
                        }];
                case 4:
                    error_3 = _a.sent();
                    console.error('❌ Balance expiry job failed:', error_3);
                    return [2 /*return*/, {
                            success: false,
                            error: error_3 instanceof Error ? error_3.message : 'Unknown error',
                        }];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Schedule the job to run daily at 2:00 AM
 * Cron format: minute hour day month dayOfWeek
 * '0 2 * * *' = At 2:00 AM every day
 */
function scheduleExpiryJob() {
    var _this = this;
    // Run at 2:00 AM every day
    node_cron_1.default.schedule('0 2 * * *', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, runExpiryJob()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    console.log('⏰ Balance expiry job scheduled (daily at 2:00 AM)');
}
// For manual testing
if (import.meta.url === "file://".concat(process.argv[1])) {
    runExpiryJob()
        .then(function () {
        console.log('Manual run complete');
        process.exit(0);
    })
        .catch(function (error) {
        console.error('Manual run failed:', error);
        process.exit(1);
    });
}
