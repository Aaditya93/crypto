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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTradingAlert = handleTradingAlert;
exports.getCurrentPositions = getCurrentPositions;
exports.getPosition = getPosition;
exports.closePosition = closePosition;
exports.closeAllPositions = closeAllPositions;
exports.syncPositions = syncPositions;
const trade_js_1 = require("./trade.js");
// Simple in-memory position tracking (consider using a database for production)
const activePositions = new Map();
// Handler function for TradingView alerts
function handleTradingAlert(alertJson) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("Received alert:", alertJson);
            // Parse the JSON alert
            const alert = JSON.parse(alertJson);
            // Validate required fields
            if (!alert.symbol ||
                !alert.side ||
                !alert.type ||
                !alert.quantity ||
                !alert.trade) {
                throw new Error("Invalid alert: missing required fields (symbol, side, type, quantity, trade)");
            }
            console.log(`Processing ${alert.trade} ${alert.type} order: ${alert.side} ${alert.quantity} ${alert.symbol}`);
            // Route based on trade type
            if (alert.trade === "OPEN") {
                return yield handleOpenPosition(alert);
            }
            else if (alert.trade === "CLOSE") {
                return yield handleClosePosition(alert);
            }
            else {
                throw new Error(`Invalid trade type: ${alert.trade}. Must be OPEN or CLOSE`);
            }
        }
        catch (error) {
            console.error("Error handling trading alert:", error);
            throw error;
        }
    });
}
// Handle opening new positions
function handleOpenPosition(alert) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { symbol, side, quantity, type } = alert;
            const currentPosition = activePositions.get(symbol);
            // If position already exists, close it first
            if (currentPosition) {
                console.log(`Position already exists for ${symbol}. Closing existing position first.`);
                // Cancel all open orders for this symbol
                try {
                    const cancelResult = yield (0, trade_js_1.cancelAllOpenOrdersForSymbol)(symbol);
                    console.log(`Cancelled all open orders for ${symbol}:`, cancelResult);
                }
                catch (error) {
                    console.log("Could not cancel open orders:", error);
                }
                // Close existing position
                activePositions.delete(symbol);
                console.log(`Closed existing ${currentPosition.side} position for ${symbol}`);
            }
            // Place the new entry order
            const orderResult = yield (0, trade_js_1.placeOrder)({
                symbol: symbol,
                side: side,
                type: type,
                quantity: quantity,
                newOrderRespType: "FULL",
            });
            console.log("Entry order placed:", orderResult);
            // Store new position
            const newPosition = {
                symbol: symbol,
                side: side === "BUY" ? "LONG" : "SHORT",
                quantity: parseFloat(quantity),
                entryPrice: parseFloat(((_b = (_a = orderResult.fills) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.price) || orderResult.price || "0"),
                orderId: orderResult.orderId,
            };
            activePositions.set(symbol, newPosition);
            console.log(`New ${newPosition.side} position opened for ${symbol} at ${newPosition.entryPrice}`);
            return orderResult;
        }
        catch (error) {
            console.error("Error handling open position:", error);
            throw error;
        }
    });
}
// Handle closing positions (both manual exits and stop losses)
function handleClosePosition(alert) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { symbol, side, quantity, type } = alert;
            const currentPosition = activePositions.get(symbol);
            if (!currentPosition) {
                console.log(`No active position found for ${symbol}, skipping close order`);
                return { message: "No active position found" };
            }
            // For any close order, cancel all open orders first
            try {
                const cancelResult = yield (0, trade_js_1.cancelAllOpenOrdersForSymbol)(symbol);
                console.log(`Cancelled all open orders for ${symbol}:`, cancelResult);
            }
            catch (error) {
                console.log("Could not cancel open orders:", error);
            }
            // Handle market close (both manual exit and stop loss triggered)
            if (type === "MARKET") {
                console.log(`Market close order for ${symbol}`);
                // Place market order to close position
                const closeOrder = yield (0, trade_js_1.placeOrder)({
                    symbol: symbol,
                    side: side,
                    type: "MARKET",
                    quantity: quantity,
                    newOrderRespType: "FULL",
                });
                // Remove position from tracking
                activePositions.delete(symbol);
                console.log(`Position closed for ${symbol}`);
                return closeOrder;
            }
            throw new Error(`Unsupported close order type: ${type}`);
        }
        catch (error) {
            console.error("Error handling close position:", error);
            throw error;
        }
    });
}
// Simplified market order handler (legacy support)
function handleMarketOrder(alert) {
    return __awaiter(this, void 0, void 0, function* () {
        // This function is kept for backward compatibility
        // But the new strategy uses the trade field to determine OPEN/CLOSE
        const { symbol, side, quantity } = alert;
        const currentPosition = activePositions.get(symbol);
        const isEntry = !currentPosition;
        const isExit = currentPosition &&
            ((side === "SELL" && currentPosition.side === "LONG") ||
                (side === "BUY" && currentPosition.side === "SHORT"));
        if (isEntry) {
            return yield handleOpenPosition(Object.assign(Object.assign({}, alert), { trade: "OPEN" }));
        }
        else if (isExit) {
            return yield handleClosePosition(Object.assign(Object.assign({}, alert), { trade: "CLOSE" }));
        }
        throw new Error("Cannot determine if order is entry or exit");
    });
}
// Legacy stop loss handler (kept for compatibility)
function handleStopLossOrder(alert) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield handleClosePosition(Object.assign(Object.assign({}, alert), { trade: "CLOSE" }));
    });
}
// Utility function to get current positions
function getCurrentPositions() {
    return new Map(activePositions);
}
// Utility function to get position for a specific symbol
function getPosition(symbol) {
    return activePositions.get(symbol);
}
// Utility function to manually close a position
function closePosition(symbol) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const position = activePositions.get(symbol);
            if (!position) {
                throw new Error(`No active position found for ${symbol}`);
            }
            // Cancel all open orders for this symbol first
            try {
                const cancelResult = yield (0, trade_js_1.cancelAllOpenOrdersForSymbol)(symbol);
                console.log(`Cancelled all open orders for ${symbol}:`, cancelResult);
            }
            catch (error) {
                console.log("Could not cancel open orders:", error);
            }
            // Close position with market order
            const closeSide = position.side === "LONG" ? "SELL" : "BUY";
            const closeOrder = yield (0, trade_js_1.placeOrder)({
                symbol: symbol,
                side: closeSide,
                type: "MARKET",
                quantity: position.quantity.toString(),
            });
            // Remove from tracking
            activePositions.delete(symbol);
            console.log(`Position manually closed for ${symbol}`);
            return closeOrder;
        }
        catch (error) {
            console.error("Error closing position:", error);
            throw error;
        }
    });
}
// Emergency function to close all positions
function closeAllPositions() {
    return __awaiter(this, void 0, void 0, function* () {
        const results = [];
        for (const [symbol, position] of activePositions) {
            try {
                const result = yield closePosition(symbol);
                results.push({ symbol, status: "closed", result });
            }
            catch (error) {
                results.push({ symbol, status: "error", error });
            }
        }
        return results;
    });
}
// Function to check and sync positions with Binance account
function syncPositions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accountInfo = yield (0, trade_js_1.getAccountInfo)();
            console.log("Syncing positions with account...");
            // This is a basic sync - you might want to implement more sophisticated logic
            // based on your actual account balances and open orders
        }
        catch (error) {
            console.error("Error syncing positions:", error);
        }
    });
}
console.log("Trading alert handler initialized for RedTPX and SMI Strategy");
