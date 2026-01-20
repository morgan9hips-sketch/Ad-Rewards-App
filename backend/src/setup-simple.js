"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
function setupTables() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('📦 Setting up database tables...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    // Create tables using individual SQL commands
                    return [4 /*yield*/, prisma.$executeRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""], ["CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""
                            // User Profiles
                        ])))];
                case 2:
                    // Create tables using individual SQL commands
                    _a.sent();
                    // User Profiles
                    return [4 /*yield*/, prisma.$executeRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      CREATE TABLE IF NOT EXISTS app_user_profiles (\n        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n        \"userId\" VARCHAR(255) UNIQUE NOT NULL,\n        email VARCHAR(255) UNIQUE NOT NULL,\n        name VARCHAR(255),\n        country VARCHAR(10),\n        \"paypalEmail\" VARCHAR(255),\n        \"walletBalance\" INTEGER DEFAULT 0,\n        \"totalEarned\" INTEGER DEFAULT 0,\n        \"adsWatched\" INTEGER DEFAULT 0,\n        tier VARCHAR(50) DEFAULT 'Bronze',\n        \"createdAt\" TIMESTAMP DEFAULT NOW(),\n        \"updatedAt\" TIMESTAMP DEFAULT NOW()\n      )\n    "], ["\n      CREATE TABLE IF NOT EXISTS app_user_profiles (\n        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n        \"userId\" VARCHAR(255) UNIQUE NOT NULL,\n        email VARCHAR(255) UNIQUE NOT NULL,\n        name VARCHAR(255),\n        country VARCHAR(10),\n        \"paypalEmail\" VARCHAR(255),\n        \"walletBalance\" INTEGER DEFAULT 0,\n        \"totalEarned\" INTEGER DEFAULT 0,\n        \"adsWatched\" INTEGER DEFAULT 0,\n        tier VARCHAR(50) DEFAULT 'Bronze',\n        \"createdAt\" TIMESTAMP DEFAULT NOW(),\n        \"updatedAt\" TIMESTAMP DEFAULT NOW()\n      )\n    "
                            // Ads
                        ])))];
                case 3:
                    // User Profiles
                    _a.sent();
                    // Ads
                    return [4 /*yield*/, prisma.$executeRaw(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      CREATE TABLE IF NOT EXISTS app_ads (\n        id SERIAL PRIMARY KEY,\n        title VARCHAR(255) NOT NULL,\n        description TEXT,\n        \"videoUrl\" VARCHAR(500),\n        \"durationSeconds\" INTEGER NOT NULL,\n        \"rewardCents\" INTEGER NOT NULL,\n        \"isActive\" BOOLEAN DEFAULT true,\n        \"createdAt\" TIMESTAMP DEFAULT NOW(),\n        \"updatedAt\" TIMESTAMP DEFAULT NOW()\n      )\n    "], ["\n      CREATE TABLE IF NOT EXISTS app_ads (\n        id SERIAL PRIMARY KEY,\n        title VARCHAR(255) NOT NULL,\n        description TEXT,\n        \"videoUrl\" VARCHAR(500),\n        \"durationSeconds\" INTEGER NOT NULL,\n        \"rewardCents\" INTEGER NOT NULL,\n        \"isActive\" BOOLEAN DEFAULT true,\n        \"createdAt\" TIMESTAMP DEFAULT NOW(),\n        \"updatedAt\" TIMESTAMP DEFAULT NOW()\n      )\n    "
                            // Ad Views
                        ])))];
                case 4:
                    // Ads
                    _a.sent();
                    // Ad Views
                    return [4 /*yield*/, prisma.$executeRaw(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n      CREATE TABLE IF NOT EXISTS app_ad_views (\n        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n        \"userId\" VARCHAR(255) NOT NULL,\n        \"adId\" INTEGER NOT NULL,\n        \"watchedSeconds\" INTEGER NOT NULL,\n        completed BOOLEAN DEFAULT false,\n        \"rewardCents\" INTEGER NOT NULL,\n        \"createdAt\" TIMESTAMP DEFAULT NOW()\n      )\n    "], ["\n      CREATE TABLE IF NOT EXISTS app_ad_views (\n        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n        \"userId\" VARCHAR(255) NOT NULL,\n        \"adId\" INTEGER NOT NULL,\n        \"watchedSeconds\" INTEGER NOT NULL,\n        completed BOOLEAN DEFAULT false,\n        \"rewardCents\" INTEGER NOT NULL,\n        \"createdAt\" TIMESTAMP DEFAULT NOW()\n      )\n    "
                            // Withdrawals
                        ])))];
                case 5:
                    // Ad Views
                    _a.sent();
                    // Withdrawals
                    return [4 /*yield*/, prisma.$executeRaw(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n      CREATE TABLE IF NOT EXISTS app_withdrawals (\n        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n        \"userId\" VARCHAR(255) NOT NULL,\n        amount INTEGER NOT NULL,\n        method VARCHAR(50) NOT NULL,\n        status VARCHAR(50) NOT NULL,\n        \"paypalEmail\" VARCHAR(255) NOT NULL,\n        \"transactionId\" VARCHAR(255),\n        \"createdAt\" TIMESTAMP DEFAULT NOW(),\n        \"completedAt\" TIMESTAMP\n      )\n    "], ["\n      CREATE TABLE IF NOT EXISTS app_withdrawals (\n        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n        \"userId\" VARCHAR(255) NOT NULL,\n        amount INTEGER NOT NULL,\n        method VARCHAR(50) NOT NULL,\n        status VARCHAR(50) NOT NULL,\n        \"paypalEmail\" VARCHAR(255) NOT NULL,\n        \"transactionId\" VARCHAR(255),\n        \"createdAt\" TIMESTAMP DEFAULT NOW(),\n        \"completedAt\" TIMESTAMP\n      )\n    "
                            // Badges
                        ])))];
                case 6:
                    // Withdrawals
                    _a.sent();
                    // Badges
                    return [4 /*yield*/, prisma.$executeRaw(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n      CREATE TABLE IF NOT EXISTS app_badges (\n        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n        name VARCHAR(255) UNIQUE NOT NULL,\n        description TEXT NOT NULL,\n        icon VARCHAR(10) NOT NULL,\n        requirement JSONB NOT NULL,\n        \"rewardCents\" INTEGER NOT NULL\n      )\n    "], ["\n      CREATE TABLE IF NOT EXISTS app_badges (\n        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n        name VARCHAR(255) UNIQUE NOT NULL,\n        description TEXT NOT NULL,\n        icon VARCHAR(10) NOT NULL,\n        requirement JSONB NOT NULL,\n        \"rewardCents\" INTEGER NOT NULL\n      )\n    "
                            // User Badges
                        ])))];
                case 7:
                    // Badges
                    _a.sent();
                    // User Badges
                    return [4 /*yield*/, prisma.$executeRaw(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n      CREATE TABLE IF NOT EXISTS app_user_badges (\n        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n        \"userId\" VARCHAR(255) NOT NULL,\n        \"badgeId\" UUID NOT NULL,\n        \"earnedAt\" TIMESTAMP DEFAULT NOW(),\n        UNIQUE (\"userId\", \"badgeId\")\n      )\n    "], ["\n      CREATE TABLE IF NOT EXISTS app_user_badges (\n        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n        \"userId\" VARCHAR(255) NOT NULL,\n        \"badgeId\" UUID NOT NULL,\n        \"earnedAt\" TIMESTAMP DEFAULT NOW(),\n        UNIQUE (\"userId\", \"badgeId\")\n      )\n    "])))];
                case 8:
                    // User Badges
                    _a.sent();
                    console.log('✅ Database tables created successfully!');
                    return [2 /*return*/, true];
                case 9:
                    error_1 = _a.sent();
                    console.error('❌ Error creating tables:', error_1);
                    return [2 /*return*/, false];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function seedData() {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Seeding sample data...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // Insert sample ads
                    return [4 /*yield*/, prisma.$executeRaw(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n      INSERT INTO app_ads (title, description, \"videoUrl\", \"durationSeconds\", \"rewardCents\", \"isActive\")\n      VALUES \n        ('Product Demo - New Tech Gadget', 'Watch our latest product demonstration', 'https://sample-videos.com/demo.mp4', 30, 5, true),\n        ('Brand Story - Fashion Collection', 'Discover our new fashion line', 'https://sample-videos.com/fashion.mp4', 45, 8, true),\n        ('App Tutorial - Productivity Tools', 'Learn productivity tips', 'https://sample-videos.com/tutorial.mp4', 60, 10, true),\n        ('Travel Destination Showcase', 'Explore beautiful destinations', 'https://sample-videos.com/travel.mp4', 30, 6, true),\n        ('Health & Fitness Tips', 'Get expert health advice', 'https://sample-videos.com/health.mp4', 45, 7, true)\n      ON CONFLICT DO NOTHING\n    "], ["\n      INSERT INTO app_ads (title, description, \"videoUrl\", \"durationSeconds\", \"rewardCents\", \"isActive\")\n      VALUES \n        ('Product Demo - New Tech Gadget', 'Watch our latest product demonstration', 'https://sample-videos.com/demo.mp4', 30, 5, true),\n        ('Brand Story - Fashion Collection', 'Discover our new fashion line', 'https://sample-videos.com/fashion.mp4', 45, 8, true),\n        ('App Tutorial - Productivity Tools', 'Learn productivity tips', 'https://sample-videos.com/tutorial.mp4', 60, 10, true),\n        ('Travel Destination Showcase', 'Explore beautiful destinations', 'https://sample-videos.com/travel.mp4', 30, 6, true),\n        ('Health & Fitness Tips', 'Get expert health advice', 'https://sample-videos.com/health.mp4', 45, 7, true)\n      ON CONFLICT DO NOTHING\n    "
                            // Insert badges
                        ])))];
                case 2:
                    // Insert sample ads
                    _a.sent();
                    // Insert badges
                    return [4 /*yield*/, prisma.$executeRaw(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n      INSERT INTO app_badges (name, description, icon, requirement, \"rewardCents\")\n      VALUES \n        ('First Steps', 'Watch your first ad', '\uD83C\uDFAC', '{\"adsWatched\": 1}', 50),\n        ('Ad Enthusiast', 'Watch 50 ads', '\u2B50', '{\"adsWatched\": 50}', 100),\n        ('Century Club', 'Watch 100 ads', '\uD83D\uDCAF', '{\"adsWatched\": 100}', 250),\n        ('Early Bird', 'Watch an ad before 8 AM', '\uD83C\uDF05', '{\"timeOfDay\": \"before_8am\"}', 25),\n        ('Night Owl', 'Watch an ad after midnight', '\uD83E\uDD89', '{\"timeOfDay\": \"after_midnight\"}', 25),\n        ('Weekend Warrior', 'Watch ads for 10 consecutive weekends', '\u2694\uFE0F', '{\"weekendStreak\": 10}', 500),\n        ('Big Spender', 'Earn $50 in total', '\uD83D\uDCB0', '{\"totalEarned\": 5000}', 1000),\n        ('Dedication Master', 'Watch ads for 30 consecutive days', '\uD83D\uDD25', '{\"dailyStreak\": 30}', 2000)\n      ON CONFLICT (name) DO NOTHING\n    "], ["\n      INSERT INTO app_badges (name, description, icon, requirement, \"rewardCents\")\n      VALUES \n        ('First Steps', 'Watch your first ad', '\uD83C\uDFAC', '{\"adsWatched\": 1}', 50),\n        ('Ad Enthusiast', 'Watch 50 ads', '\u2B50', '{\"adsWatched\": 50}', 100),\n        ('Century Club', 'Watch 100 ads', '\uD83D\uDCAF', '{\"adsWatched\": 100}', 250),\n        ('Early Bird', 'Watch an ad before 8 AM', '\uD83C\uDF05', '{\"timeOfDay\": \"before_8am\"}', 25),\n        ('Night Owl', 'Watch an ad after midnight', '\uD83E\uDD89', '{\"timeOfDay\": \"after_midnight\"}', 25),\n        ('Weekend Warrior', 'Watch ads for 10 consecutive weekends', '\u2694\uFE0F', '{\"weekendStreak\": 10}', 500),\n        ('Big Spender', 'Earn $50 in total', '\uD83D\uDCB0', '{\"totalEarned\": 5000}', 1000),\n        ('Dedication Master', 'Watch ads for 30 consecutive days', '\uD83D\uDD25', '{\"dailyStreak\": 30}', 2000)\n      ON CONFLICT (name) DO NOTHING\n    "])))];
                case 3:
                    // Insert badges
                    _a.sent();
                    console.log('✅ Sample data inserted successfully!');
                    return [2 /*return*/, true];
                case 4:
                    error_2 = _a.sent();
                    console.error('❌ Error inserting sample data:', error_2);
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var tablesCreated, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 7]);
                    return [4 /*yield*/, setupTables()];
                case 1:
                    tablesCreated = _a.sent();
                    if (!tablesCreated) return [3 /*break*/, 3];
                    return [4 /*yield*/, seedData()];
                case 2:
                    _a.sent();
                    console.log('🎉 Database setup completed successfully!');
                    _a.label = 3;
                case 3: return [3 /*break*/, 7];
                case 4:
                    error_3 = _a.sent();
                    console.error('❌ Setup failed:', error_3);
                    throw error_3;
                case 5: return [4 /*yield*/, prisma.$disconnect()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error(error);
    process.exit(1);
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9;
