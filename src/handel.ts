import {
  placeOrder,
  getAccountInfo,
  getOrderStatus,
  getOpenOrders,
  cancelOrder,
  cancelAllOpenOrdersForSymbol,
} from "./trade.js";

// Interface for the JSON alert structure (updated for your strategy)
interface TradingAlert {
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "STOP_LOSS" | "LIMIT";
  quantity: string;
  trade: "OPEN" | "CLOSE";
  stopPrice?: string;
  price?: string;
}

// Interface for position tracking
interface Position {
  symbol: string;
  side: "LONG" | "SHORT";
  quantity: number;
  entryPrice: number;
  orderId?: number;
  stopLossOrderId?: number;
}

// Simple in-memory position tracking (consider using a database for production)
const activePositions = new Map<string, Position>();

// Handler function for TradingView alerts
export async function handleTradingAlert(alertJson: string): Promise<any> {
  try {
    console.log("Received alert:", alertJson);

    // Parse the JSON alert
    const alert: TradingAlert = JSON.parse(alertJson);

    // Validate required fields
    if (
      !alert.symbol ||
      !alert.side ||
      !alert.type ||
      !alert.quantity ||
      !alert.trade
    ) {
      throw new Error(
        "Invalid alert: missing required fields (symbol, side, type, quantity, trade)"
      );
    }

    console.log(
      `Processing ${alert.trade} ${alert.type} order: ${alert.side} ${alert.quantity} ${alert.symbol}`
    );

    // Route based on trade type
    if (alert.trade === "OPEN") {
      return await handleOpenPosition(alert);
    } else if (alert.trade === "CLOSE") {
      return await handleClosePosition(alert);
    } else {
      throw new Error(
        `Invalid trade type: ${alert.trade}. Must be OPEN or CLOSE`
      );
    }
  } catch (error) {
    console.error("Error handling trading alert:", error);
    throw error;
  }
}

// Handle opening new positions
async function handleOpenPosition(alert: TradingAlert): Promise<any> {
  try {
    const { symbol, side, quantity, type } = alert;
    const currentPosition = activePositions.get(symbol);

    // If position already exists, close it first
    if (currentPosition) {
      console.log(
        `Position already exists for ${symbol}. Closing existing position first.`
      );

      // Cancel all open orders for this symbol
      try {
        const cancelResult = await cancelAllOpenOrdersForSymbol(symbol);
        console.log(`Cancelled all open orders for ${symbol}:`, cancelResult);
      } catch (error) {
        console.log("Could not cancel open orders:", error);
      }

      // Close existing position

      activePositions.delete(symbol);
      console.log(
        `Closed existing ${currentPosition.side} position for ${symbol}`
      );
    }

    // Place the new entry order
    const orderResult = await placeOrder({
      symbol: symbol,
      side: side,
      type: type,
      quantity: quantity,
      newOrderRespType: "FULL",
    });

    console.log("Entry order placed:", orderResult);

    // Store new position
    const newPosition: Position = {
      symbol: symbol,
      side: side === "BUY" ? "LONG" : "SHORT",
      quantity: parseFloat(quantity),
      entryPrice: parseFloat(
        orderResult.fills?.[0]?.price || orderResult.price || "0"
      ),
      orderId: orderResult.orderId,
    };

    activePositions.set(symbol, newPosition);
    console.log(
      `New ${newPosition.side} position opened for ${symbol} at ${newPosition.entryPrice}`
    );

    return orderResult;
  } catch (error) {
    console.error("Error handling open position:", error);
    throw error;
  }
}

// Handle closing positions (both manual exits and stop losses)
async function handleClosePosition(alert: TradingAlert): Promise<any> {
  try {
    const { symbol, side, quantity, type } = alert;
    const currentPosition = activePositions.get(symbol);

    if (!currentPosition) {
      console.log(
        `No active position found for ${symbol}, skipping close order`
      );
      return { message: "No active position found" };
    }

    // For any close order, cancel all open orders first
    try {
      const cancelResult = await cancelAllOpenOrdersForSymbol(symbol);
      console.log(`Cancelled all open orders for ${symbol}:`, cancelResult);
    } catch (error) {
      console.log("Could not cancel open orders:", error);
    }

    // Handle market close (both manual exit and stop loss triggered)
    if (type === "MARKET") {
      console.log(`Market close order for ${symbol}`);

      // Place market order to close position
      const closeOrder = await placeOrder({
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
  } catch (error) {
    console.error("Error handling close position:", error);
    throw error;
  }
}

// Simplified market order handler (legacy support)
async function handleMarketOrder(alert: TradingAlert): Promise<any> {
  // This function is kept for backward compatibility
  // But the new strategy uses the trade field to determine OPEN/CLOSE
  const { symbol, side, quantity } = alert;
  const currentPosition = activePositions.get(symbol);

  const isEntry = !currentPosition;
  const isExit =
    currentPosition &&
    ((side === "SELL" && currentPosition.side === "LONG") ||
      (side === "BUY" && currentPosition.side === "SHORT"));

  if (isEntry) {
    return await handleOpenPosition({ ...alert, trade: "OPEN" });
  } else if (isExit) {
    return await handleClosePosition({ ...alert, trade: "CLOSE" });
  }

  throw new Error("Cannot determine if order is entry or exit");
}

// Legacy stop loss handler (kept for compatibility)
async function handleStopLossOrder(alert: TradingAlert): Promise<any> {
  return await handleClosePosition({ ...alert, trade: "CLOSE" });
}

// Utility function to get current positions
export function getCurrentPositions(): Map<string, Position> {
  return new Map(activePositions);
}

// Utility function to get position for a specific symbol
export function getPosition(symbol: string): Position | undefined {
  return activePositions.get(symbol);
}

// Utility function to manually close a position
export async function closePosition(symbol: string): Promise<any> {
  try {
    const position = activePositions.get(symbol);
    if (!position) {
      throw new Error(`No active position found for ${symbol}`);
    }

    // Cancel all open orders for this symbol first
    try {
      const cancelResult = await cancelAllOpenOrdersForSymbol(symbol);
      console.log(`Cancelled all open orders for ${symbol}:`, cancelResult);
    } catch (error) {
      console.log("Could not cancel open orders:", error);
    }

    // Close position with market order
    const closeSide = position.side === "LONG" ? "SELL" : "BUY";
    const closeOrder = await placeOrder({
      symbol: symbol,
      side: closeSide,
      type: "MARKET",
      quantity: position.quantity.toString(),
    });

    // Remove from tracking
    activePositions.delete(symbol);

    console.log(`Position manually closed for ${symbol}`);
    return closeOrder;
  } catch (error) {
    console.error("Error closing position:", error);
    throw error;
  }
}

// Emergency function to close all positions
export async function closeAllPositions(): Promise<any[]> {
  const results = [];

  for (const [symbol, position] of activePositions) {
    try {
      const result = await closePosition(symbol);
      results.push({ symbol, status: "closed", result });
    } catch (error) {
      results.push({ symbol, status: "error", error });
    }
  }

  return results;
}

// Function to check and sync positions with Binance account
export async function syncPositions(): Promise<void> {
  try {
    const accountInfo = await getAccountInfo();
    console.log("Syncing positions with account...");

    // This is a basic sync - you might want to implement more sophisticated logic
    // based on your actual account balances and open orders
  } catch (error) {
    console.error("Error syncing positions:", error);
  }
}

console.log("Trading alert handler initialized for RedTPX and SMI Strategy");
