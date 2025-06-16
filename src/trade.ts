import dotenv from "dotenv";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

dotenv.config();
const apiKey = process.env.BINANCE_API_KEY;
const apiSecret = process.env.BINANCE_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error(
    "BINANCE_API_KEY and BINANCE_API_SECRET must be set in .env file"
  );
}

// Function to create signature
function createSignature(params: Record<string, any>, secret: string): string {
  const queryString = Object.keys(params)
    .filter((key) => key !== "signature")
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHmac("sha256", secret).update(queryString).digest("hex");
}

// Function to place an order
async function placeOrder(orderParams: {
  symbol: string;
  side: "BUY" | "SELL";
  type:
    | "LIMIT"
    | "MARKET"
    | "STOP_LOSS"
    | "STOP_LOSS_LIMIT"
    | "TAKE_PROFIT"
    | "TAKE_PROFIT_LIMIT"
    | "LIMIT_MAKER";
  price?: string;
  quantity?: string;
  quoteOrderQty?: string;
  timeInForce?: "GTC" | "IOC" | "FOK";
  stopPrice?: string;
  trailingDelta?: number;
  icebergQty?: string;
  newClientOrderId?: string;
  newOrderRespType?: "ACK" | "RESULT" | "FULL";
  strategyId?: number;
  strategyType?: number;
  selfTradePreventionMode?: string;
  recvWindow?: number;
}) {
  try {
    const timestamp = Date.now();

    // Prepare parameters (DO NOT include apiKey in params)
    const params: Record<string, any> = {
      ...orderParams,
      timestamp: timestamp,
    };

    // Create signature
    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    // Create query string for URL
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    console.log("Order parameters:", params);

    // Make HTTP request with query string in URL
    const response = await fetch(
      `https://testnet.binance.vision/api/v3/order?${queryString}`,
      {
        method: "POST",
        headers: {
          "X-MBX-APIKEY": apiKey!,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const result = await response.json();
    console.log("Order response:", result);

    return result;
  } catch (error) {
    console.error("Error placing order:", error);
    throw error;
  }
}

async function getAccountInfo(
  omitZeroBalances: boolean = false,
  recvWindow?: number
) {
  try {
    const timestamp = Date.now();

    const params: Record<string, any> = {
      timestamp: timestamp,
    };

    if (omitZeroBalances) {
      params.omitZeroBalances = omitZeroBalances;
    }

    if (recvWindow) {
      params.recvWindow = recvWindow;
    }

    // Create signature
    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    // Create WebSocket-style request
    const request = {
      id: uuidv4(),
      method: "account.status",
      params: params,
    };

    console.log("Account info request:", JSON.stringify(request, null, 2));

    // For HTTP API call
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const response = await fetch(
      `https://testnet.binance.vision/api/v3/account?${queryString}`,
      {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey!,
        },
      }
    );

    const result = await response.json();

    console.log("Account info response:", result);

    return result;
  } catch (error) {
    console.error("Error getting account info:", error);
    throw error;
  }
}

// Function to query specific order status
async function getOrderStatus(orderParams: {
  symbol: string;
  orderId?: number;
  origClientOrderId?: string;
  recvWindow?: number;
}) {
  try {
    const timestamp = Date.now();

    const params: Record<string, any> = {
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
    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    // Create WebSocket-style request
    const request = {
      id: uuidv4(),
      method: "order.status",
      params: params,
    };

    console.log("Order status request:", JSON.stringify(request, null, 2));

    // For HTTP API call
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const response = await fetch(
      `https://testnet.binance.vision/api/v3/order?${queryString}`,
      {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey!,
        },
      }
    );

    const result = await response.json();
    console.log("Order status response:", result);

    return result;
  } catch (error) {
    console.error("Error getting order status:", error);
    throw error;
  }
}

// Function to get all open orders
async function getOpenOrders(symbol?: string, recvWindow?: number) {
  try {
    const timestamp = Date.now();

    const params: Record<string, any> = {
      timestamp: timestamp,
    };

    if (symbol) {
      params.symbol = symbol;
    }

    if (recvWindow) {
      params.recvWindow = recvWindow;
    }

    // Create signature
    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    // Create WebSocket-style request
    const request = {
      id: uuidv4(),
      method: "openOrders.status",
      params: params,
    };

    console.log("Open orders request:", JSON.stringify(request, null, 2));

    // For HTTP API call
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const response = await fetch(
      `https://testnet.binance.vision/api/v3/openOrders?${queryString}`,
      {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey!,
        },
      }
    );

    const result = await response.json();
    console.log("Open orders response:", result);

    return result;
  } catch (error) {
    console.error("Error getting open orders:", error);
    throw error;
  }
}

// Function to cancel an order
async function cancelOrder(orderParams: {
  symbol: string;
  orderId?: number;
  origClientOrderId?: string;
  newClientOrderId?: string;
  cancelRestrictions?: "ONLY_NEW" | "ONLY_PARTIALLY_FILLED";
  recvWindow?: number;
}) {
  try {
    const timestamp = Date.now();

    const params: Record<string, any> = {
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
    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    // Create WebSocket-style request
    const request = {
      id: uuidv4(),
      method: "order.cancel",
      params: params,
    };

    console.log("Cancel order request:", JSON.stringify(request, null, 2));

    // For HTTP API call
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const response = await fetch(
      `https://testnet.binance.vision/api/v3/order?${queryString}`,
      {
        method: "DELETE",
        headers: {
          "X-MBX-APIKEY": apiKey!,
        },
      }
    );

    const result = await response.json();
    console.log("Cancel order response:", result);

    return result;
  } catch (error) {
    console.error("Error canceling order:", error);
    throw error;
  }
}

// Function to cancel all open orders for a symbol or all symbols
async function cancelAllOpenOrders(symbol?: string, recvWindow?: number) {
  try {
    // First, get all open orders
    const openOrders = await getOpenOrders(symbol, recvWindow);

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

        const cancelResult = await cancelOrder({
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
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
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
  } catch (error) {
    console.error("Error cancelling all open orders:", error);
    throw error;
  }
}

// Function to cancel all open orders for a specific symbol only
async function cancelAllOpenOrdersForSymbol(
  symbol: string,
  recvWindow?: number
) {
  return await cancelAllOpenOrders(symbol, recvWindow);
}
// ...existing code...

// Function to get all orders (active, canceled, or filled)
async function getAllOrders(orderParams: {
  symbol: string;
  orderId?: number;
  startTime?: number;
  endTime?: number;
  limit?: number;
  recvWindow?: number;
}) {
  try {
    const timestamp = Date.now();

    const params: Record<string, any> = {
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
    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    console.log("Get all orders request:", JSON.stringify(params, null, 2));

    // Create query string for URL
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const response = await fetch(
      `https://testnet.binance.vision/api/v3/allOrders?${queryString}`,
      {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey!,
        },
      }
    );

    const result = await response.json();
    console.log("All orders response:", result);

    return result;
  } catch (error) {
    console.error("Error getting all orders:", error);
    throw error;
  }
}

// Function to query a specific order list
async function getOrderList(orderListParams: {
  orderListId?: number;
  origClientOrderId?: string;
  recvWindow?: number;
}) {
  try {
    const timestamp = Date.now();

    const params: Record<string, any> = {
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
      throw new Error(
        "Either orderListId or origClientOrderId must be provided"
      );
    }

    // Create signature
    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    console.log("Get order list request:", JSON.stringify(params, null, 2));

    // Create query string for URL
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const response = await fetch(
      `https://testnet.binance.vision/api/v3/orderList?${queryString}`,
      {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey!,
        },
      }
    );

    const result = await response.json();
    console.log("Order list response:", result);

    return result;
  } catch (error) {
    console.error("Error getting order list:", error);
    throw error;
  }
}

// Function to get all order lists
async function getAllOrderLists(orderListParams?: {
  fromId?: number;
  startTime?: number;
  endTime?: number;
  limit?: number;
  recvWindow?: number;
}) {
  try {
    const timestamp = Date.now();

    const params: Record<string, any> = {
      timestamp: timestamp,
    };

    if (orderListParams?.fromId) {
      params.fromId = orderListParams.fromId;
      // If fromId is supplied, neither startTime nor endTime can be provided
    } else {
      if (orderListParams?.startTime) {
        params.startTime = orderListParams.startTime;
      }

      if (orderListParams?.endTime) {
        params.endTime = orderListParams.endTime;
      }
    }

    if (orderListParams?.limit) {
      params.limit = Math.min(orderListParams.limit, 1000); // Max 1000
    }

    if (orderListParams?.recvWindow) {
      params.recvWindow = orderListParams.recvWindow;
    }

    // Create signature
    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    console.log(
      "Get all order lists request:",
      JSON.stringify(params, null, 2)
    );

    // Create query string for URL
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const response = await fetch(
      `https://testnet.binance.vision/api/v3/allOrderList?${queryString}`,
      {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey!,
        },
      }
    );

    const result = await response.json();
    console.log("All order lists response:", result);

    return result;
  } catch (error) {
    console.error("Error getting all order lists:", error);
    throw error;
  }
}
// ...existing code...

// Function to get USD account balance specifically
async function getUSDAccountBalance(recvWindow?: number) {
  try {
    // Get full account info
    const accountInfo = await getAccountInfo(true, recvWindow); // omitZeroBalances = true

    if (!accountInfo || !accountInfo.balances) {
      throw new Error("Invalid account info response");
    }

    // Filter for USD-related assets
    const usdBalances = accountInfo.balances.filter((balance: any) => {
      const asset = balance.asset.toUpperCase();
      return (
        asset === "USDT" ||
        asset === "USDC" ||
        asset === "BUSD" ||
        asset === "USD" ||
        asset === "TUSD" ||
        asset === "USDP" ||
        asset === "DAI" ||
        asset.includes("USD")
      );
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
  } catch (error) {
    console.error("Error getting USD account balance:", error);
    throw error;
  }
}

// Function to get specific asset balance
async function getAssetBalance(asset: string, recvWindow?: number) {
  try {
    const accountInfo = await getAccountInfo(true, recvWindow);

    if (!accountInfo || !accountInfo.balances) {
      throw new Error("Invalid account info response");
    }

    const assetBalance = accountInfo.balances.find(
      (balance: any) => balance.asset.toUpperCase() === asset.toUpperCase()
    );

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
  } catch (error) {
    console.error(`Error getting ${asset} balance:`, error);
    throw error;
  }
}

export {
  placeOrder,
  getAccountInfo,
  getUSDAccountBalance,
  getAssetBalance,
  getOrderStatus,
  getOpenOrders,
  getAllOrders,
  getOrderList,
  getAllOrderLists,
  cancelOrder,
  cancelAllOpenOrders,
  cancelAllOpenOrdersForSymbol,
};
