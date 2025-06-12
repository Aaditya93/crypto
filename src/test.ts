import {
  placeOrder,
  getAccountInfo,
  getOrderStatus,
  getOpenOrders,
  cancelOrder,
  cancelAllOpenOrders,
  cancelAllOpenOrdersForSymbol,
} from "./trade";

// Example 1: Get account information
async function exampleGetAccountInfo() {
  console.log("\n=== Testing Account Info ===");
  try {
    const accountInfo = await getAccountInfo(true); // omit zero balances
    console.log("Account Info Success:", {
      accountType: accountInfo.accountType,
      balances: accountInfo.balances?.slice(0, 5), // Show first 5 balances
      canTrade: accountInfo.canTrade,
      canWithdraw: accountInfo.canWithdraw,
      canDeposit: accountInfo.canDeposit,
    });
    return accountInfo;
  } catch (error) {
    console.error("Account Info Error:", error);
    throw error;
  }
}

// Example 2: Place a test order (small amount)
async function examplePlaceOrder() {
  console.log("\n=== Testing Place Order ===");
  try {
    const orderResult = await placeOrder({
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
  } catch (error) {
    console.error("Place Order Error:", error);
    throw error;
  }
}

// Example 3: Get order status
async function exampleGetOrderStatus(
  orderId: number,
  symbol: string = "BTCUSDT"
) {
  console.log("\n=== Testing Get Order Status ===");
  try {
    const orderStatus = await getOrderStatus({
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
  } catch (error) {
    console.error("Order Status Error:", error);
    throw error;
  }
}

// Example 4: Get open orders
async function exampleGetOpenOrders(symbol?: string) {
  console.log("\n=== Testing Get Open Orders ===");
  try {
    const openOrders = await getOpenOrders(symbol);

    console.log("Open Orders Success:", {
      count: openOrders.length,
      orders: openOrders.map((order: any) => ({
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
  } catch (error) {
    console.error("Open Orders Error:", error);
    throw error;
  }
}

// Example 5: Cancel a specific order
async function exampleCancelOrder(orderId: number, symbol: string = "BTCUSDT") {
  console.log("\n=== Testing Cancel Order ===");
  try {
    const cancelResult = await cancelOrder({
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
  } catch (error) {
    console.error("Cancel Order Error:", error);
    throw error;
  }
}

// Example 6: Cancel all open orders for a symbol
async function exampleCancelAllOpenOrdersForSymbol(symbol: string = "BTCUSDT") {
  console.log("\n=== Testing Cancel All Open Orders for Symbol ===");
  try {
    const cancelResult = await cancelAllOpenOrdersForSymbol(symbol);

    console.log("Cancel All Orders for Symbol Success:", {
      message: cancelResult.message,
      cancelledCount: cancelResult.cancelledOrders.length,
      results: cancelResult.cancelledOrders.map((result: any) => ({
        orderId: result.orderId,
        symbol: result.symbol,
        status: result.status,
      })),
    });
    return cancelResult;
  } catch (error) {
    console.error("Cancel All Orders for Symbol Error:", error);
    throw error;
  }
}

// Example 7: Cancel all open orders (all symbols)
async function exampleCancelAllOpenOrders() {
  console.log("\n=== Testing Cancel All Open Orders ===");
  try {
    const cancelResult = await cancelAllOpenOrders();

    console.log("Cancel All Orders Success:", {
      message: cancelResult.message,
      cancelledCount: cancelResult.cancelledOrders.length,
      results: cancelResult.cancelledOrders.map((result: any) => ({
        orderId: result.orderId,
        symbol: result.symbol,
        status: result.status,
      })),
    });
    return cancelResult;
  } catch (error) {
    console.error("Cancel All Orders Error:", error);
    throw error;
  }
}

// Comprehensive test runner
async function runAllTests() {
  console.log("🚀 Starting Binance Trading API Tests...");

  try {
    // Test 1: Get account info
    await exampleGetAccountInfo();

    // Test 2: Place a test order
    const orderResult = await examplePlaceOrder();
    const orderId = orderResult.orderId;

    // Test 3: Get order status
    await exampleGetOrderStatus(orderId);

    // Test 4: Get open orders
    await exampleGetOpenOrders("BTCUSDT");

    // Test 5: Get all open orders
    await exampleGetOpenOrders();

    // Test 6: Cancel the specific order we placed
    await exampleCancelOrder(orderId);

    // Test 7: Place multiple orders for testing bulk cancel
    console.log("\n=== Placing multiple test orders ===");
    const testOrders = [];
    for (let i = 0; i < 3; i++) {
      const order = await placeOrder({
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
    await exampleCancelAllOpenOrdersForSymbol("BTCUSDT");

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
  }
}

// Individual test functions for manual testing
async function testAccountOnly() {
  await exampleGetAccountInfo();
}

async function testOrderFlow() {
  const order = await examplePlaceOrder();
  await exampleGetOrderStatus(order.orderId);
  await exampleCancelOrder(order.orderId);
}

async function testOpenOrders() {
  await exampleGetOpenOrders();
  await exampleGetOpenOrders("BTCUSDT");
}

// Export all example functions
export {
  exampleGetAccountInfo,
  examplePlaceOrder,
  exampleGetOrderStatus,
  exampleGetOpenOrders,
  exampleCancelOrder,
  exampleCancelAllOpenOrdersForSymbol,
  exampleCancelAllOpenOrders,
  runAllTests,
  testAccountOnly,
  testOrderFlow,
  testOpenOrders,
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

console.log("Example functions loaded. You can run:");
console.log("- runAllTests() - Run all tests");
console.log("- testAccountOnly() - Test account info only");
console.log("- testOrderFlow() - Test order placement and cancellation");
console.log("- testOpenOrders() - Test getting open orders");
