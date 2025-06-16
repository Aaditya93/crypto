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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handel_js_1 = require("./handel.js");
const futures_js_1 = require("./futures.js");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
// Middleware
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// CORS headers
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
    }
    else {
        next();
    }
});
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "Futures Trading Bot",
        version: "2.0.0",
    });
});
// Main webhook endpoint for TradingView alerts
app.post("/api/webhook", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("📈 Received trading webhook:", req.body);
        const alertData = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
        const result = yield (0, handel_js_1.handleFuturesTradingAlert)(alertData);
        res.status(200).json({
            success: true,
            message: "Futures trading alert processed successfully",
            result: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("❌ Error processing trading alert:", error);
        res.status(500).json({
            success: false,
            error: "Failed to process trading alert",
            message: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
        });
    }
}));
// Futures account info
app.get("/api/futures/account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accountInfo = yield (0, futures_js_1.getFuturesAccountInfo)();
        res.status(200).json({
            success: true,
            accountInfo: accountInfo,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("❌ Error getting futures account info:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get futures account info",
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Get futures positions
app.get("/api/futures/positions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const positions = yield (0, futures_js_1.getFuturesPositions)();
        const localPositions = Array.from((0, handel_js_1.getCurrentFuturesPositions)().values());
        res.status(200).json({
            success: true,
            binancePositions: positions,
            localPositions: localPositions,
            activeCount: positions.filter((p) => parseFloat(p.positionAmt) !== 0)
                .length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("❌ Error getting futures positions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get futures positions",
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Get specific position
app.get("/api/futures/positions/:symbol", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol } = req.params;
        const position = (0, handel_js_1.getFuturesPosition)(symbol.toUpperCase());
        if (!position) {
            return res.status(404).json({
                success: false,
                error: `No position found for ${symbol}`,
            });
        }
        res.status(200).json({
            success: true,
            position: position,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error(`❌ Error getting position for ${req.params.symbol}:`, error);
        res.status(500).json({
            success: false,
            error: `Failed to get position for ${req.params.symbol}`,
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Close specific position
app.post("/api/futures/positions/:symbol/close", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol } = req.params;
        const result = yield (0, handel_js_1.closeFuturesPosition)(symbol.toUpperCase());
        res.status(200).json({
            success: true,
            message: `Position closed for ${symbol}`,
            result: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error(`❌ Error closing position for ${req.params.symbol}:`, error);
        res.status(500).json({
            success: false,
            error: `Failed to close position for ${req.params.symbol}`,
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Close all positions (emergency)
app.post("/api/futures/positions/close-all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield (0, handel_js_1.closeAllFuturesPositions)();
        const successCount = results.filter((r) => r.status === "closed").length;
        res.status(200).json({
            success: true,
            message: `Closed ${successCount}/${results.length} positions`,
            results: results,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("❌ Error closing all positions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to close all positions",
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Smart risk order endpoint
app.post("/api/futures/smart-risk", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { symbol, side } = _a, customRisk = __rest(_a, ["symbol", "side"]);
        if (!symbol || !side) {
            return res.status(400).json({
                success: false,
                error: "Missing required parameters",
                required: ["symbol", "side"],
            });
        }
        const result = yield (0, futures_js_1.placeSmartRiskOrder)(symbol, side, customRisk);
        res.status(200).json({
            success: true,
            message: `Smart risk order placed for ${symbol}`,
            result: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("❌ Error placing smart risk order:", error);
        res.status(500).json({
            success: false,
            error: "Failed to place smart risk order",
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Risk-managed order endpoint
app.post("/api/futures/risk-order", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol, side, type = "MARKET", price, leverage = 10, riskPerTradePercent = 1.0, stopLossPercent = 0.25, minOrderSize = 0.001, } = req.body;
        if (!symbol || !side) {
            return res.status(400).json({
                success: false,
                error: "Missing required parameters",
                required: ["symbol", "side"],
            });
        }
        const result = yield (0, futures_js_1.placeRiskManagedOrder)({
            symbol,
            side,
            type,
            price,
            leverage,
            riskConfig: {
                riskPerTradePercent,
                stopLossPercent,
                minOrderSize,
            },
        });
        res.status(200).json({
            success: true,
            message: `Risk-managed order placed for ${symbol}`,
            result: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("❌ Error placing risk-managed order:", error);
        res.status(500).json({
            success: false,
            error: "Failed to place risk-managed order",
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Batch risk orders
app.post("/api/futures/batch-risk", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orders } = req.body;
        if (!orders || !Array.isArray(orders)) {
            return res.status(400).json({
                success: false,
                error: "Orders array is required",
            });
        }
        const results = yield (0, futures_js_1.placeBatchRiskOrders)(orders);
        const successCount = results.filter((r) => r.success).length;
        res.status(200).json({
            success: true,
            message: `Batch risk orders completed: ${successCount}/${results.length} successful`,
            results: results,
            summary: {
                total: results.length,
                successful: successCount,
                failed: results.length - successCount,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("❌ Error placing batch risk orders:", error);
        res.status(500).json({
            success: false,
            error: "Failed to place batch risk orders",
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Set leverage for symbol
app.post("/api/futures/leverage", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol, leverage } = req.body;
        if (!symbol || !leverage) {
            return res.status(400).json({
                success: false,
                error: "Missing required parameters",
                required: ["symbol", "leverage"],
            });
        }
        const result = yield (0, futures_js_1.changeFuturesLeverage)(symbol, leverage);
        res.status(200).json({
            success: true,
            message: `Leverage set to ${leverage}x for ${symbol}`,
            result: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("❌ Error setting leverage:", error);
        res.status(500).json({
            success: false,
            error: "Failed to set leverage",
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Get current price
app.get("/api/futures/price/:symbol", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol } = req.params;
        const isCoinM = symbol.includes("USDM") ||
            (symbol.includes("USD") && symbol.match(/\d{3}$/));
        const price = yield (0, futures_js_1.getCurrentPrice)(symbol.toUpperCase(), isCoinM);
        res.status(200).json({
            success: true,
            symbol: symbol.toUpperCase(),
            price: price,
            contractType: isCoinM ? "COIN-M" : "USDT-M",
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error(`❌ Error getting price for ${req.params.symbol}:`, error);
        res.status(500).json({
            success: false,
            error: `Failed to get price for ${req.params.symbol}`,
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Get account capital
app.get("/api/futures/capital", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { coinM } = req.query;
        const capital = yield (0, futures_js_1.getAccountCapital)(coinM === "true");
        res.status(200).json({
            success: true,
            capital: capital,
            contractType: coinM === "true" ? "COIN-M" : "USDT-M",
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("❌ Error getting account capital:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get account capital",
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Test trades endpoint
app.post("/api/futures/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield (0, futures_js_1.placeSmallTestTrades)();
        res.status(200).json({
            success: true,
            message: "Test trades completed",
            results: results,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("❌ Error running test trades:", error);
        res.status(500).json({
            success: false,
            error: "Failed to run test trades",
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Sync positions
app.post("/api/futures/sync", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, handel_js_1.syncFuturesPositions)();
        const positions = Array.from((0, handel_js_1.getCurrentFuturesPositions)().values());
        res.status(200).json({
            success: true,
            message: "Positions synced successfully",
            positions: positions,
            count: positions.length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("❌ Error syncing positions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to sync positions",
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// Cancel order
app.delete("/api/futures/orders/:symbol/:orderId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol, orderId } = req.params;
        const result = yield (0, futures_js_1.cancelFuturesOrder)(symbol.toUpperCase(), parseInt(orderId));
        res.status(200).json({
            success: true,
            message: `Order ${orderId} cancelled for ${symbol}`,
            result: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error(`❌ Error cancelling order ${req.params.orderId}:`, error);
        res.status(500).json({
            success: false,
            error: `Failed to cancel order ${req.params.orderId}`,
            message: error instanceof Error ? error.message : String(error),
        });
    }
}));
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Endpoint not found",
        message: `The requested endpoint ${req.method} ${req.path} was not found`,
        availableEndpoints: [
            "POST /api/webhook",
            "GET /api/futures/account",
            "GET /api/futures/positions",
            "POST /api/futures/smart-risk",
            "POST /api/futures/risk-order",
            "POST /api/futures/positions/close-all",
            "GET /health",
        ],
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error("❌ Unhandled error:", err);
    res.status(500).json({
        success: false,
        error: "Internal server error",
        message: err.message || "An unexpected error occurred",
        timestamp: new Date().toISOString(),
    });
});
// HTTPS setup (optional)
let httpsServerStarted = false;
try {
    const keyPath = path_1.default.join(__dirname, "../certs/private-key.pem");
    const certPath = path_1.default.join(__dirname, "../certs/certificate.pem");
    if (fs_1.default.existsSync(keyPath) && fs_1.default.existsSync(certPath)) {
        const sslOptions = {
            key: fs_1.default.readFileSync(keyPath),
            cert: fs_1.default.readFileSync(certPath),
        };
        https_1.default.createServer(sslOptions, app).listen(HTTPS_PORT, "0.0.0.0", () => {
            console.log(`✅ HTTPS Server running on port ${HTTPS_PORT}`);
            httpsServerStarted = true;
        });
    }
    else {
        console.log("⚠️  SSL certificates not found.");
        console.log("📝 To create SSL certificates, run:");
        console.log("   mkdir -p ssl");
        console.log("   openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes");
    }
}
catch (error) {
    console.error("❌ Failed to start HTTPS server:", error.message);
}
// Start HTTP server - bind to all interfaces (0.0.0.0)
http_1.default.createServer(app).listen(PORT, "0.0.0.0", () => {
    console.log(`✅ HTTP Server running on port ${PORT}`);
    console.log(`🌐 Trading Bot Server accessible at:`);
    console.log(`   - http://localhost:${PORT}`);
    console.log(`   - http://bukxe.com`);
    if (httpsServerStarted) {
        console.log(`   - https://localhost:${HTTPS_PORT}`);
        console.log(`   - https://bukxe.com`);
    }
    console.log(`📊 API Endpoints:`);
    console.log(`   - POST /api/webhook (TradingView alerts)`);
    console.log(`   - GET  /api/positions (view positions)`);
    console.log(`   - POST /api/positions/:symbol/close (close position)`);
    console.log(`   - POST /api/positions/close-all (emergency close)`);
});
