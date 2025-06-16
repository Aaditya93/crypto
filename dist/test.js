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
exports.testOpenOrders = exports.testOrderFlow = exports.testAccountOnly = exports.runAllTests = exports.exampleCancelAllOpenOrders = exports.exampleCancelAllOpenOrdersForSymbol = exports.exampleCancelOrder = exports.exampleGetOpenOrders = exports.exampleGetOrderStatus = exports.examplePlaceOrder = exports.exampleGetAccountInfo = void 0;
const trade_1 = require("./trade");
// Example 1: Get account information
function exampleGetAccountInfo() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n=== Testing Account Info ===");
        try {
            const accountInfo = yield (0, trade_1.getAccountInfo)(true); // omit zero balances
            console.log("Account Info Success:", {
                accountType: accountInfo.accountType,
                balances: (_a = accountInfo.balances) === null || _a === void 0 ? void 0 : _a.slice(0, 5), // Show first 5 balances
                canTrade: accountInfo.canTrade,
                canWithdraw: accountInfo.canWithdraw,
                canDeposit: accountInfo.canDeposit,
            });
            return accountInfo;
        }
        catch (error) {
            console.error("Account Info Error:", error);
            throw error;
        }
    });
}
exports.exampleGetAccountInfo = exampleGetAccountInfo;
// Example 2: Place a test order (small amount)
function examplePlaceOrder() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n=== Testing Place Order ===");
        try {
            const orderResult = yield (0, trade_1.placeOrder)({
                symbol: "BTCUSDT",
                side: "BUY",
                type: "LIMIT",
                quantity: "0.001", // Very small amount for testing
                price: "30000", // Below market price so it won't execute immediately
                timeInForce: "GTC",
                newOrderRespType: "FULL",
            });
            console.log("Place Order Success:", {
                orderId: orderResult.orderId,
                symbol: orderResult.symbol,
                status: orderResult.status,
                side: orderResult.side,
                type: orderResult.type,
                quantity: orderResult.origQty,
                price: orderResult.price,
            });
            return orderResult;
        }
        catch (error) {
            console.error("Place Order Error:", error);
            throw error;
        }
    });
}
exports.examplePlaceOrder = examplePlaceOrder;
// Example 3: Get order status
function exampleGetOrderStatus(orderId, symbol = "BTCUSDT") {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n=== Testing Get Order Status ===");
        try {
            const orderStatus = yield (0, trade_1.getOrderStatus)({
                symbol: symbol,
                orderId: orderId,
            });
            console.log("Order Status Success:", {
                orderId: orderStatus.orderId,
                symbol: orderStatus.symbol,
                status: orderStatus.status,
                side: orderStatus.side,
                type: orderStatus.type,
                executedQty: orderStatus.executedQty,
                origQty: orderStatus.origQty,
            });
            return orderStatus;
        }
        catch (error) {
            console.error("Order Status Error:", error);
            throw error;
        }
    });
}
exports.exampleGetOrderStatus = exampleGetOrderStatus;
// Example 4: Get open orders
function exampleGetOpenOrders(symbol) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n=== Testing Get Open Orders ===");
        try {
            const openOrders = yield (0, trade_1.getOpenOrders)(symbol);
            console.log("Open Orders Success:", {
                count: openOrders.length,
                orders: openOrders.map((order) => ({
                    orderId: order.orderId,
                    symbol: order.symbol,
                    side: order.side,
                    type: order.type,
                    status: order.status,
                    origQty: order.origQty,
                    price: order.price,
                })),
            });
            return openOrders;
        }
        catch (error) {
            console.error("Open Orders Error:", error);
            throw error;
        }
    });
}
exports.exampleGetOpenOrders = exampleGetOpenOrders;
// Example 5: Cancel a specific order
function exampleCancelOrder(orderId, symbol = "BTCUSDT") {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n=== Testing Cancel Order ===");
        try {
            const cancelResult = yield (0, trade_1.cancelOrder)({
                symbol: symbol,
                orderId: orderId,
            });
            console.log("Cancel Order Success:", {
                orderId: cancelResult.orderId,
                symbol: cancelResult.symbol,
                status: cancelResult.status,
                side: cancelResult.side,
                origQty: cancelResult.origQty,
            });
            return cancelResult;
        }
        catch (error) {
            console.error("Cancel Order Error:", error);
            throw error;
        }
    });
}
exports.exampleCancelOrder = exampleCancelOrder;
// Example 6: Cancel all open orders for a symbol
function exampleCancelAllOpenOrdersForSymbol(symbol = "BTCUSDT") {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n=== Testing Cancel All Open Orders for Symbol ===");
        try {
            const cancelResult = yield (0, trade_1.cancelAllOpenOrdersForSymbol)(symbol);
            console.log("Cancel All Orders for Symbol Success:", {
                message: cancelResult.message,
                cancelledCount: cancelResult.cancelledOrders.length,
                results: cancelResult.cancelledOrders.map((result) => ({
                    orderId: result.orderId,
                    symbol: result.symbol,
                    status: result.status,
                })),
            });
            return cancelResult;
        }
        catch (error) {
            console.error("Cancel All Orders for Symbol Error:", error);
            throw error;
        }
    });
}
exports.exampleCancelAllOpenOrdersForSymbol = exampleCancelAllOpenOrdersForSymbol;
// Example 7: Cancel all open orders (all symbols)
function exampleCancelAllOpenOrders() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("\n=== Testing Cancel All Open Orders ===");
        try {
            const cancelResult = yield (0, trade_1.cancelAllOpenOrders)();
            console.log("Cancel All Orders Success:", {
                message: cancelResult.message,
                cancelledCount: cancelResult.cancelledOrders.length,
                results: cancelResult.cancelledOrders.map((result) => ({
                    orderId: result.orderId,
                    symbol: result.symbol,
                    status: result.status,
                })),
            });
            return cancelResult;
        }
        catch (error) {
            console.error("Cancel All Orders Error:", error);
            throw error;
        }
    });
}
exports.exampleCancelAllOpenOrders = exampleCancelAllOpenOrders;
// Comprehensive test runner
function runAllTests() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("🚀 Starting Binance Trading API Tests...");
        try {
            // Test 1: Get account info
            yield exampleGetAccountInfo();
            // Test 2: Place a test order
            const orderResult = yield examplePlaceOrder();
            const orderId = orderResult.orderId;
            // Test 3: Get order status
            yield exampleGetOrderStatus(orderId);
            // Test 4: Get open orders
            yield exampleGetOpenOrders("BTCUSDT");
            // Test 5: Get all open orders
            yield exampleGetOpenOrders();
            // Test 6: Cancel the specific order we placed
            yield exampleCancelOrder(orderId);
            // Test 7: Place multiple orders for testing bulk cancel
            console.log("\n=== Placing multiple test orders ===");
            const testOrders = [];
            for (let i = 0; i < 3; i++) {
                const order = yield (0, trade_1.placeOrder)({
                    symbol: "BTCUSDT",
                    side: "BUY",
                    type: "LIMIT",
                    quantity: "0.001",
                    price: (29000 + i * 100).toString(), // Different prices
                    timeInForce: "GTC",
                });
                testOrders.push(order);
                console.log(`Test order ${i + 1} placed: ${order.orderId}`);
            }
            // Test 8: Cancel all orders for BTCUSDT
            yield exampleCancelAllOpenOrdersForSymbol("BTCUSDT");
            console.log("\n✅ All tests completed successfully!");
        }
        catch (error) {
            console.error("\n❌ Test failed:", error);
        }
    });
}
exports.runAllTests = runAllTests;
// Individual test functions for manual testing
function testAccountOnly() {
    return __awaiter(this, void 0, void 0, function* () {
        yield exampleGetAccountInfo();
    });
}
exports.testAccountOnly = testAccountOnly;
function testOrderFlow() {
    return __awaiter(this, void 0, void 0, function* () {
        const order = yield examplePlaceOrder();
        yield exampleGetOrderStatus(order.orderId);
        yield exampleCancelOrder(order.orderId);
    });
}
exports.testOrderFlow = testOrderFlow;
function testOpenOrders() {
    return __awaiter(this, void 0, void 0, function* () {
        yield exampleGetOpenOrders();
        yield exampleGetOpenOrders("BTCUSDT");
    });
}
exports.testOpenOrders = testOpenOrders;
// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}
console.log("Example functions loaded. You can run:");
console.log("- runAllTests() - Run all tests");
console.log("- testAccountOnly() - Test account info only");
console.log("- testOrderFlow() - Test order placement and cancellation");
console.log("- testOpenOrders() - Test getting open orders");
