"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var auth_1 = require("./middleware/auth");
var expireBalances_1 = require("./jobs/expireBalances");
// Import routes
var user_1 = require("./routes/user");
var ads_1 = require("./routes/ads");
var withdrawals_1 = require("./routes/withdrawals");
var leaderboard_1 = require("./routes/leaderboard");
var badges_1 = require("./routes/badges");
var admin_1 = require("./routes/admin");
var videos_1 = require("./routes/videos");
var subscriptions_1 = require("./routes/subscriptions");
var payouts_1 = require("./routes/payouts");
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 4000;
// Middleware
app.use((0, cors_1.default)({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://192.168.1.61:4000',
        'capacitor://localhost',
        'http://localhost',
    ],
    credentials: true,
}));
app.use(express_1.default.json());
// Health check
app.get('/health', function (req, res) {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Public routes
app.use('/api/leaderboard', leaderboard_1.default);
app.use('/api/subscriptions/webhook', subscriptions_1.default); // Webhook should be public
// Protected routes
app.use('/api/user', auth_1.authenticate, user_1.default);
app.use('/api/ads', auth_1.authenticate, ads_1.default);
app.use('/api/withdrawals', auth_1.authenticate, withdrawals_1.default);
app.use('/api/badges', auth_1.authenticate, badges_1.default);
app.use('/api/admin', auth_1.authenticate, admin_1.default);
app.use('/api/videos', auth_1.authenticate, videos_1.default);
app.use('/api/subscriptions', auth_1.authenticate, subscriptions_1.default);
app.use('/api/payouts', auth_1.authenticate, payouts_1.default);
// Error handler
app.use(function (err, req, res, next) {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
    });
});
// Only start server if not in Vercel (Vercel handles this automatically)
if (process.env.VERCEL !== '1') {
    app.listen(Number(PORT), function () {
        console.log("\uD83D\uDE80 Server running on http://localhost:".concat(PORT));
        console.log("\uD83D\uDCCA Environment: ".concat(process.env.NODE_ENV || 'development'));
        // Start balance expiry cron job
        // NOTE: This will not run in Vercel's serverless environment
        // For Vercel, you'll need to create a separate Vercel Cron Job endpoint
        (0, expireBalances_1.scheduleExpiryJob)();
    });
}
exports.default = app;
