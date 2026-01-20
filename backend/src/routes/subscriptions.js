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
var paypalService_1 = require("../services/paypalService");
var router = (0, express_1.Router)();
var prisma = new client_1.PrismaClient();
/**
 * POST /api/subscriptions/create
 * Create a new subscription
 */
router.post('/create', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, tier, planId, _a, subscriptionId, approvalUrl, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                userId = req.user.id;
                tier = req.body // 'Silver' or 'Gold'
                .tier;
                if (!['Silver', 'Gold'].includes(tier)) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: 'Invalid tier. Must be Silver or Gold.',
                        })];
                }
                planId = tier === 'Silver'
                    ? process.env.PAYPAL_SILVER_PLAN_ID
                    : process.env.PAYPAL_GOLD_PLAN_ID;
                if (!planId) {
                    return [2 /*return*/, res.status(500).json({
                            success: false,
                            error: "".concat(tier, " plan not configured. Please contact support."),
                        })];
                }
                return [4 /*yield*/, (0, paypalService_1.createSubscription)(planId)
                    // Store pending subscription in database
                ];
            case 1:
                _a = _b.sent(), subscriptionId = _a.subscriptionId, approvalUrl = _a.approvalUrl;
                // Store pending subscription in database
                return [4 /*yield*/, prisma.userProfile.update({
                        where: { userId: userId },
                        data: {
                            subscriptionId: subscriptionId,
                            subscriptionStatus: 'PENDING',
                            subscriptionPlanId: planId,
                        },
                    })];
            case 2:
                // Store pending subscription in database
                _b.sent();
                res.json({
                    success: true,
                    subscriptionId: subscriptionId,
                    approvalUrl: approvalUrl,
                    message: 'Subscription created. Please complete payment.',
                });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error('Error creating subscription:', error_1);
                res.status(500).json({
                    success: false,
                    error: error_1.message || 'Failed to create subscription',
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/subscriptions/status
 * Get current subscription status
 */
router.get('/status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, profile, paypalDetails, error_2, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                userId = req.user.id;
                return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { userId: userId },
                        select: {
                            tier: true,
                            subscriptionId: true,
                            subscriptionStatus: true,
                            subscriptionPlanId: true,
                            subscriptionStartDate: true,
                            subscriptionEndDate: true,
                        },
                    })];
            case 1:
                profile = _a.sent();
                if (!profile) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'User profile not found',
                        })];
                }
                paypalDetails = null;
                if (!profile.subscriptionId) return [3 /*break*/, 5];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, (0, paypalService_1.getSubscriptionDetails)(profile.subscriptionId)];
            case 3:
                paypalDetails = _a.sent();
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                console.error('Error fetching PayPal subscription details:', error_2);
                return [3 /*break*/, 5];
            case 5:
                res.json({
                    success: true,
                    tier: profile.tier,
                    subscriptionId: profile.subscriptionId,
                    subscriptionStatus: profile.subscriptionStatus,
                    subscriptionPlanId: profile.subscriptionPlanId,
                    subscriptionStartDate: profile.subscriptionStartDate,
                    subscriptionEndDate: profile.subscriptionEndDate,
                    paypalDetails: paypalDetails,
                });
                return [3 /*break*/, 7];
            case 6:
                error_3 = _a.sent();
                console.error('Error fetching subscription status:', error_3);
                res.status(500).json({
                    success: false,
                    error: 'Failed to fetch subscription status',
                });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/subscriptions/cancel
 * Cancel current subscription
 */
router.post('/cancel', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, reason, profile, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                userId = req.user.id;
                reason = req.body.reason;
                return [4 /*yield*/, prisma.userProfile.findUnique({
                        where: { userId: userId },
                        select: { subscriptionId: true },
                    })];
            case 1:
                profile = _a.sent();
                if (!(profile === null || profile === void 0 ? void 0 : profile.subscriptionId)) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: 'No active subscription found',
                        })];
                }
                // Cancel subscription with PayPal
                return [4 /*yield*/, (0, paypalService_1.cancelSubscription)(profile.subscriptionId, reason || 'User requested cancellation')
                    // Update database
                ];
            case 2:
                // Cancel subscription with PayPal
                _a.sent();
                // Update database
                return [4 /*yield*/, prisma.userProfile.update({
                        where: { userId: userId },
                        data: {
                            subscriptionStatus: 'CANCELLED',
                            tier: 'Bronze',
                        },
                    })];
            case 3:
                // Update database
                _a.sent();
                res.json({
                    success: true,
                    message: 'Subscription cancelled successfully',
                });
                return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                console.error('Error cancelling subscription:', error_4);
                res.status(500).json({
                    success: false,
                    error: error_4.message || 'Failed to cancel subscription',
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/subscriptions/webhook
 * Handle PayPal webhook events
 */
router.post('/webhook', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var webhookId, isValid, event_1, eventType, resource, _a, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 14, , 15]);
                webhookId = process.env.PAYPAL_WEBHOOK_ID || '';
                return [4 /*yield*/, (0, paypalService_1.verifyWebhookSignature)(webhookId, req.headers, req.body)];
            case 1:
                isValid = _b.sent();
                if (!isValid) {
                    console.error('Invalid webhook signature');
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid signature' })];
                }
                event_1 = req.body;
                eventType = event_1.event_type;
                resource = event_1.resource;
                console.log("\uD83D\uDCE5 PayPal webhook received: ".concat(eventType));
                _a = eventType;
                switch (_a) {
                    case 'BILLING.SUBSCRIPTION.CREATED': return [3 /*break*/, 2];
                    case 'BILLING.SUBSCRIPTION.ACTIVATED': return [3 /*break*/, 4];
                    case 'BILLING.SUBSCRIPTION.CANCELLED': return [3 /*break*/, 6];
                    case 'BILLING.SUBSCRIPTION.SUSPENDED': return [3 /*break*/, 8];
                    case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': return [3 /*break*/, 10];
                }
                return [3 /*break*/, 12];
            case 2: 
            // Subscription created but not yet activated
            return [4 /*yield*/, handleSubscriptionCreated(resource)];
            case 3:
                // Subscription created but not yet activated
                _b.sent();
                return [3 /*break*/, 13];
            case 4: 
            // Subscription activated - user completed payment
            return [4 /*yield*/, handleSubscriptionActivated(resource)];
            case 5:
                // Subscription activated - user completed payment
                _b.sent();
                return [3 /*break*/, 13];
            case 6: 
            // User or admin cancelled subscription
            return [4 /*yield*/, handleSubscriptionCancelled(resource)];
            case 7:
                // User or admin cancelled subscription
                _b.sent();
                return [3 /*break*/, 13];
            case 8: 
            // Subscription suspended (payment failed)
            return [4 /*yield*/, handleSubscriptionSuspended(resource)];
            case 9:
                // Subscription suspended (payment failed)
                _b.sent();
                return [3 /*break*/, 13];
            case 10: 
            // Payment failed
            return [4 /*yield*/, handlePaymentFailed(resource)];
            case 11:
                // Payment failed
                _b.sent();
                return [3 /*break*/, 13];
            case 12:
                console.log("Unhandled webhook event: ".concat(eventType));
                _b.label = 13;
            case 13:
                res.json({ success: true });
                return [3 /*break*/, 15];
            case 14:
                error_5 = _b.sent();
                console.error('Error processing webhook:', error_5);
                res.status(500).json({ error: 'Webhook processing failed' });
                return [3 /*break*/, 15];
            case 15: return [2 /*return*/];
        }
    });
}); });
/**
 * Webhook handlers
 */
