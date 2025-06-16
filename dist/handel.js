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
exports.convertTradingViewToBinance = convertTradingViewToBinance;
exports.handleFuturesTradingAlert = handleFuturesTradingAlert;
exports.closeFuturesPosition = closeFuturesPosition;
exports.forceCloseAllPositions = forceCloseAllPositions;
exports.getCurrentFuturesPositions = getCurrentFuturesPositions;
exports.getFuturesPosition = getFuturesPosition;
exports.syncFuturesPositions = syncFuturesPositions;
exports.handleTradingAlert = handleTradingAlert;
const futures_js_1 = require("./futures.js");
// TradingView to Binance symbol mappings
const TRADINGVIEW_TO_BINANCE_MAP = {
    // Quarterly contracts - convert to perpetual USDT-M
    LINKUSDM2025: "LINKUSDT",
    ETHUSDM2025: "ETHUSDT",
    ETHUSDT27M2025: "ETHUSDT",
    SOLUSDM2025: "SOLUSDT",
    BNBUSDM2025: "BNBUSDT",
    LTCUSDM2025: "LTCUSDT",
    XRPUSDM2025: "XRPUSDT",
    // Common TradingView format variations
    LINKUSD_250627: "LINKUSDT",
    ETHUSD_250627: "ETHUSDT",
    BTCUSD_250627: "BTCUSDT",
    SOLUSD_250627: "SOLUSDT",
    ADAUSD_250627: "ADAUSDT",
    BNBUSD_250627: "BNBUSDT",
    // Perpetual contract variations
    LINKUSD_PERP: "LINKUSDT",
    ETHUSD_PERP: "ETHUSDT",
    BTCUSD_PERP: "BTCUSDT",
    SOLUSD_PERP: "SOLUSDT",
    ADAUSD_PERP: "ADAUSDT",
    BNBUSD_PERP: "BNBUSDT",
    // Other common variations
    ETHUSDC: "ETHUSDT",
    BTCUSDC: "BTCUSDT",
    LINKUSDC: "LINKUSDT",
};
// Base asset extraction patterns
const BASE_ASSET_PATTERNS = [
    /^([A-Z]+)USDM\d{4}$/, // LINKUSDM2025 -> LINK
    /^([A-Z]+)USDT\d+M\d{4}$/, // ETHUSDT27M2025 -> ETH
    /^([A-Z]+)USD_\d{6}$/, // LINKUSD_250627 -> LINK
    /^([A-Z]+)USD_PERP$/, // LINKUSD_PERP -> LINK
    /^([A-Z]+)USDC$/, // ETHUSDC -> ETH
];
/**
 * Converts TradingView symbol to proper Binance futures symbol
 */
