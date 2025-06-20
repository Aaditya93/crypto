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
exports.placeFuturesOrder = placeFuturesOrder;
exports.placeUSDTMFuturesOrder = placeUSDTMFuturesOrder;
exports.placeCoinMFuturesOrder = placeCoinMFuturesOrder;
exports.placeSmartFuturesOrder = placeSmartFuturesOrder;
exports.placeSmallTestTrades = placeSmallTestTrades;
exports.placeSafeTestTrade = placeSafeTestTrade;
exports.getValidTestSymbols = getValidTestSymbols;
exports.getMinOrderRequirements = getMinOrderRequirements;
exports.getFuturesAccountInfo = getFuturesAccountInfo;
exports.getFuturesPositions = getFuturesPositions;
exports.changeFuturesLeverage = changeFuturesLeverage;
exports.cancelFuturesOrder = cancelFuturesOrder;
exports.placeRiskManagedOrder = placeRiskManagedOrder;
exports.placeSmartRiskOrder = placeSmartRiskOrder;
exports.getCurrentPrice = getCurrentPrice;
exports.getAccountCapital = getAccountCapital;
// Function to create signature for futures API
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
const apiKey = process.env.BINANCE_FUTURES_API_KEY;
const apiSecret = process.env.BINANCE_FUTURES_API_SECRET;
if (!apiKey || !apiSecret) {
    throw new Error("BINANCE_API_KEY and BINANCE_API_SECRET must be set in .env file");
}
function createSignature(params, secret) {
    const queryString = Object.keys(params)
        .map((key) => `${key}=${params[key]}`)
        .join("&");
    return crypto_1.default.createHmac("sha256", secret).update(queryString).digest("hex");
}
// Function to place a futures order
function placeFuturesOrder(orderParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            // Prepare parameters
            const params = Object.assign(Object.assign({}, orderParams), { timestamp: timestamp });
            // Create signature
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            console.log("Futures order parameters:", params);
            // Create query string for URL
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            // Make HTTP request to futures API
            const response = yield fetch(`https://testnet.binancefuture.com/fapi/v1/order?${queryString}`, {
                method: "POST",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            const result = yield response.json();
            console.log("Futures order response:", result);
            return result;
        }
        catch (error) {
            console.error("Error placing futures order:", error);
            throw error;
        }
    });
}
// Function to get futures account information
function getFuturesAccountInfo(recvWindow) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            const params = {
                timestamp: timestamp,
            };
            if (recvWindow) {
                params.recvWindow = recvWindow;
            }
            // Create signature
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            // Create query string for URL
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            const response = yield fetch(`https://testnet.binancefuture.com/fapi/v2/account?${queryString}`, {
                method: "GET",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                },
            });
            const result = yield response.json();
            console.log("Futures account info response:", result);
            return result;
        }
        catch (error) {
            console.error("Error getting futures account info:", error);
            throw error;
        }
    });
}
// Function to get futures positions
function getFuturesPositions(recvWindow) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            const params = {
                timestamp: timestamp,
            };
            if (recvWindow) {
                params.recvWindow = recvWindow;
            }
            // Create signature
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            // Create query string for URL
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            const response = yield fetch(`https://testnet.binancefuture.com/fapi/v2/positionRisk?${queryString}`, {
                method: "GET",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                },
            });
            const result = yield response.json();
            console.log("Futures positions response:", result);
            return result;
        }
        catch (error) {
            console.error("Error getting futures positions:", error);
            throw error;
        }
    });
}
// Function to change futures leverage
function changeFuturesLeverage(symbol, leverage, recvWindow) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            const params = {
                symbol: symbol,
                leverage: leverage,
                timestamp: timestamp,
            };
            if (recvWindow) {
                params.recvWindow = recvWindow;
            }
            // Create signature
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            // Create query string for URL
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            const response = yield fetch(`https://testnet.binancefuture.com/fapi/v1/leverage?${queryString}`, {
                method: "POST",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            const result = yield response.json();
            console.log(`Changed leverage for ${symbol} to ${leverage}x:`, result);
            return result;
        }
        catch (error) {
            console.error(`Error changing leverage for ${symbol}:`, error);
            throw error;
        }
    });
}
// Function to cancel futures order
function cancelFuturesOrder(symbol, orderId, origClientOrderId, recvWindow) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            const params = {
                symbol: symbol,
                timestamp: timestamp,
            };
            if (orderId) {
                params.orderId = orderId;
            }
            else if (origClientOrderId) {
                params.origClientOrderId = origClientOrderId;
            }
            else {
                throw new Error("Either orderId or origClientOrderId must be provided");
            }
            if (recvWindow) {
                params.recvWindow = recvWindow;
            }
            // Create signature
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            // Create query string for URL
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            const response = yield fetch(`https://testnet.binancefuture.com/fapi/v1/order?${queryString}`, {
                method: "DELETE",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                },
            });
            const result = yield response.json();
            console.log("Cancel futures order response:", result);
            return result;
        }
        catch (error) {
            console.error("Error canceling futures order:", error);
            throw error;
        }
    });
}
// Function to place USDT-M futures order (perpetual contracts)
function placeUSDTMFuturesOrder(orderParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            const params = Object.assign(Object.assign({}, orderParams), { timestamp: timestamp });
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            console.log("USDT-M Futures order parameters:", params);
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            // USDT-M Futures endpoint
            const response = yield fetch(`https://testnet.binancefuture.com/fapi/v1/order?${queryString}`, {
                method: "POST",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            const result = yield response.json();
            console.log("USDT-M Futures order response:", result);
            return result;
        }
        catch (error) {
            console.error("Error placing USDT-M futures order:", error);
            throw error;
        }
    });
}
// Function to place Coin-M futures order (delivery contracts)
function placeCoinMFuturesOrder(orderParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            const params = Object.assign(Object.assign({}, orderParams), { timestamp: timestamp });
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            console.log("Coin-M Futures order parameters:", params);
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            // Coin-M Futures endpoint (different from USDT-M)
            const response = yield fetch(`https://testnet.binancefuture.com/dapi/v1/order?${queryString}`, {
                method: "POST",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            const result = yield response.json();
            console.log("Coin-M Futures order response:", result);
            return result;
        }
        catch (error) {
            console.error("Error placing Coin-M futures order:", error);
            throw error;
        }
    });
}
// Smart function that automatically detects and places the correct order type
function placeSmartFuturesOrder(orderParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const symbol = orderParams.symbol.toUpperCase();
            // Detect if it's Coin-M (delivery) or USDT-M (perpetual)
            const isCoinM = symbol.includes("USDM") ||
                (symbol.includes("USD") && symbol.match(/\d{3}$/)); // Ends with 3 digits like M202
            if (isCoinM) {
                console.log(`🪙 Detected Coin-M futures contract: ${symbol}`);
                return yield placeCoinMFuturesOrder(orderParams);
            }
            else {
                console.log(`💵 Detected USDT-M futures contract: ${symbol}`);
                return yield placeUSDTMFuturesOrder(orderParams);
            }
        }
        catch (error) {
            console.error("Error in smart futures order:", error);
            throw error;
        }
    });
}
// Function to get current price for a symbol
function getCurrentPrice(symbol_1) {
    return __awaiter(this, arguments, void 0, function* (symbol, isCoinM = false) {
        try {
            const endpoint = isCoinM
                ? `https://testnet.binancefuture.com/dapi/v1/ticker/price?symbol=${symbol}`
                : `https://testnet.binancefuture.com/fapi/v1/ticker/price?symbol=${symbol}`;
            const response = yield fetch(endpoint);
            const result = yield response.json();
            if (result.price) {
                return parseFloat(result.price);
            }
            else {
                throw new Error(`Failed to get price for ${symbol}`);
            }
        }
        catch (error) {
            console.error(`Error getting current price for ${symbol}:`, error);
            throw error;
        }
    });
}
// Function to get account balance
function getAccountCapital() {
    return __awaiter(this, arguments, void 0, function* (isCoinM = false) {
        var _a;
        try {
            let accountInfo;
            if (isCoinM) {
                // For Coin-M futures, get dapi account info
                const timestamp = Date.now();
                const params = { timestamp };
                const signature = createSignature(params, apiSecret);
                const queryString = `timestamp=${timestamp}&signature=${signature}`;
                const response = yield fetch(`https://testnet.binancefuture.com/dapi/v1/account?${queryString}`, {
                    method: "GET",
                    headers: { "X-MBX-APIKEY": apiKey },
                });
                accountInfo = yield response.json();
                // For Coin-M, sum up all asset values (simplified)
                const totalBalance = ((_a = accountInfo.assets) === null || _a === void 0 ? void 0 : _a.reduce((sum, asset) => {
                    return sum + parseFloat(asset.walletBalance || 0);
                }, 0)) || 0;
                return totalBalance;
            }
            else {
                // For USDT-M futures
                accountInfo = yield getFuturesAccountInfo();
                return parseFloat(accountInfo.totalWalletBalance || 0);
            }
        }
        catch (error) {
            console.error("Error getting account capital:", error);
            throw error;
        }
    });
}
// Add helper function to format quantity with proper precision
function formatQuantityWithPrecision(symbol_1, quantity_1) {
    return __awaiter(this, arguments, void 0, function* (symbol, quantity, isCoinM = false) {
        try {
            const minReqs = yield getMinOrderRequirements(symbol, isCoinM);
            // Round to step size first
            const stepSize = minReqs.stepSize;
            let adjustedQty = Math.floor(quantity / stepSize) * stepSize;
            // Ensure minimum quantity
            adjustedQty = Math.max(adjustedQty, minReqs.minQty);
            // Format with appropriate decimal places based on step size
            let decimals = 0;
            let tempStep = stepSize;
            while (tempStep < 1 && decimals < 8) {
                tempStep *= 10;
                decimals++;
            }
            return adjustedQty.toFixed(decimals).replace(/\.?0+$/, "");
        }
        catch (error) {
            console.error(`Error formatting quantity for ${symbol}:`, error);
            // Fallback to 3 decimal places
            return quantity.toFixed(3).replace(/\.?0+$/, "");
        }
    });
}
// Main function to calculate position size and place order with risk management - FIXED
function placeRiskManagedOrder(orderParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { symbol, side, type = "MARKET", price, riskConfig, leverage = 1, } = orderParams;
            console.log(`🎯 Placing risk-managed order for ${symbol}...`);
            // Detect contract type using the converter
            const isCoinM = symbol.includes("USD_") ||
                symbol.endsWith("USD_PERP") ||
                (symbol.includes("USD") &&
                    !symbol.includes("USDT") &&
                    !!symbol.match(/_\d{6}$/));
            console.log(`📊 Contract type: ${isCoinM ? "Coin-M" : "USDT-M"}`);
            // Get minimum requirements first
            const minReqs = yield getMinOrderRequirements(symbol, isCoinM);
            console.log(`📋 Min requirements for ${symbol}:`, minReqs);
            if (minReqs.status !== "TRADING") {
                throw new Error(`Symbol ${symbol} is not available for trading (status: ${minReqs.status})`);
            }
            // Get current price
            const currentPrice = price || (yield getCurrentPrice(symbol, isCoinM));
            console.log(`💰 Current price: ${currentPrice}`);
            // Get account capital
            const capital = yield getAccountCapital(isCoinM);
            console.log(`💼 Account capital: ${capital}`);
            if (capital <= 0) {
                throw new Error("Insufficient account balance");
            }
            // Risk Calculation
            const riskCapital = capital * (riskConfig.riskPerTradePercent / 100);
            const stopDist = currentPrice * (riskConfig.stopLossPercent / 100);
            let calculatedQty = riskCapital / stopDist;
            console.log(`📈 Risk calculations:`);
            console.log(`   Risk capital (${riskConfig.riskPerTradePercent}%): ${riskCapital.toFixed(2)}`);
            console.log(`   Stop distance (${riskConfig.stopLossPercent}%): ${stopDist.toFixed(6)}`);
            console.log(`   Raw calculated quantity: ${calculatedQty.toFixed(8)}`);
            // Apply minimum order size
            if (riskConfig.minOrderSize && calculatedQty < riskConfig.minOrderSize) {
                calculatedQty = riskConfig.minOrderSize;
                console.log(`⚠️ Quantity adjusted to minimum: ${calculatedQty}`);
            }
            // Ensure minimum notional value is met
            const notionalValue = calculatedQty * currentPrice;
            if (notionalValue < minReqs.minNotional) {
                calculatedQty = minReqs.minNotional / currentPrice;
                console.log(`⚠️ Quantity adjusted for min notional ($${minReqs.minNotional}): ${calculatedQty.toFixed(8)}`);
            }
            // Format quantity with proper precision - THIS IS THE KEY FIX
            const formattedQuantity = yield formatQuantityWithPrecision(symbol, calculatedQty, isCoinM);
            console.log(`✅ Final formatted quantity: ${formattedQuantity}`);
            // Verify the formatted quantity meets requirements
            const finalNotional = parseFloat(formattedQuantity) * currentPrice;
            console.log(`💵 Final notional value: $${finalNotional.toFixed(2)}`);
            if (finalNotional < minReqs.minNotional) {
                throw new Error(`Order size too small. Minimum notional: $${minReqs.minNotional}, got: $${finalNotional.toFixed(2)}`);
            }
            // Calculate stop loss price
            const stopLossPrice = side === "BUY"
                ? currentPrice * (1 - riskConfig.stopLossPercent / 100)
                : currentPrice * (1 + riskConfig.stopLossPercent / 100);
            console.log(`🛑 Stop loss price: ${stopLossPrice.toFixed(6)}`);
            // Set leverage if specified
            if (leverage > 1 && !isCoinM) {
                // Only set leverage for USDT-M
                try {
                    yield changeFuturesLeverage(symbol, leverage);
                    console.log(`⚡ Leverage set to ${leverage}x`);
                }
                catch (leverageError) {
                    console.warn(`Warning: Could not set leverage - ${leverageError}`);
                }
            }
            // Place main order with properly formatted quantity
            const mainOrderParams = Object.assign(Object.assign({ symbol: symbol, side: side, type: type, quantity: formattedQuantity }, (type === "LIMIT" && price ? { price: price.toString() } : {})), { newOrderRespType: "RESULT" });
            console.log(`📤 Placing order with params:`, mainOrderParams);
            let mainOrderResult;
            if (isCoinM) {
                mainOrderResult = yield placeCoinMFuturesOrder(mainOrderParams);
            }
            else {
                mainOrderResult = yield placeUSDTMFuturesOrder(mainOrderParams);
            }
            console.log(`✅ Main order placed:`, mainOrderResult);
            // Calculate risk metrics
            const finalQuantity = parseFloat(formattedQuantity);
            const maxLoss = riskCapital;
            const riskRewardRatio = riskCapital / stopDist;
            return {
                success: true,
                symbol: symbol,
                contractType: isCoinM ? "Coin-M" : "USDT-M",
                orderDetails: {
                    side: side,
                    quantity: finalQuantity,
                    formattedQuantity: formattedQuantity,
                    price: currentPrice,
                    stopLossPrice: stopLossPrice,
                    leverage: leverage,
                    notionalValue: finalQuantity * currentPrice,
                },
                riskMetrics: {
                    accountCapital: capital,
                    riskCapital: riskCapital,
                    riskPercentage: riskConfig.riskPerTradePercent,
                    stopLossPercentage: riskConfig.stopLossPercent,
                    maxLoss: maxLoss,
                    stopDistance: stopDist,
                    riskRewardRatio: riskRewardRatio.toFixed(4),
                },
                orders: {
                    mainOrder: mainOrderResult,
                    stopLossOrder: null,
                },
                minRequirements: minReqs,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            console.error("❌ Error placing risk-managed order:", error);
            throw error;
        }
    });
}
// Also update the placeSmartRiskOrder function to handle precision
function placeSmartRiskOrder(symbol, side, customRisk) {
    return __awaiter(this, void 0, void 0, function* () {
        const defaultRisk = {
            riskPerTradePercent: 1.0,
            stopLossPercent: 0.25,
            maxLeverage: 50,
            minOrderSize: 0.001,
        };
        const riskConfig = Object.assign(Object.assign({}, defaultRisk), customRisk);
        try {
            // Get minimum requirements to adjust default minOrderSize if needed
            const isCoinM = symbol.includes("USD_") ||
                symbol.endsWith("USD_PERP") ||
                (symbol.includes("USD") && !symbol.includes("USDT"));
            const minReqs = yield getMinOrderRequirements(symbol, isCoinM);
            // Adjust minimum order size based on symbol requirements
            if (minReqs.minQty > riskConfig.minOrderSize) {
                riskConfig.minOrderSize = minReqs.minQty;
                console.log(`📋 Adjusted min order size to ${riskConfig.minOrderSize} for ${symbol}`);
            }
            return yield placeRiskManagedOrder({
                symbol,
                side,
                type: "MARKET",
                riskConfig,
                leverage: riskConfig.maxLeverage,
            });
        }
        catch (error) {
            console.error(`❌ Error in smart risk order for ${symbol}:`, error);
            throw error;
        }
    });
}
// Function to get exchange info and find valid symbols
function getValidTestSymbols() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Get USDT-M futures symbols
            const usdtMResponse = yield fetch(`https://testnet.binancefuture.com/fapi/v1/exchangeInfo`, {
                method: "GET",
            });
            const usdtMData = yield usdtMResponse.json();
            // Get Coin-M futures symbols
            const coinMResponse = yield fetch(`https://testnet.binancefuture.com/dapi/v1/exchangeInfo`, {
                method: "GET",
            });
            const coinMData = yield coinMResponse.json();
            // Find valid USDT-M symbols
            const validUSDTM = ((_a = usdtMData.symbols) === null || _a === void 0 ? void 0 : _a.filter((s) => s.status === "TRADING" &&
                (s.symbol === "ETHUSDT" ||
                    s.symbol === "BTCUSDT" ||
                    s.symbol === "BNBUSDT"))) || [];
            // Find valid Coin-M symbols (perpetual contracts)
            const validCoinM = ((_b = coinMData.symbols) === null || _b === void 0 ? void 0 : _b.filter((s) => s.status === "TRADING" &&
                s.contractType === "PERPETUAL" &&
                (s.symbol.includes("ETH") || s.symbol.includes("BTC")))) || [];
            return {
                usdtM: validUSDTM.length > 0 ? validUSDTM[0] : null,
                coinM: validCoinM.length > 0 ? validCoinM[0] : null,
            };
        }
        catch (error) {
            console.error("Error getting valid test symbols:", error);
            return { usdtM: null, coinM: null };
        }
    });
}
// Function to get minimum order requirements for a symbol
function getMinOrderRequirements(symbol_1) {
    return __awaiter(this, arguments, void 0, function* (symbol, isCoinM = false) {
        var _a;
        try {
            const endpoint = isCoinM
                ? `https://testnet.binancefuture.com/dapi/v1/exchangeInfo`
                : `https://testnet.binancefuture.com/fapi/v1/exchangeInfo`;
            const response = yield fetch(endpoint);
            const data = yield response.json();
            const symbolInfo = (_a = data.symbols) === null || _a === void 0 ? void 0 : _a.find((s) => s.symbol === symbol);
            if (!symbolInfo) {
                throw new Error(`Symbol ${symbol} not found`);
            }
            // Extract minimum notional and quantity from filters
            let minNotional = 5; // Default minimum
            let minQty = 0.001; // Default minimum
            let stepSize = 0.001; // Default step size
            let tickSize = 0.01; // Default tick size
            if (symbolInfo.filters) {
                for (const filter of symbolInfo.filters) {
                    if (filter.filterType === "MIN_NOTIONAL") {
                        minNotional = parseFloat(filter.notional || filter.minNotional || 5);
                    }
                    if (filter.filterType === "LOT_SIZE") {
                        minQty = parseFloat(filter.minQty || 0.001);
                        stepSize = parseFloat(filter.stepSize || 0.001);
                    }
                    if (filter.filterType === "PRICE_FILTER") {
                        tickSize = parseFloat(filter.tickSize || 0.01);
                    }
                }
            }
            return {
                symbol: symbol,
                minNotional: minNotional,
                minQty: minQty,
                stepSize: stepSize,
                tickSize: tickSize,
                contractType: symbolInfo.contractType || "PERPETUAL",
                status: symbolInfo.status,
            };
        }
        catch (error) {
            console.error(`Error getting min requirements for ${symbol}:`, error);
            return {
                symbol: symbol,
                minNotional: 20, // Safe default for futures
                minQty: 0.001,
                stepSize: 0.001,
                tickSize: 0.01,
                contractType: "PERPETUAL",
                status: "UNKNOWN",
            };
        }
    });
}
// Updated function to place small test trades with proper minimum sizes
function placeSmallTestTrades() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            console.log("🧪 Starting small test trades with proper minimum sizes...");
            const results = [];
            // Get valid symbols first
            const validSymbols = yield getValidTestSymbols();
            console.log("Valid symbols found:", validSymbols);
            // Test USDT-M futures if available
            if (validSymbols.usdtM) {
                try {
                    const symbol = validSymbols.usdtM.symbol;
                    console.log(`Testing USDT-M futures with ${symbol}...`);
                    // Get minimum requirements
                    const minReqs = yield getMinOrderRequirements(symbol, false);
                    console.log(`Min requirements for ${symbol}:`, minReqs);
                    // Get current price to calculate proper quantity
                    const currentPrice = yield getCurrentPrice(symbol, false);
                    console.log(`Current price for ${symbol}: ${currentPrice}`);
                    // Calculate quantity to meet minimum notional (usually $20-50)
                    const targetNotional = Math.max(minReqs.minNotional, 25); // Use at least $25
                    let quantity = targetNotional / currentPrice;
                    // Round to step size
                    quantity = Math.ceil(quantity / minReqs.stepSize) * minReqs.stepSize;
                    quantity = Math.max(quantity, minReqs.minQty);
                    // Format to appropriate decimal places
                    const qtyStr = quantity.toFixed(6).replace(/\.?0+$/, "");
                    console.log(`Calculated quantity: ${qtyStr} (notional: ~$${(quantity * currentPrice).toFixed(2)})`);
                    // Set leverage to 1x for safety
                    yield changeFuturesLeverage(symbol, 1);
                    console.log(`✅ Set leverage to 1x for ${symbol}`);
                    const usdtmResult = yield placeUSDTMFuturesOrder({
                        symbol: symbol,
                        side: "BUY",
                        type: "MARKET",
                        quantity: qtyStr,
                        newOrderRespType: "RESULT",
                    });
                    results.push({
                        type: "USDT-M",
                        symbol: symbol,
                        quantity: qtyStr,
                        notional: (quantity * currentPrice).toFixed(2),
                        minRequirements: minReqs,
                        result: usdtmResult,
                    });
                    console.log(`✅ USDT-M test order placed for ${symbol}`);
                }
                catch (error) {
                    console.error("USDT-M test failed:", error);
                    results.push({
                        type: "USDT-M",
                        symbol: ((_a = validSymbols.usdtM) === null || _a === void 0 ? void 0 : _a.symbol) || "UNKNOWN",
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
            else {
                results.push({
                    type: "USDT-M",
                    symbol: "NONE",
                    error: "No valid USDT-M symbols found for testing",
                });
            }
            // Test Coin-M futures if available
            if (validSymbols.coinM) {
                try {
                    const symbol = validSymbols.coinM.symbol;
                    console.log(`Testing Coin-M futures with ${symbol}...`);
                    // Get minimum requirements
                    const minReqs = yield getMinOrderRequirements(symbol, true);
                    console.log(`Min requirements for ${symbol}:`, minReqs);
                    // For Coin-M, quantity is usually in contracts, not base asset
                    // Start with 1 contract and adjust if needed
                    let quantity = 1;
                    const qtyStr = quantity.toString();
                    console.log(`Using quantity: ${qtyStr} contracts`);
                    const coinmResult = yield placeCoinMFuturesOrder({
                        symbol: symbol,
                        side: "BUY",
                        type: "MARKET",
                        quantity: qtyStr,
                        newOrderRespType: "RESULT",
                    });
                    results.push({
                        type: "Coin-M",
                        symbol: symbol,
                        quantity: qtyStr,
                        minRequirements: minReqs,
                        result: coinmResult,
                    });
                    console.log(`✅ Coin-M test order placed for ${symbol}`);
                }
                catch (error) {
                    console.error("Coin-M test failed:", error);
                    results.push({
                        type: "Coin-M",
                        symbol: ((_b = validSymbols.coinM) === null || _b === void 0 ? void 0 : _b.symbol) || "UNKNOWN",
                        error: error instanceof Error ? error.message : String(error),
                    });
                }
            }
            else {
                results.push({
                    type: "Coin-M",
                    symbol: "NONE",
                    error: "No valid Coin-M symbols found for testing",
                });
            }
            return results;
        }
        catch (error) {
            console.error("Error in test trades:", error);
            throw error;
        }
    });
}
// Alternative function for safe testing with very small amounts
function placeSafeTestTrade(symbol_1) {
    return __awaiter(this, arguments, void 0, function* (symbol, isCoinM = false) {
        try {
            console.log(`🧪 Placing safe test trade for ${symbol} (${isCoinM ? "Coin-M" : "USDT-M"})`);
            // Get minimum requirements
            const minReqs = yield getMinOrderRequirements(symbol, isCoinM);
            console.log(`Requirements for ${symbol}:`, minReqs);
            if (minReqs.status !== "TRADING") {
                throw new Error(`Symbol ${symbol} is not available for trading (status: ${minReqs.status})`);
            }
            let quantity;
            if (isCoinM) {
                // For Coin-M, use 1 contract as minimum
                quantity = "1";
            }
            else {
                // For USDT-M, calculate based on minimum notional
                const currentPrice = yield getCurrentPrice(symbol, false);
                const targetNotional = Math.max(minReqs.minNotional, 25);
                let calcQty = targetNotional / currentPrice;
                // Round to step size
                calcQty = Math.ceil(calcQty / minReqs.stepSize) * minReqs.stepSize;
                calcQty = Math.max(calcQty, minReqs.minQty);
                quantity = calcQty.toFixed(6).replace(/\.?0+$/, "");
            }
            console.log(`Using quantity: ${quantity}`);
            // Set leverage to 1x for safety
            if (!isCoinM) {
                yield changeFuturesLeverage(symbol, 1);
            }
            const orderParams = {
                symbol: symbol,
                side: "BUY",
                type: "MARKET",
                quantity: quantity,
                newOrderRespType: "RESULT",
            };
            let result;
            if (isCoinM) {
                result = yield placeCoinMFuturesOrder(orderParams);
            }
            else {
                result = yield placeUSDTMFuturesOrder(orderParams);
            }
            return {
                success: true,
                symbol: symbol,
                contractType: isCoinM ? "Coin-M" : "USDT-M",
                quantity: quantity,
                minRequirements: minReqs,
                orderResult: result,
            };
        }
        catch (error) {
            console.error(`Error in safe test trade for ${symbol}:`, error);
            return {
                success: false,
                symbol: symbol,
                contractType: isCoinM ? "Coin-M" : "USDT-M",
                error: error instanceof Error ? error.message : String(error),
            };
        }
    });
}
