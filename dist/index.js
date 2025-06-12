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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const trade_js_1 = require("./trade.js");
const handel_js_1 = require("./handel.js");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 80; // Changed to port 80
const HTTPS_PORT = process.env.HTTPS_PORT || 443; // Changed to port 443
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("combined"));
// Middleware to parse JSON bodies
app.use(express_1.default.json());
// Webhook route for TradingView alerts
app.post("/api/webhook", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Received webhook request");
        console.log("Headers:", req.headers);
        console.log("Webhook received:", req.body);
        console.log("Request timestamp:", new Date().toISOString());
        const webhookData = req.body;
        // Check if this is a TradingView alert with JSON structure
        if (webhookData && typeof webhookData === "object" && webhookData.symbol) {
            console.log("Processing TradingView alert...");
            try {
                // Convert the webhook data to JSON string for the handler
                const alertJson = JSON.stringify(webhookData);
                // Handle the trading alert
                const tradeResult = yield (0, handel_js_1.handleTradingAlert)(alertJson);
                console.log("Trade executed successfully:", tradeResult);
                res.status(200).json({
                    success: true,
                    message: "Trading alert processed successfully",
                    timestamp: new Date().toISOString(),
                    trade: {
                        symbol: webhookData.symbol,
                        side: webhookData.side,
                        type: webhookData.type,
                        quantity: webhookData.quantity,
                        trade: webhookData.trade,
                    },
                    result: tradeResult,
                });
            }
            catch (tradeError) {
                console.error("Trading error:", tradeError);
                res.status(400).json({
                    success: false,
                    message: "Failed to process trading alert",
                    error: tradeError.message,
                    timestamp: new Date().toISOString(),
                    data: webhookData,
                });
            }
        }
        else if (typeof webhookData === "string") {
            // Handle raw JSON string alerts
            console.log("Processing raw JSON string alert...");
            try {
                const tradeResult = yield (0, handel_js_1.handleTradingAlert)(webhookData);
                console.log("Trade executed successfully:", tradeResult);
                res.status(200).json({
                    success: true,
                    message: "Trading alert processed successfully",
                    timestamp: new Date().toISOString(),
                    result: tradeResult,
                });
            }
            catch (tradeError) {
                console.error("Trading error:", tradeError);
                res.status(400).json({
                    success: false,
                    message: "Failed to process trading alert",
                    error: tradeError.message,
                    timestamp: new Date().toISOString(),
                    data: webhookData,
                });
            }
        }
        else {
            // Regular webhook (non-trading)
            console.log("Regular webhook received (non-trading)");
            res.status(200).json({
                success: true,
                message: "Webhook received successfully",
                timestamp: new Date().toISOString(),
                data: webhookData,
            });
        }
    }
    catch (error) {
        console.error("Webhook error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            message: error.message,
            timestamp: new Date().toISOString(),
        });
    }
}));
app.get("/api/account", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { omitZeroBalances } = req.query;
        const accountInfo = yield (0, trade_js_1.getAccountInfo)(omitZeroBalances === "true", 5000 // recvWindow
        );
        res.status(200).json({
            success: true,
            account: accountInfo,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Error getting account info:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get account info",
            message: error.message,
        });
    }
}));
// Get current positions endpoint
app.get("/api/positions", (req, res) => {
    try {
        const positions = (0, handel_js_1.getCurrentPositions)();
        const positionsArray = Array.from(positions.entries()).map(([symbol, position]) => (Object.assign({ symbol }, position)));
        res.status(200).json({
            success: true,
            positions: positionsArray,
            count: positionsArray.length,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Error getting positions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get positions",
            message: error.message,
        });
    }
});
// Close specific position endpoint
app.post("/api/positions/:symbol/close", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol } = req.params;
        const result = yield (0, handel_js_1.closePosition)(symbol);
        res.status(200).json({
            success: true,
            message: `Position closed for ${symbol}`,
            result: result,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Error closing position:", error);
        res.status(400).json({
            success: false,
            error: "Failed to close position",
            message: error.message,
        });
    }
}));
// Close all positions endpoint
app.post("/api/positions/close-all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const results = yield (0, handel_js_1.closeAllPositions)();
        res.status(200).json({
            success: true,
            message: "All positions closed",
            results: results,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("Error closing all positions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to close all positions",
            message: error.message,
        });
    }
}));
// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        server: "bukxe.com",
    });
});
// Check if SSL certificates exist
const certPath = "ssl/cert.pem";
const keyPath = "ssl/key.pem";
let httpsServerStarted = false;
if (fs_1.default.existsSync(certPath) && fs_1.default.existsSync(keyPath)) {
    try {
        const sslOptions = {
            key: fs_1.default.readFileSync(keyPath),
            cert: fs_1.default.readFileSync(certPath),
        };
        // Start HTTPS server - bind to all interfaces
        https_1.default.createServer(sslOptions, app).listen(HTTPS_PORT, "0.0.0.0", () => {
            console.log(`✅ HTTPS Server running on port ${HTTPS_PORT}`);
            httpsServerStarted = true;
        });
    }
    catch (error) {
        console.error("❌ Failed to start HTTPS server:", error.message);
        console.log("Starting HTTP server only...");
    }
}
else {
    console.log("⚠️  SSL certificates not found.");
    console.log("📝 To create SSL certificates, run:");
    console.log("   mkdir -p ssl");
    console.log("   openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes");
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
