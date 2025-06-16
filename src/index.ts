// @ts-nocheck

import express from "express";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import {
  handleFuturesTradingAlert,
  getCurrentFuturesPositions,
  closeFuturesPosition,
  syncFuturesPositions,
  getFuturesPosition,
} from "./handel.js";
import {
  getFuturesAccountInfo,
  getFuturesPositions,
  placeSmartRiskOrder,
  placeRiskManagedOrder,
  placeBatchRiskOrders,
  getCurrentPrice,
  getAccountCapital,
  changeFuturesLeverage,
  cancelFuturesOrder,
  placeSmallTestTrades,
} from "./futures.js";

const app = express();
const PORT = Number(process.env.PORT) || 80;
const HTTPS_PORT = Number(process.env.HTTPS_PORT) || 443;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
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
app.post("/api/webhook", async (req, res) => {
  try {
    console.log("📈 Received trading webhook:", req.body);

    const alertData =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    const result = await handleFuturesTradingAlert(alertData);

    res.status(200).json({
      success: true,
      message: "Futures trading alert processed successfully",
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error processing trading alert:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process trading alert",
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

// Futures account info
app.get("/api/futures/account", async (req, res) => {
  try {
    const accountInfo = await getFuturesAccountInfo();

    res.status(200).json({
      success: true,
      accountInfo: accountInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error getting futures account info:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get futures account info",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get futures positions
app.get("/api/futures/positions", async (req, res) => {
  try {
    const positions = await getFuturesPositions();
    const localPositions = Array.from(getCurrentFuturesPositions().values());

    res.status(200).json({
      success: true,
      binancePositions: positions,
      localPositions: localPositions,
      activeCount: positions.filter((p: any) => parseFloat(p.positionAmt) !== 0)
        .length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error getting futures positions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get futures positions",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get specific position
app.get("/api/futures/positions/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const position = getFuturesPosition(symbol.toUpperCase());

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
  } catch (error) {
    console.error(`❌ Error getting position for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to get position for ${req.params.symbol}`,
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Close specific position
app.post("/api/futures/positions/:symbol/close", async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await closeFuturesPosition(symbol.toUpperCase());

    res.status(200).json({
      success: true,
      message: `Position closed for ${symbol}`,
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`❌ Error closing position for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to close position for ${req.params.symbol}`,
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Smart risk order endpoint
app.post("/api/futures/smart-risk", async (req, res) => {
  try {
    const { symbol, side, ...customRisk } = req.body;

    if (!symbol || !side) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters",
        required: ["symbol", "side"],
      });
    }

    const result = await placeSmartRiskOrder(symbol, side, customRisk);

    res.status(200).json({
      success: true,
      message: `Smart risk order placed for ${symbol}`,
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error placing smart risk order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to place smart risk order",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Risk-managed order endpoint
app.post("/api/futures/risk-order", async (req, res) => {
  try {
    const {
      symbol,
      side,
      type = "MARKET",
      price,
      leverage = 10,
      riskPerTradePercent = 1.0,
      stopLossPercent = 0.25,
      minOrderSize = 0.001,
    } = req.body;

    if (!symbol || !side) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters",
        required: ["symbol", "side"],
      });
    }

    const result = await placeRiskManagedOrder({
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
  } catch (error) {
    console.error("❌ Error placing risk-managed order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to place risk-managed order",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Batch risk orders
app.post("/api/futures/batch-risk", async (req, res) => {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        error: "Orders array is required",
      });
    }

    const results = await placeBatchRiskOrders(orders);
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
  } catch (error) {
    console.error("❌ Error placing batch risk orders:", error);
    res.status(500).json({
      success: false,
      error: "Failed to place batch risk orders",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Set leverage for symbol
app.post("/api/futures/leverage", async (req, res) => {
  try {
    const { symbol, leverage } = req.body;

    if (!symbol || !leverage) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters",
        required: ["symbol", "leverage"],
      });
    }

    const result = await changeFuturesLeverage(symbol, leverage);

    res.status(200).json({
      success: true,
      message: `Leverage set to ${leverage}x for ${symbol}`,
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error setting leverage:", error);
    res.status(500).json({
      success: false,
      error: "Failed to set leverage",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get current price
app.get("/api/futures/price/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;
    const isCoinM =
      symbol.includes("USDM") ||
      (symbol.includes("USD") && symbol.match(/\d{3}$/));
    const price = await getCurrentPrice(symbol.toUpperCase(), isCoinM);

    res.status(200).json({
      success: true,
      symbol: symbol.toUpperCase(),
      price: price,
      contractType: isCoinM ? "COIN-M" : "USDT-M",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`❌ Error getting price for ${req.params.symbol}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to get price for ${req.params.symbol}`,
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Get account capital
app.get("/api/futures/capital", async (req, res) => {
  try {
    const { coinM } = req.query;
    const capital = await getAccountCapital(coinM === "true");

    res.status(200).json({
      success: true,
      capital: capital,
      contractType: coinM === "true" ? "COIN-M" : "USDT-M",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error getting account capital:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get account capital",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Test trades endpoint
app.post("/api/futures/test", async (req, res) => {
  try {
    const results = await placeSmallTestTrades();

    res.status(200).json({
      success: true,
      message: "Test trades completed",
      results: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error running test trades:", error);
    res.status(500).json({
      success: false,
      error: "Failed to run test trades",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Sync positions
app.post("/api/futures/sync", async (req, res) => {
  try {
    await syncFuturesPositions();
    const positions = Array.from(getCurrentFuturesPositions().values());

    res.status(200).json({
      success: true,
      message: "Positions synced successfully",
      positions: positions,
      count: positions.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error syncing positions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to sync positions",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Cancel order
app.delete("/api/futures/orders/:symbol/:orderId", async (req, res) => {
  try {
    const { symbol, orderId } = req.params;
    const result = await cancelFuturesOrder(
      symbol.toUpperCase(),
      parseInt(orderId)
    );

    res.status(200).json({
      success: true,
      message: `Order ${orderId} cancelled for ${symbol}`,
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`❌ Error cancelling order ${req.params.orderId}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to cancel order ${req.params.orderId}`,
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

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
app.use((err: any, req: any, res: any, next: any) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message || "An unexpected error occurred",
    timestamp: new Date().toISOString(),
  });
});

// HTTPS setup - MANDATORY with auto-certificate creation
try {
  const sslDir = path.join(__dirname, "ssl");
  const keyPath = path.join(sslDir, "key.pem");
  const certPath = path.join(sslDir, "cert.pem");

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log(
      "🔒 SSL certificates not found. Creating self-signed certificates..."
    );

    try {
      // Create ssl directory if it doesn't exist
      if (!fs.existsSync(sslDir)) {
        fs.mkdirSync(sslDir, { recursive: true });
        console.log("📁 Created ssl directory");
      }

      // Generate self-signed SSL certificate
      const openSSLCommand = `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`;

      console.log("🔐 Generating SSL certificates...");
      execSync(openSSLCommand, { stdio: "inherit" });

      console.log("✅ SSL certificates created successfully!");
      console.log(`   - Private key: ${keyPath}`);
      console.log(`   - Certificate: ${certPath}`);
    } catch (certError) {
      console.error("❌ Failed to create SSL certificates:", certError);
      console.log(
        "📝 Please install OpenSSL and try again, or create certificates manually:"
      );
      console.log("   mkdir -p ssl");
      console.log(
        "   openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes"
      );
      console.log(
        "⚠️  Server cannot start without SSL certificates. Exiting..."
      );
      process.exit(1);
    }
  } else {
    console.log("✅ SSL certificates found");
  }

  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };

  // Start HTTPS server - MANDATORY
  https.createServer(sslOptions, app).listen(HTTPS_PORT, "0.0.0.0", () => {
    console.log(`✅ HTTPS Server running on port ${HTTPS_PORT}`);
    console.log(`🔒 Secure Trading Bot Server accessible at:`);
    console.log(`   - https://localhost:${HTTPS_PORT}`);
    console.log(`   - https://bukxe.com`);
    console.log(`📊 API Endpoints (HTTPS only):`);
    console.log(`   - POST /api/webhook (TradingView alerts)`);
    console.log(`   - GET  /api/futures/positions (view positions)`);
    console.log(
      `   - POST /api/futures/positions/:symbol/close (close position)`
    );
    console.log(`   - POST /api/futures/positions/close-all (emergency close)`);
    console.log(
      "⚠️  Note: Using self-signed certificate. Browsers will show security warning."
    );
  });
} catch (error) {
  console.error(
    "❌ Failed to start HTTPS server:",
    error instanceof Error ? error.message : String(error)
  );
  console.log("⚠️  HTTPS server is mandatory. Exiting...");
  process.exit(1);
}

// HTTP server removed - HTTPS only
console.log("🔒 Server running in HTTPS-only mode for security");