function convertTradingViewToBinance(symbol) {
    const originalSymbol = symbol.toUpperCase().trim();
    try {
        // Direct mapping lookup
        if (TRADINGVIEW_TO_BINANCE_MAP[originalSymbol]) {
            return {
                originalSymbol,
                binanceSymbol: TRADINGVIEW_TO_BINANCE_MAP[originalSymbol],
                contractType: "USDT-M",
                isConverted: true,
            };
        }
        // If already a valid USDT-M symbol, return as-is
        if (originalSymbol.endsWith("USDT") && !originalSymbol.includes("_")) {
            return {
                originalSymbol,
                binanceSymbol: originalSymbol,
                contractType: "USDT-M",
                isConverted: false,
            };
        }
        // Try pattern-based conversion
        for (const pattern of BASE_ASSET_PATTERNS) {
            const match = originalSymbol.match(pattern);
            if (match && match[1]) {
                const baseAsset = match[1];
                const binanceSymbol = `${baseAsset}USDT`;
                return {
                    originalSymbol,
                    binanceSymbol,
                    contractType: "USDT-M",
                    isConverted: true,
                };
            }
        }
        // Special case for COIN-M perpetuals
        if (originalSymbol.includes("USD_PERP") ||
            originalSymbol.endsWith("USD_PERP")) {
            const baseAsset = originalSymbol
                .replace("USD_PERP", "")
                .replace("_PERP", "");
            return {
                originalSymbol,
                binanceSymbol: `${baseAsset}USDT`,
                contractType: "USDT-M",
                isConverted: true,
            };
        }
        // If no conversion found, return error
        return {
            originalSymbol,
            binanceSymbol: originalSymbol,
            contractType: "USDT-M",
            isConverted: false,
            error: `No conversion rule found for symbol: ${originalSymbol}`,
        };
    }
    catch (error) {
        return {
            originalSymbol,
            binanceSymbol: originalSymbol,
            contractType: "USDT-M",
            isConverted: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
// In-memory position tracking for futures
const activeFuturesPositions = new Map();
// Fixed function to detect contract type
function getContractType(symbol) {
    const upperSymbol = symbol.toUpperCase();
    // COIN-M patterns: ends with USD_PERP, USD_YYMMDD, or just USD (legacy)
    if (upperSymbol.includes("USD_") ||
        upperSymbol.endsWith("USD_PERP") ||
        (upperSymbol.includes("USD") &&
            !upperSymbol.includes("USDT") &&
            upperSymbol.match(/_\d{6}$/))) {
        return "COIN-M";
    }
    // USDT-M patterns: ends with USDT or contains USDT
    if (upperSymbol.includes("USDT")) {
        return "USDT-M";
    }
    // Default to USDT-M for safety (most common)
    console.log(`⚠️ Unknown symbol pattern: ${symbol}, defaulting to USDT-M`);
    return "USDT-M";
}
// ...existing code...
// Remove the old validateAndFixSymbol function and replace with this:
function validateAndFixSymbol(symbol) {
    const conversionResult = convertTradingViewToBinance(symbol);
    if (conversionResult.isConverted) {
        console.log(`🔄 Converting "${conversionResult.originalSymbol}" to "${conversionResult.binanceSymbol}"`);
    }
    if (conversionResult.error) {
        console.warn(`⚠️ Symbol conversion warning: ${conversionResult.error}`);
    }
    return {
        symbol: conversionResult.binanceSymbol,
        contractType: conversionResult.contractType,
    };
}
// Main handler function for futures trading alerts - UPDATED
function handleFuturesTradingAlert(alertJson) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            console.log("🚀 Received futures alert:", alertJson);
            // Parse the JSON alert
            const alert = JSON.parse(alertJson);
            // Validate required fields
            if (!alert.symbol || !alert.side || !alert.trade) {
                throw new Error("Invalid alert: missing required fields (symbol, side, trade)");
            }
            // Use the comprehensive conversion function
            const conversionResult = convertTradingViewToBinance(alert.symbol);
            // Log conversion details
            if (conversionResult.isConverted) {
                console.log(`🔄 Symbol converted: "${conversionResult.originalSymbol}" → "${conversionResult.binanceSymbol}"`);
            }
            else {
                console.log(`✅ Symbol "${conversionResult.binanceSymbol}" is valid - no conversion needed`);
            }
            if (conversionResult.error) {
                console.warn(`⚠️ Symbol conversion warning: ${conversionResult.error}`);
            }
            // Update alert with converted symbol
            alert.symbol = conversionResult.binanceSymbol;
            const contractType = conversionResult.contractType;
            console.log(`📊 Processing ${contractType} ${alert.trade} order: ${alert.side} ${alert.symbol}`);
            console.log(`   Original symbol: ${conversionResult.originalSymbol}`);
            console.log(`   Binance symbol: ${conversionResult.binanceSymbol}`);
            console.log(`   Contract type: ${contractType}`);
            console.log(`   Converted: ${conversionResult.isConverted}`);
            // Route based on trade type
            if (alert.trade === "OPEN") {
                return yield handleOpenFuturesPosition(alert);
            }
            else if (alert.trade === "CLOSE") {
                return yield handleCloseFuturesPosition(alert);
            }
            else {
                throw new Error(`Invalid trade type: ${alert.trade}. Must be OPEN or CLOSE`);
            }
        }
        catch (error) {
            console.error("❌ Error handling futures trading alert:", error);
            // Enhanced error reporting with symbol info
            if (error instanceof Error && error.message.includes("symbol")) {
                const originalSymbol = (_a = JSON.parse(alertJson)) === null || _a === void 0 ? void 0 : _a.symbol;
                if (originalSymbol) {
                    const testConversion = convertTradingViewToBinance(originalSymbol);
                    console.error(`🔍 Symbol conversion debug for "${originalSymbol}":`);
                    console.error(`   Binance symbol: ${testConversion.binanceSymbol}`);
                    console.error(`   Contract type: ${testConversion.contractType}`);
                    console.error(`   Is converted: ${testConversion.isConverted}`);
                    console.error(`   Error: ${testConversion.error || "None"}`);
                }
            }
            throw error;
        }
    });
}
// Update other functions to use the converter as well
function handleOpenFuturesPosition(alert) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            const { symbol, side, leverage = 50 } = alert;
            // Double-check symbol conversion for safety
            const conversionCheck = convertTradingViewToBinance(symbol);
            if (conversionCheck.error) {
                console.warn(`⚠️ Symbol validation warning: ${conversionCheck.error}`);
            }
            const currentPosition = activeFuturesPositions.get(symbol);
            // If position already exists, close it first
            if (currentPosition) {
                console.log(`⚠️ Position already exists for ${symbol}. Closing existing position first.`);
                yield handleExistingFuturesPositionClose(symbol, currentPosition);
            }
            // Prepare risk configuration
            const riskConfig = {
                riskPerTradePercent: alert.riskPerTradePercent || 1.0,
                stopLossPercent: alert.stopLossPercent || 0.25,
                maxLeverage: leverage,
                minOrderSize: 0.001,
            };
            let orderResult;
            if (alert.quantity) {
                // Manual quantity override - use regular order placement
                console.log(`📊 Using manual quantity: ${alert.quantity}`);
                // Set leverage first
                yield (0, futures_js_1.changeFuturesLeverage)(symbol, leverage);
                // Use the contract type from conversion result
                const contractType = conversionCheck.contractType;
                const orderParams = Object.assign(Object.assign({ symbol: symbol, side: side, type: (alert.type || "MARKET"), quantity: alert.quantity }, (alert.price ? { price: alert.price } : {})), { newOrderRespType: "RESULT" });
                if (contractType === "COIN-M") {
                    orderResult = yield (0, futures_js_1.placeCoinMFuturesOrder)(orderParams);
                }
                else {
                    orderResult = yield (0, futures_js_1.placeUSDTMFuturesOrder)(orderParams);
                }
                // Manually place stop loss if needed
                if (alert.stopLossPercent || alert.stopPrice) {
                    try {
                        const currentPrice = yield (0, futures_js_1.getCurrentPrice)(symbol, contractType === "COIN-M");
                        const stopPrice = alert.stopPrice
                            ? parseFloat(alert.stopPrice)
                            : side === "BUY"
                                ? currentPrice * (1 - (alert.stopLossPercent || 0.25) / 100)
                                : currentPrice * (1 + (alert.stopLossPercent || 0.25) / 100);
                        const stopLossParams = {
                            symbol: symbol,
                            side: side === "BUY" ? "SELL" : "BUY",
                            type: "STOP_MARKET",
                            quantity: alert.quantity,
                            stopPrice: stopPrice.toString(),
                            reduceOnly: true,
                            newOrderRespType: "RESULT",
                        };
                        let stopLossResult;
                        if (contractType === "COIN-M") {
                            stopLossResult = yield (0, futures_js_1.placeCoinMFuturesOrder)(stopLossParams);
                        }
                        else {
                            stopLossResult = yield (0, futures_js_1.placeUSDTMFuturesOrder)(stopLossParams);
                        }
                        orderResult.stopLossOrder = stopLossResult;
                    }
                    catch (stopError) {
                        console.warn("⚠️ Could not place stop loss:", stopError);
                    }
                }
            }
            else {
                // Use risk-managed order
                console.log(`🎯 Using risk-managed order with ${riskConfig.riskPerTradePercent}% risk`);
                orderResult = yield (0, futures_js_1.placeSmartRiskOrder)(symbol, side, riskConfig);
            }
            console.log("✅ Futures entry order placed:", orderResult);
            // Store new position - use converted contract type
            const newPosition = {
                symbol: symbol,
                side: side === "BUY" ? "LONG" : "SHORT",
                quantity: parseFloat(((_a = orderResult.orderDetails) === null || _a === void 0 ? void 0 : _a.quantity) || alert.quantity || "0"),
                entryPrice: ((_b = orderResult.orderDetails) === null || _b === void 0 ? void 0 : _b.price) || parseFloat(orderResult.price || "0"),
                leverage: leverage,
                contractType: conversionCheck.contractType, // Use from conversion
                orderId: ((_d = (_c = orderResult.orders) === null || _c === void 0 ? void 0 : _c.mainOrder) === null || _d === void 0 ? void 0 : _d.orderId) || orderResult.orderId,
                stopLossOrderId: ((_f = (_e = orderResult.orders) === null || _e === void 0 ? void 0 : _e.stopLossOrder) === null || _f === void 0 ? void 0 : _f.orderId) ||
                    ((_g = orderResult.stopLossOrder) === null || _g === void 0 ? void 0 : _g.orderId),
                timestamp: new Date().toISOString(),
            };
            activeFuturesPositions.set(symbol, newPosition);
            console.log(`🎉 New ${newPosition.side} futures position opened for ${symbol} at ${newPosition.entryPrice} with ${newPosition.leverage}x leverage`);
            return {
                success: true,
                action: "OPEN_POSITION",
                position: newPosition,
                orderResult: orderResult,
                symbolConversion: {
                    original: conversionCheck.originalSymbol,
                    converted: conversionCheck.binanceSymbol,
                    wasConverted: conversionCheck.isConverted,
                },
            };
        }
        catch (error) {
            console.error("❌ Error handling open futures position:", error);
            throw error;
        }
    });
}
// ...existing code...
// Updated function to handle closing futures positions
function handleCloseFuturesPosition(alert) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { symbol, side, type = "MARKET" } = alert;
            let currentPosition = activeFuturesPositions.get(symbol);
            // If no local position, check Binance directly
            if (!currentPosition) {
                console.log(`⚠️ No local position found for ${symbol}, checking Binance...`);
                try {
                    const binancePositions = yield (0, futures_js_1.getFuturesPositions)();
                    const binancePos = binancePositions.find((pos) => pos.symbol === symbol && parseFloat(pos.positionAmt) !== 0);
                    if (binancePos) {
                        console.log(`Found position on Binance for ${symbol}:`, binancePos);
                        // Create local position from Binance data
                        currentPosition = {
                            symbol: symbol,
                            side: parseFloat(binancePos.positionAmt) > 0 ? "LONG" : "SHORT",
                            quantity: Math.abs(parseFloat(binancePos.positionAmt)),
                            entryPrice: parseFloat(binancePos.entryPrice),
                            leverage: parseFloat(binancePos.leverage),
                            contractType: getContractType(symbol),
                            unrealizedPnl: parseFloat(binancePos.unRealizedProfit),
                            timestamp: new Date().toISOString(),
                        };
                        // Update local tracking
                        activeFuturesPositions.set(symbol, currentPosition);
                    }
                }
                catch (syncError) {
                    console.error("Error syncing position from Binance:", syncError);
                }
            }
            if (!currentPosition) {
                console.log(`⚠️ No active position found for ${symbol} on Binance either`);
                return {
                    success: false,
                    message: "No active position found to close",
                    symbol: symbol,
                };
            }
            console.log(`🔄 Closing ${currentPosition.side} position for ${symbol}`);
            console.log(`Position details:`, currentPosition);
            // Cancel stop loss order if exists
            if (currentPosition.stopLossOrderId) {
                try {
                    yield (0, futures_js_1.cancelFuturesOrder)(symbol, currentPosition.stopLossOrderId);
                    console.log(`✅ Cancelled stop loss order for ${symbol}`);
                }
                catch (error) {
                    console.log("⚠️ Could not cancel stop loss:", error);
                }
            }
            // Determine the correct side to close the position
            // If we have a LONG position, we need to SELL to close
            // If we have a SHORT position, we need to BUY to close
            const closeSide = currentPosition.side === "LONG" ? "SELL" : "BUY";
            console.log(`Position side: ${currentPosition.side}, Close side: ${closeSide}`);
            // Use the position quantity from Binance, not the alert quantity
            const closeQuantity = alert.quantity || currentPosition.quantity.toString();
            // Place close order WITHOUT reduceOnly for market orders
            const closeOrderParams = Object.assign(Object.assign(Object.assign({ symbol: symbol, side: closeSide, type: type, quantity: closeQuantity }, (alert.price ? { price: alert.price } : {})), (type === "LIMIT" ? { reduceOnly: true } : {})), { newOrderRespType: "RESULT" });
            console.log(`Placing close order:`, closeOrderParams);
            let closeOrderResult;
            if (currentPosition.contractType === "COIN-M") {
                closeOrderResult = yield (0, futures_js_1.placeCoinMFuturesOrder)(closeOrderParams);
            }
            else {
                closeOrderResult = yield (0, futures_js_1.placeUSDTMFuturesOrder)(closeOrderParams);
            }
            console.log(`Close order result:`, closeOrderResult);
            // Remove position from tracking
            activeFuturesPositions.delete(symbol);
            console.log(`✅ Position closed for ${symbol}`);
            return {
                success: true,
                action: "CLOSE_POSITION",
                closedPosition: currentPosition,
                orderResult: closeOrderResult,
            };
        }
        catch (error) {
            console.error("❌ Error handling close futures position:", error);
            throw error;
        }
    });
}
// Updated function to close existing position
function handleExistingFuturesPositionClose(symbol, position) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`🔄 Closing existing position for ${symbol}:`, position);
            // Cancel stop loss if exists
            if (position.stopLossOrderId) {
                try {
                    yield (0, futures_js_1.cancelFuturesOrder)(symbol, position.stopLossOrderId);
                    console.log(`Cancelled stop loss order ${position.stopLossOrderId} for ${symbol}`);
                }
                catch (error) {
                    console.log("Could not cancel stop loss order:", error);
                }
            }
            // Close position with market order
            const closeSide = position.side === "LONG" ? "SELL" : "BUY";
            const closeParams = {
                symbol: symbol,
                side: closeSide,
                type: "MARKET",
                quantity: position.quantity.toString(),
                // Don't use reduceOnly for market close orders
                newOrderRespType: "RESULT",
            };
            console.log(`Closing existing position with params:`, closeParams);
            if (position.contractType === "COIN-M") {
                yield (0, futures_js_1.placeCoinMFuturesOrder)(closeParams);
            }
            else {
                yield (0, futures_js_1.placeUSDTMFuturesOrder)(closeParams);
            }
            // Remove from tracking
            activeFuturesPositions.delete(symbol);
            console.log(`✅ Existing ${position.side} position closed for ${symbol}`);
        }
        catch (error) {
            console.error(`❌ Error closing existing position for ${symbol}:`, error);
            throw error;
        }
    });
}
// Updated utility function to manually close a futures position
function closeFuturesPosition(symbol) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let position = activeFuturesPositions.get(symbol);
            // If no local position, sync from Binance first
            if (!position) {
                console.log(`No local position for ${symbol}, syncing from Binance...`);
                yield syncFuturesPositions();
                position = activeFuturesPositions.get(symbol);
            }
            if (!position) {
                throw new Error(`No active futures position found for ${symbol}`);
            }
            console.log(`Manually closing position for ${symbol}:`, position);
            // Cancel stop loss if exists
            if (position.stopLossOrderId) {
                try {
                    yield (0, futures_js_1.cancelFuturesOrder)(symbol, position.stopLossOrderId);
                    console.log(`Cancelled stop loss for ${symbol}`);
                }
                catch (error) {
                    console.log("Could not cancel stop loss:", error);
                }
            }
            // Close with market order
            const closeSide = position.side === "LONG" ? "SELL" : "BUY";
            const closeParams = {
                symbol: symbol,
                side: closeSide,
                type: "MARKET",
                quantity: position.quantity.toString(),
                // Don't use reduceOnly for market orders - let Binance handle it
                newOrderRespType: "RESULT",
            };
            console.log(`Manual close order params:`, closeParams);
            let closeOrder;
            if (position.contractType === "COIN-M") {
                closeOrder = yield (0, futures_js_1.placeCoinMFuturesOrder)(closeParams);
            }
            else {
                closeOrder = yield (0, futures_js_1.placeUSDTMFuturesOrder)(closeParams);
            }
            activeFuturesPositions.delete(symbol);
            console.log(`✅ Futures position manually closed for ${symbol}`);
            return {
                success: true,
                closedPosition: position,
                orderResult: closeOrder,
            };
        }
        catch (error) {
            console.error("❌ Error closing futures position:", error);
            throw error;
        }
    });
}
// Add a new function to force close all positions
function forceCloseAllPositions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🚨 Force closing all positions...");
            // First sync with Binance to get latest positions
            yield syncFuturesPositions();
            const results = [];
            const allPositions = Array.from(activeFuturesPositions.entries());
            for (const [symbol, position] of allPositions) {
                try {
                    console.log(`Force closing ${symbol}...`);
                    // Cancel any open orders first
                    if (position.stopLossOrderId) {
                        try {
                            yield (0, futures_js_1.cancelFuturesOrder)(symbol, position.stopLossOrderId);
                        }
                        catch (e) {
                            console.log(`Could not cancel stop loss for ${symbol}:`, e);
                        }
                    }
                    // Close with opposite side market order
                    const closeSide = position.side === "LONG" ? "SELL" : "BUY";
                    const closeParams = {
                        symbol: symbol,
                        side: closeSide,
                        type: "MARKET",
                        quantity: position.quantity.toString(),
                        newOrderRespType: "RESULT",
                    };
                    let closeResult;
                    if (position.contractType === "COIN-M") {
                        closeResult = yield (0, futures_js_1.placeCoinMFuturesOrder)(closeParams);
                    }
                    else {
                        closeResult = yield (0, futures_js_1.placeUSDTMFuturesOrder)(closeParams);
                    }
                    activeFuturesPositions.delete(symbol);
                    results.push({
                        symbol,
                        status: "closed",
                        contractType: position.contractType,
                        closeSide: closeSide,
                        quantity: position.quantity,
                        result: closeResult,
                    });
                    // Add delay between orders
                    yield new Promise((resolve) => setTimeout(resolve, 500));
                }
                catch (error) {
                    results.push({
                        symbol,
                        status: "error",
                        contractType: position.contractType,
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
            return results;
        }
        catch (error) {
            console.error("❌ Error in force close all positions:", error);
            throw error;
        }
    });
}
// Get current futures positions
function getCurrentFuturesPositions() {
    return new Map(activeFuturesPositions);
}
// Get specific futures position
function getFuturesPosition(symbol) {
    return activeFuturesPositions.get(symbol);
}
// Sync positions with Binance account
function syncFuturesPositions() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔄 Syncing futures positions with account...");
            const binancePositions = yield (0, futures_js_1.getFuturesPositions)();
            const activePositions = binancePositions.filter((pos) => parseFloat(pos.positionAmt) !== 0);
            console.log(`📊 Found ${activePositions.length} active positions on Binance`);
            // Update local tracking with Binance data
            for (const pos of activePositions) {
                const localPos = {
                    symbol: pos.symbol,
                    side: parseFloat(pos.positionAmt) > 0 ? "LONG" : "SHORT",
                    quantity: Math.abs(parseFloat(pos.positionAmt)),
                    entryPrice: parseFloat(pos.entryPrice),
                    leverage: parseFloat(pos.leverage),
                    contractType: getContractType(pos.symbol),
                    unrealizedPnl: parseFloat(pos.unRealizedProfit),
                    timestamp: new Date().toISOString(),
                };
                activeFuturesPositions.set(pos.symbol, localPos);
            }
            console.log("✅ Futures positions synced successfully");
        }
        catch (error) {
            console.error("❌ Error syncing futures positions:", error);
        }
    });
}
// Legacy function for backward compatibility
function handleTradingAlert(alertJson) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("⚠️ Using legacy handler - redirecting to futures handler");
        return yield handleFuturesTradingAlert(alertJson);
    });
}
console.log("🚀 Futures-only trading alert handler initialized");