function handleSubscriptionCreated(resource) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptionId;
        return __generator(this, function (_a) {
            subscriptionId = resource.id;
            console.log("Subscription created: ".concat(subscriptionId));
            return [2 /*return*/];
        });
    });
}
function handleSubscriptionActivated(resource) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptionId, planId, tier;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subscriptionId = resource.id;
                    planId = resource.plan_id;
                    tier = 'Bronze';
                    if (planId === process.env.PAYPAL_SILVER_PLAN_ID) {
                        tier = 'Silver';
                    }
                    else if (planId === process.env.PAYPAL_GOLD_PLAN_ID) {
                        tier = 'Gold';
                    }
                    // Update user profile
                    return [4 /*yield*/, prisma.userProfile.updateMany({
                            where: { subscriptionId: subscriptionId },
                            data: {
                                tier: tier,
                                subscriptionStatus: 'ACTIVE',
                                subscriptionStartDate: new Date(),
                            },
                        })];
                case 1:
                    // Update user profile
                    _a.sent();
                    console.log("\u2705 Subscription activated: ".concat(subscriptionId, " -> ").concat(tier, " tier"));
                    return [2 /*return*/];
            }
        });
    });
}
function handleSubscriptionCancelled(resource) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptionId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subscriptionId = resource.id;
                    return [4 /*yield*/, prisma.userProfile.updateMany({
                            where: { subscriptionId: subscriptionId },
                            data: {
                                tier: 'Bronze',
                                subscriptionStatus: 'CANCELLED',
                                subscriptionEndDate: new Date(),
                            },
                        })];
                case 1:
                    _a.sent();
                    console.log("\u274C Subscription cancelled: ".concat(subscriptionId));
                    return [2 /*return*/];
            }
        });
    });
}
function handleSubscriptionSuspended(resource) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptionId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subscriptionId = resource.id;
                    return [4 /*yield*/, prisma.userProfile.updateMany({
                            where: { subscriptionId: subscriptionId },
                            data: {
                                subscriptionStatus: 'SUSPENDED',
                            },
                        })];
                case 1:
                    _a.sent();
                    console.log("\u26A0\uFE0F Subscription suspended: ".concat(subscriptionId));
                    return [2 /*return*/];
            }
        });
    });
}
function handlePaymentFailed(resource) {
    return __awaiter(this, void 0, void 0, function () {
        var subscriptionId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subscriptionId = resource.id;
                    // Mark subscription as suspended with grace period
                    return [4 /*yield*/, prisma.userProfile.updateMany({
                            where: { subscriptionId: subscriptionId },
                            data: {
                                subscriptionStatus: 'SUSPENDED',
                            },
                        })
                        // TODO: Implement user notification system
                        // - Send email notification about payment failure
                        // - Provide link to update payment method
                        // - Inform about 3-day grace period before downgrade
                        // TODO: Implement grace period logic
                        // - Set grace period end date (3 days from now)
                        // - Create scheduled job to check grace period expiration
                        // - Downgrade to Bronze tier if payment not resolved within grace period
                    ];
                case 1:
                    // Mark subscription as suspended with grace period
                    _a.sent();
                    // TODO: Implement user notification system
                    // - Send email notification about payment failure
                    // - Provide link to update payment method
                    // - Inform about 3-day grace period before downgrade
                    // TODO: Implement grace period logic
                    // - Set grace period end date (3 days from now)
                    // - Create scheduled job to check grace period expiration
                    // - Downgrade to Bronze tier if payment not resolved within grace period
                    console.log("\uD83D\uDCB3 Payment failed for subscription: ".concat(subscriptionId));
                    console.warn('⚠️ Grace period and notification system not yet implemented');
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = router;
