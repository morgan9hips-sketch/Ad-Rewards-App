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
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var ads, badges, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Starting database seed...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 7]);
                    return [4 /*yield*/, prisma.ad.createMany({
                            data: [
                                {
                                    title: 'Product Demo - New Tech Gadget',
                                    description: 'Watch our latest product demonstration and earn rewards',
                                    videoUrl: 'https://sample-videos.com/zip/10/mp4/30sec.mp4',
                                    durationSeconds: 30,
                                    rewardCents: 5, // $0.05
                                    isActive: true,
                                },
                                {
                                    title: 'Brand Story - Fashion Collection',
                                    description: 'Discover our new fashion line for the season',
                                    videoUrl: 'https://sample-videos.com/zip/10/mp4/45sec.mp4',
                                    durationSeconds: 45,
                                    rewardCents: 8, // $0.08
                                    isActive: true,
                                },
                                {
                                    title: 'App Tutorial - Productivity Tools',
                                    description: 'Learn how to use our productivity app effectively',
                                    videoUrl: 'https://sample-videos.com/zip/10/mp4/60sec.mp4',
                                    durationSeconds: 60,
                                    rewardCents: 10, // $0.10
                                    isActive: true,
                                },
                                {
                                    title: 'Travel Destination Showcase',
                                    description: 'Explore beautiful travel destinations around the world',
                                    videoUrl: 'https://sample-videos.com/zip/10/mp4/30sec.mp4',
                                    durationSeconds: 30,
                                    rewardCents: 6, // $0.06
                                    isActive: true,
                                },
                                {
                                    title: 'Health & Fitness Tips',
                                    description: 'Get expert advice on staying healthy and fit',
                                    videoUrl: 'https://sample-videos.com/zip/10/mp4/45sec.mp4',
                                    durationSeconds: 45,
                                    rewardCents: 7, // $0.07
                                    isActive: true,
                                },
                            ],
                        })
                        // Create sample badges
                    ];
                case 2:
                    ads = _a.sent();
                    return [4 /*yield*/, prisma.badge.createMany({
                            data: [
                                {
                                    name: 'First Steps',
                                    description: 'Watch your first ad',
                                    icon: '🎬',
                                    requirement: { adsWatched: 1 },
                                    rewardCents: 50, // $0.50 bonus
                                },
                                {
                                    name: 'Ad Enthusiast',
                                    description: 'Watch 50 ads',
                                    icon: '⭐',
                                    requirement: { adsWatched: 50 },
                                    rewardCents: 100, // $1.00 bonus
                                },
                                {
                                    name: 'Century Club',
                                    description: 'Watch 100 ads',
                                    icon: '💯',
                                    requirement: { adsWatched: 100 },
                                    rewardCents: 250, // $2.50 bonus
                                },
                                {
                                    name: 'Early Bird',
                                    description: 'Watch an ad before 8 AM',
                                    icon: '🌅',
                                    requirement: { timeOfDay: 'before_8am' },
                                    rewardCents: 25, // $0.25 bonus
                                },
                                {
                                    name: 'Night Owl',
                                    description: 'Watch an ad after midnight',
                                    icon: '🦉',
                                    requirement: { timeOfDay: 'after_midnight' },
                                    rewardCents: 25, // $0.25 bonus
                                },
                                {
                                    name: 'Weekend Warrior',
                                    description: 'Watch ads for 10 consecutive weekends',
                                    icon: '⚔️',
                                    requirement: { weekendStreak: 10 },
                                    rewardCents: 500, // $5.00 bonus
                                },
                                {
                                    name: 'Big Spender',
                                    description: 'Earn $50 in total',
                                    icon: '💰',
                                    requirement: { totalEarned: 5000 }, // $50.00 in cents
                                    rewardCents: 1000, // $10.00 bonus
                                },
                                {
                                    name: 'Dedication Master',
                                    description: 'Watch ads for 30 consecutive days',
                                    icon: '🔥',
                                    requirement: { dailyStreak: 30 },
                                    rewardCents: 2000, // $20.00 bonus
                                },
                            ],
                        })];
                case 3:
                    badges = _a.sent();
                    console.log("\u2705 Created ".concat(ads.count, " sample ads"));
                    console.log("\u2705 Created ".concat(badges.count, " badges"));
                    console.log('🎉 Database seed completed successfully!');
                    return [3 /*break*/, 7];
                case 4:
                    error_1 = _a.sent();
                    console.error('❌ Error seeding database:', error_1);
                    throw error_1;
                case 5: return [4 /*yield*/, prisma.$disconnect()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
seed().catch(function (error) {
    console.error(error);
    process.exit(1);
});
