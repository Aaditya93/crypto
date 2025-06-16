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
exports.placeOrder = placeOrder;
exports.getAccountInfo = getAccountInfo;
exports.getUSDAccountBalance = getUSDAccountBalance;
exports.getAssetBalance = getAssetBalance;
exports.getOrderStatus = getOrderStatus;
exports.getOpenOrders = getOpenOrders;
exports.getAllOrders = getAllOrders;
exports.getOrderList = getOrderList;
exports.getAllOrderLists = getAllOrderLists;
exports.cancelOrder = cancelOrder;
exports.cancelAllOpenOrders = cancelAllOpenOrders;
exports.cancelAllOpenOrdersForSymbol = cancelAllOpenOrdersForSymbol;
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;
if (!apiKey || !apiSecret) {
    throw new Error("BINANCE_API_KEY and BINANCE_API_SECRET must be set in .env file");
}
// Function to create signature
function createSignature(params, secret) {
    const queryString = Object.keys(params)
        .filter((key) => key !== "signature")
        .map((key) => `${key}=${params[key]}`)
        .join("&");
    return crypto_1.default.createHmac("sha256", secret).update(queryString).digest("hex");
}
// Function to place an order
function placeOrder(orderParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            // Prepare parameters (DO NOT include apiKey in params)
            const params = Object.assign(Object.assign({}, orderParams), { timestamp: timestamp });
            // Create signature
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            // Create query string for URL
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            console.log("Order parameters:", params);
            // Make HTTP request with query string in URL
            const response = yield fetch(`https://testnet.binance.vision/api/v3/order?${queryString}`, {
                method: "POST",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            const result = yield response.json();
            console.log("Order response:", result);
            return result;
        }
        catch (error) {
            console.error("Error placing order:", error);
            throw error;
        }
    });
}
function getAccountInfo() {
    return __awaiter(this, arguments, void 0, function* (omitZeroBalances = false, recvWindow) {
        try {
            const timestamp = Date.now();
            const params = {
                timestamp: timestamp,
            };
            if (omitZeroBalances) {
                params.omitZeroBalances = omitZeroBalances;
            }
            if (recvWindow) {
                params.recvWindow = recvWindow;
            }
            // Create signature
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            // Create WebSocket-style request
            const request = {
                id: (0, uuid_1.v4)(),
                method: "account.status",
                params: params,
            };
            console.log("Account info request:", JSON.stringify(request, null, 2));
            // For HTTP API call
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            const response = yield fetch(`https://testnet.binance.vision/api/v3/account?${queryString}`, {
                method: "GET",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                },
            });
            const result = yield response.json();
            console.log("Account info response:", result);
            return result;
        }
        catch (error) {
            console.error("Error getting account info:", error);
            throw error;
        }
    });
}
// Function to query specific order status
function getOrderStatus(orderParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            const params = {
                symbol: orderParams.symbol,
                timestamp: timestamp,
            };
            if (orderParams.orderId) {
                params.orderId = orderParams.orderId;
            }
            if (orderParams.origClientOrderId) {
                params.origClientOrderId = orderParams.origClientOrderId;
            }
            if (orderParams.recvWindow) {
                params.recvWindow = orderParams.recvWindow;
            }
            // Create signature
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            // Create WebSocket-style request
            const request = {
                id: (0, uuid_1.v4)(),
                method: "order.status",
                params: params,
            };
            console.log("Order status request:", JSON.stringify(request, null, 2));
            // For HTTP API call
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            const response = yield fetch(`https://testnet.binance.vision/api/v3/order?${queryString}`, {
                method: "GET",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                },
            });
            const result = yield response.json();
            console.log("Order status response:", result);
            return result;
        }
        catch (error) {
            console.error("Error getting order status:", error);
            throw error;
        }
    });
}
// Function to get all open orders
function getOpenOrders(symbol, recvWindow) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            const params = {
                timestamp: timestamp,
            };
            if (symbol) {
                params.symbol = symbol;
            }
            if (recvWindow) {
                params.recvWindow = recvWindow;
            }
            // Create signature
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            // Create WebSocket-style request
            const request = {
                id: (0, uuid_1.v4)(),
                method: "openOrders.status",
                params: params,
            };
            console.log("Open orders request:", JSON.stringify(request, null, 2));
            // For HTTP API call
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            const response = yield fetch(`https://testnet.binance.vision/api/v3/openOrders?${queryString}`, {
                method: "GET",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                },
            });
            const result = yield response.json();
            console.log("Open orders response:", result);
            return result;
        }
        catch (error) {
            console.error("Error getting open orders:", error);
            throw error;
        }
    });
}
// Function to cancel an order
function cancelOrder(orderParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            const params = {
                symbol: orderParams.symbol,
                timestamp: timestamp,
            };
            if (orderParams.orderId) {
                params.orderId = orderParams.orderId;
            }
            if (orderParams.origClientOrderId) {
                params.origClientOrderId = orderParams.origClientOrderId;
            }
            if (orderParams.newClientOrderId) {
                params.newClientOrderId = orderParams.newClientOrderId;
            }
            if (orderParams.cancelRestrictions) {
                params.cancelRestrictions = orderParams.cancelRestrictions;
            }
            if (orderParams.recvWindow) {
                params.recvWindow = orderParams.recvWindow;
            }
            // Create signature
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            // Create WebSocket-style request
            const request = {
                id: (0, uuid_1.v4)(),
                method: "order.cancel",
                params: params,
            };
            console.log("Cancel order request:", JSON.stringify(request, null, 2));
            // For HTTP API call
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            const response = yield fetch(`https://testnet.binance.vision/api/v3/order?${queryString}`, {
                method: "DELETE",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                },
            });
            const result = yield response.json();
            console.log("Cancel order response:", result);
            return result;
        }
        catch (error) {
            console.error("Error canceling order:", error);
            throw error;
        }
    });
}
// Function to cancel all open orders for a symbol or all symbols
function cancelAllOpenOrders(symbol, recvWindow) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // First, get all open orders
            const openOrders = yield getOpenOrders(symbol, recvWindow);
            if (!openOrders || openOrders.length === 0) {
                console.log("No open orders to cancel");
                return { message: "No open orders to cancel", cancelledOrders: [] };
            }
            console.log(`Found ${openOrders.length} open orders to cancel`);
            const cancelResults = [];
            // Cancel each order individually
            for (const order of openOrders) {
                try {
                    console.log(`Cancelling order ${order.orderId} for ${order.symbol}`);
                    const cancelResult = yield cancelOrder({
                        symbol: order.symbol,
                        orderId: order.orderId,
                        recvWindow: recvWindow,
                    });
                    cancelResults.push({
                        orderId: order.orderId,
                        symbol: order.symbol,
                        status: "CANCELLED",
                        result: cancelResult,
                    });
                    console.log(`Successfully cancelled order ${order.orderId}`);
                    // Add small delay between cancellations to avoid rate limits
                    yield new Promise((resolve) => setTimeout(resolve, 100));
                }
                catch (error) {
                    console.error(`Failed to cancel order ${order.orderId}:`, error);
                    cancelResults.push({
                        orderId: order.orderId,
                        symbol: order.symbol,
                        status: "FAILED",
                        error: error,
                    });
                }
            }
            return {
                message: `Processed ${openOrders.length} orders`,
                cancelledOrders: cancelResults,
            };
        }
        catch (error) {
            console.error("Error cancelling all open orders:", error);
            throw error;
        }
    });
}
// Function to cancel all open orders for a specific symbol only
function cancelAllOpenOrdersForSymbol(symbol, recvWindow) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield cancelAllOpenOrders(symbol, recvWindow);
    });
}
// ...existing code...
// Function to get all orders (active, canceled, or filled)
function getAllOrders(orderParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            const params = {
                symbol: orderParams.symbol,
                timestamp: timestamp,
            };
            if (orderParams.orderId) {
                params.orderId = orderParams.orderId;
            }
            if (orderParams.startTime) {
                params.startTime = orderParams.startTime;
            }
            if (orderParams.endTime) {
                params.endTime = orderParams.endTime;
            }
            if (orderParams.limit) {
                params.limit = Math.min(orderParams.limit, 1000); // Max 1000
            }
            if (orderParams.recvWindow) {
                params.recvWindow = orderParams.recvWindow;
            }
            // Create signature
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            console.log("Get all orders request:", JSON.stringify(params, null, 2));
            // Create query string for URL
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            const response = yield fetch(`https://testnet.binance.vision/api/v3/allOrders?${queryString}`, {
                method: "GET",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                },
            });
            const result = yield response.json();
            console.log("All orders response:", result);
            return result;
        }
        catch (error) {
            console.error("Error getting all orders:", error);
            throw error;
        }
    });
}
// Function to query a specific order list
function getOrderList(orderListParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            const params = {
                timestamp: timestamp,
            };
            if (orderListParams.orderListId) {
                params.orderListId = orderListParams.orderListId;
            }
            if (orderListParams.origClientOrderId) {
                params.origClientOrderId = orderListParams.origClientOrderId;
            }
            if (orderListParams.recvWindow) {
                params.recvWindow = orderListParams.recvWindow;
            }
            // Validate that either orderListId or origClientOrderId is provided
            if (!orderListParams.orderListId && !orderListParams.origClientOrderId) {
                throw new Error("Either orderListId or origClientOrderId must be provided");
            }
            // Create signature
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            console.log("Get order list request:", JSON.stringify(params, null, 2));
            // Create query string for URL
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            const response = yield fetch(`https://testnet.binance.vision/api/v3/orderList?${queryString}`, {
                method: "GET",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                },
            });
            const result = yield response.json();
            console.log("Order list response:", result);
            return result;
        }
        catch (error) {
            console.error("Error getting order list:", error);
            throw error;
        }
    });
}
// Function to get all order lists
function getAllOrderLists(orderListParams) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const timestamp = Date.now();
            const params = {
                timestamp: timestamp,
            };
            if (orderListParams === null || orderListParams === void 0 ? void 0 : orderListParams.fromId) {
                params.fromId = orderListParams.fromId;
                // If fromId is supplied, neither startTime nor endTime can be provided
            }
            else {
                if (orderListParams === null || orderListParams === void 0 ? void 0 : orderListParams.startTime) {
                    params.startTime = orderListParams.startTime;
                }
                if (orderListParams === null || orderListParams === void 0 ? void 0 : orderListParams.endTime) {
                    params.endTime = orderListParams.endTime;
                }
            }
            if (orderListParams === null || orderListParams === void 0 ? void 0 : orderListParams.limit) {
                params.limit = Math.min(orderListParams.limit, 1000); // Max 1000
            }
            if (orderListParams === null || orderListParams === void 0 ? void 0 : orderListParams.recvWindow) {
                params.recvWindow = orderListParams.recvWindow;
            }
            // Create signature
            const signature = createSignature(params, apiSecret);
            params.signature = signature;
            console.log("Get all order lists request:", JSON.stringify(params, null, 2));
            // Create query string for URL
            const queryString = Object.keys(params)
                .map((key) => `${key}=${encodeURIComponent(params[key])}`)
                .join("&");
            const response = yield fetch(`https://testnet.binance.vision/api/v3/allOrderList?${queryString}`, {
                method: "GET",
                headers: {
                    "X-MBX-APIKEY": apiKey,
                },
            });
            const result = yield response.json();
            console.log("All order lists response:", result);
            return result;
        }
        catch (error) {
            console.error("Error getting all order lists:", error);
            throw error;
        }
    });
}
// ...existing code...
// Function to get USD account balance specifically
function getUSDAccountBalance(recvWindow) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get full account info
            const accountInfo = yield getAccountInfo(true, recvWindow); // omitZeroBalances = true
            if (!accountInfo || !accountInfo.balances) {
                throw new Error("Invalid account info response");
            }
            // Filter for USD-related assets
            const usdBalances = accountInfo.balances.filter((balance) => {
                const asset = balance.asset.toUpperCase();
                return (asset === "USDT" ||
                    asset === "USDC" ||
                    asset === "BUSD" ||
                    asset === "USD" ||
                    asset === "TUSD" ||
                    asset === "USDP" ||
                    asset === "DAI" ||
                    asset.includes("USD"));
            });
            // Calculate total USD value
            let totalUSDBalance = 0;
            const usdAssets = [];
            for (const balance of usdBalances) {
                const free = parseFloat(balance.free);
                const locked = parseFloat(balance.locked);
                const total = free + locked;
                if (total > 0) {
                    usdAssets.push({
                        asset: balance.asset,
                        free: balance.free,
                        locked: balance.locked,
                        total: total.toFixed(8),
                    });
                    // For stablecoins, assume 1:1 USD value
                    if (["USDT", "USDC", "BUSD", "TUSD", "USDP"].includes(balance.asset)) {
                        totalUSDBalance += total;
                    }
                }
            }
            console.log("USD Assets:", usdAssets);
            console.log("Total USD Balance:", totalUSDBalance.toFixed(2));
            // For other USD-related assets, you may need to fetch current prices
            return {
                totalUSDBalance: totalUSDBalance.toFixed(2),
                usdAssets: usdAssets,
                accountType: accountInfo.accountType || "SPOT",
                canTrade: accountInfo.canTrade || false,
                canWithdraw: accountInfo.canWithdraw || false,
                canDeposit: accountInfo.canDeposit || false,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            console.error("Error getting USD account balance:", error);
            throw error;
        }
    });
}
// Function to get specific asset balance
function getAssetBalance(asset, recvWindow) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accountInfo = yield getAccountInfo(true, recvWindow);
            if (!accountInfo || !accountInfo.balances) {
                throw new Error("Invalid account info response");
            }
            const assetBalance = accountInfo.balances.find((balance) => balance.asset.toUpperCase() === asset.toUpperCase());
            if (!assetBalance) {
                return {
                    asset: asset.toUpperCase(),
                    free: "0.00000000",
                    locked: "0.00000000",
                    total: "0.00000000",
                };
            }
            const free = parseFloat(assetBalance.free);
            const locked = parseFloat(assetBalance.locked);
            const total = free + locked;
            return {
                asset: assetBalance.asset,
                free: assetBalance.free,
                locked: assetBalance.locked,
                total: total.toFixed(8),
            };
        }
        catch (error) {
            console.error(`Error getting ${asset} balance:`, error);
            throw error;
        }
    });
}
