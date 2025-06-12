// @ts-nocheck
import express from "express";
import https from "https";
import http from "http";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import {
  handleTradingAlert,
  getCurrentPositions,
  closePosition,
  closeAllPositions,
} from "./handel.js";

const app = express();
const PORT = process.env.PORT || 80; // Changed to port 80
const HTTPS_PORT = process.env.HTTPS_PORT || 443; // Changed to port 443

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));

// Middleware to parse JSON bodies
app.use(express.json());

// Webhook route for TradingView alerts
app.post("/api/webhook", async (req, res) => {
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
        const tradeResult = await handleTradingAlert(alertJson);

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
      } catch (tradeError) {
        console.error("Trading error:", tradeError);

        res.status(400).json({
          success: false,
          message: "Failed to process trading alert",
          error: tradeError.message,
          timestamp: new Date().toISOString(),
          data: webhookData,
        });
      }
    } else if (typeof webhookData === "string") {
      // Handle raw JSON string alerts
      console.log("Processing raw JSON string alert...");

      try {
        const tradeResult = await handleTradingAlert(webhookData);

        console.log("Trade executed successfully:", tradeResult);

        res.status(200).json({
          success: true,
          message: "Trading alert processed successfully",
          timestamp: new Date().toISOString(),
          result: tradeResult,
        });
      } catch (tradeError) {
        console.error("Trading error:", tradeError);

        res.status(400).json({
          success: false,
          message: "Failed to process trading alert",
          error: tradeError.message,
          timestamp: new Date().toISOString(),
          data: webhookData,
        });
      }
    } else {
      // Regular webhook (non-trading)
      console.log("Regular webhook received (non-trading)");

      res.status(200).json({
        success: true,
        message: "Webhook received successfully",
        timestamp: new Date().toISOString(),
        data: webhookData,
      });
    }
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Get current positions endpoint
app.get("/api/positions", (req, res) => {
  try {
    const positions = getCurrentPositions();
    const positionsArray = Array.from(positions.entries()).map(
      ([symbol, position]) => ({
        symbol,
        ...position,
      })
    );

    res.status(200).json({
      success: true,
      positions: positionsArray,
      count: positionsArray.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error getting positions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get positions",
      message: error.message,
    });
  }
});

// Close specific position endpoint
app.post("/api/positions/:symbol/close", async (req, res) => {
  try {
    const { symbol } = req.params;
    const result = await closePosition(symbol);

    res.status(200).json({
      success: true,
      message: `Position closed for ${symbol}`,
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error closing position:", error);
    res.status(400).json({
      success: false,
      error: "Failed to close position",
      message: error.message,
    });
  }
});

// Close all positions endpoint
app.post("/api/positions/close-all", async (req, res) => {
  try {
    const results = await closeAllPositions();

    res.status(200).json({
      success: true,
      message: "All positions closed",
      results: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error closing all positions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to close all positions",
      message: error.message,
    });
  }
});

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

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  try {
    const sslOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };

    // Start HTTPS server - bind to all interfaces
    https.createServer(sslOptions, app).listen(HTTPS_PORT, "0.0.0.0", () => {
      console.log(`✅ HTTPS Server running on port ${HTTPS_PORT}`);
      httpsServerStarted = true;
    });
  } catch (error) {
    console.error("❌ Failed to start HTTPS server:", error.message);
    console.log("Starting HTTP server only...");
  }
} else {
  console.log("⚠️  SSL certificates not found.");
  console.log("📝 To create SSL certificates, run:");
  console.log("   mkdir -p ssl");
  console.log(
    "   openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes"
  );
}

// Start HTTP server - bind to all interfaces (0.0.0.0)
http.createServer(app).listen(PORT, "0.0.0.0", () => {
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
