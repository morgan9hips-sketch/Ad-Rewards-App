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
exports.createSubscriptionPlan = createSubscriptionPlan;
exports.createSubscription = createSubscription;
exports.getSubscriptionDetails = getSubscriptionDetails;
exports.cancelSubscription = cancelSubscription;
exports.createPayout = createPayout;
exports.getPayoutStatus = getPayoutStatus;
exports.verifyWebhookSignature = verifyWebhookSignature;
var axios_1 = require("axios");
var PAYPAL_API_BASE = process.env.PAYPAL_MODE === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
var PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
var PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
/**
 * Get PayPal access token
 */
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function () {
        var auth, response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    auth = Buffer.from("".concat(PAYPAL_CLIENT_ID, ":").concat(PAYPAL_SECRET)).toString('base64');
                    return [4 /*yield*/, axios_1.default.post("".concat(PAYPAL_API_BASE, "/v1/oauth2/token"), 'grant_type=client_credentials', {
                            headers: {
                                'Authorization': "Basic ".concat(auth),
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                        })];
                case 1:
                    response = _b.sent();
                    return [2 /*return*/, response.data.access_token];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error getting PayPal access token:', ((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) || error_1.message);
                    throw new Error('Failed to authenticate with PayPal');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Create a subscription plan
 */
function createSubscriptionPlan(name, description, price, currency) {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, planData, response, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getAccessToken()];
                case 1:
                    accessToken = _b.sent();
                    planData = {
                        product_id: process.env.PAYPAL_PRODUCT_ID || 'PROD-ADIFY-001', // Create product first in PayPal dashboard
                        name: name,
                        description: description,
                        billing_cycles: [
                            {
                                frequency: {
                                    interval_unit: 'MONTH',
                                    interval_count: 1,
                                },
                                tenure_type: 'REGULAR',
                                sequence: 1,
                                total_cycles: 0, // Infinite
                                pricing_scheme: {
                                    fixed_price: {
                                        value: price,
                                        currency_code: currency,
                                    },
                                },
                            },
                        ],
                        payment_preferences: {
                            auto_bill_outstanding: true,
                            setup_fee_failure_action: 'CONTINUE',
                            payment_failure_threshold: 3,
                        },
                    };
                    return [4 /*yield*/, axios_1.default.post("".concat(PAYPAL_API_BASE, "/v1/billing/plans"), planData, {
                            headers: {
                                'Authorization': "Bearer ".concat(accessToken),
                                'Content-Type': 'application/json',
                            },
                        })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data.id];
                case 3:
                    error_2 = _b.sent();
                    console.error('Error creating subscription plan:', ((_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) || error_2.message);
                    throw new Error('Failed to create subscription plan');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Create a subscription
 */
function createSubscription(planId) {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, subscriptionData, response, approvalUrl, error_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getAccessToken()];
                case 1:
                    accessToken = _c.sent();
                    subscriptionData = {
                        plan_id: planId,
                        application_context: {
                            brand_name: 'Adify',
                            locale: 'en-US',
                            user_action: 'SUBSCRIBE_NOW',
                            payment_method: {
                                payer_selected: 'PAYPAL',
                                payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
                            },
                            return_url: "".concat(process.env.FRONTEND_URL, "/subscription/success"),
                            cancel_url: "".concat(process.env.FRONTEND_URL, "/subscription/cancel"),
                        },
                    };
                    return [4 /*yield*/, axios_1.default.post("".concat(PAYPAL_API_BASE, "/v1/billing/subscriptions"), subscriptionData, {
                            headers: {
                                'Authorization': "Bearer ".concat(accessToken),
                                'Content-Type': 'application/json',
                            },
                        })];
                case 2:
                    response = _c.sent();
                    approvalUrl = ((_a = response.data.links.find(function (link) { return link.rel === 'approve'; })) === null || _a === void 0 ? void 0 : _a.href) || '';
                    return [2 /*return*/, {
                            subscriptionId: response.data.id,
                            approvalUrl: approvalUrl,
                        }];
                case 3:
                    error_3 = _c.sent();
                    console.error('Error creating subscription:', ((_b = error_3.response) === null || _b === void 0 ? void 0 : _b.data) || error_3.message);
                    throw new Error('Failed to create subscription');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get subscription details
 */
function getSubscriptionDetails(subscriptionId) {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, response, error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getAccessToken()];
                case 1:
                    accessToken = _b.sent();
                    return [4 /*yield*/, axios_1.default.get("".concat(PAYPAL_API_BASE, "/v1/billing/subscriptions/").concat(subscriptionId), {
                            headers: {
                                'Authorization': "Bearer ".concat(accessToken),
                            },
                        })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    error_4 = _b.sent();
                    console.error('Error getting subscription details:', ((_a = error_4.response) === null || _a === void 0 ? void 0 : _a.data) || error_4.message);
                    throw new Error('Failed to get subscription details');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Cancel subscription
 */
function cancelSubscription(subscriptionId, reason) {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, error_5;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getAccessToken()];
                case 1:
                    accessToken = _b.sent();
                    return [4 /*yield*/, axios_1.default.post("".concat(PAYPAL_API_BASE, "/v1/billing/subscriptions/").concat(subscriptionId, "/cancel"), { reason: reason }, {
                            headers: {
                                'Authorization': "Bearer ".concat(accessToken),
                                'Content-Type': 'application/json',
                            },
                        })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _b.sent();
                    console.error('Error canceling subscription:', ((_a = error_5.response) === null || _a === void 0 ? void 0 : _a.data) || error_5.message);
                    throw new Error('Failed to cancel subscription');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Create a payout
 */
function createPayout(recipientEmail, amount, currency, note) {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, payoutData, response, error_6;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getAccessToken()];
                case 1:
                    accessToken = _b.sent();
                    payoutData = {
                        sender_batch_header: {
                            sender_batch_id: "batch_".concat(Date.now()),
                            email_subject: 'You have a payout from Adify!',
                            email_message: 'You have received a payout from Adify. Thanks for using our service!',
                        },
                        items: [
                            {
                                recipient_type: 'EMAIL',
                                amount: {
                                    value: amount,
                                    currency: currency,
                                },
                                note: note,
                                sender_item_id: "item_".concat(Date.now()),
                                receiver: recipientEmail,
                            },
                        ],
                    };
                    return [4 /*yield*/, axios_1.default.post("".concat(PAYPAL_API_BASE, "/v1/payments/payouts"), payoutData, {
                            headers: {
                                'Authorization': "Bearer ".concat(accessToken),
                                'Content-Type': 'application/json',
                            },
                        })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, {
                            batchId: response.data.batch_header.payout_batch_id,
                            status: response.data.batch_header.batch_status,
                        }];
                case 3:
                    error_6 = _b.sent();
                    console.error('Error creating payout:', ((_a = error_6.response) === null || _a === void 0 ? void 0 : _a.data) || error_6.message);
                    throw new Error('Failed to create payout');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get payout status
 */
function getPayoutStatus(batchId) {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, response, error_7;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getAccessToken()];
                case 1:
                    accessToken = _b.sent();
                    return [4 /*yield*/, axios_1.default.get("".concat(PAYPAL_API_BASE, "/v1/payments/payouts/").concat(batchId), {
                            headers: {
                                'Authorization': "Bearer ".concat(accessToken),
                            },
                        })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data];
                case 3:
                    error_7 = _b.sent();
                    console.error('Error getting payout status:', ((_a = error_7.response) === null || _a === void 0 ? void 0 : _a.data) || error_7.message);
                    throw new Error('Failed to get payout status');
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Verify webhook signature
 */
function verifyWebhookSignature(webhookId, headers, body) {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, verificationData, response, error_8;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getAccessToken()];
                case 1:
                    accessToken = _b.sent();
                    verificationData = {
                        transmission_id: headers['paypal-transmission-id'],
                        transmission_time: headers['paypal-transmission-time'],
                        cert_url: headers['paypal-cert-url'],
                        auth_algo: headers['paypal-auth-algo'],
                        transmission_sig: headers['paypal-transmission-sig'],
                        webhook_id: webhookId,
                        webhook_event: body,
                    };
                    return [4 /*yield*/, axios_1.default.post("".concat(PAYPAL_API_BASE, "/v1/notifications/verify-webhook-signature"), verificationData, {
                            headers: {
                                'Authorization': "Bearer ".concat(accessToken),
                                'Content-Type': 'application/json',
                            },
                        })];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data.verification_status === 'SUCCESS'];
                case 3:
                    error_8 = _b.sent();
                    console.error('Error verifying webhook signature:', ((_a = error_8.response) === null || _a === void 0 ? void 0 : _a.data) || error_8.message);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
