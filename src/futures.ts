// Function to create signature for futures API
import dotenv from "dotenv";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const apiKey = process.env.BINANCE_FUTURES_API_KEY;
const apiSecret = process.env.BINANCE_FUTURES_API_SECRET;
if (!apiKey || !apiSecret) {
  throw new Error(
    "BINANCE_API_KEY and BINANCE_API_SECRET must be set in .env file"
  );
}

function createSignature(params: Record<string, any>, secret: string): string {
  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHmac("sha256", secret).update(queryString).digest("hex");
}

// Function to place a futures order
async function placeFuturesOrder(orderParams: {
  symbol: string;
  side: "BUY" | "SELL";
  positionSide?: "BOTH" | "LONG" | "SHORT"; // Default is "BOTH"
  type:
    | "LIMIT"
    | "MARKET"
    | "STOP"
    | "STOP_MARKET"
    | "TAKE_PROFIT"
    | "TAKE_PROFIT_MARKET"
    | "TRAILING_STOP_MARKET";
  timeInForce?: "GTC" | "IOC" | "FOK" | "GTX"; // GTX = Good Till Crossing
  quantity?: string; // Order quantity
  reduceOnly?: boolean; // Default false. Used to close position
  price?: string; // Order price
  newClientOrderId?: string; // Client order ID
  stopPrice?: string; // Used with STOP/STOP_MARKET or TAKE_PROFIT/TAKE_PROFIT_MARKET
  closePosition?: boolean; // Used with STOP_MARKET or TAKE_PROFIT_MARKET
  activationPrice?: string; // Used with TRAILING_STOP_MARKET
  callbackRate?: string; // Used with TRAILING_STOP_MARKET
  workingType?: "MARK_PRICE" | "CONTRACT_PRICE"; // Default "CONTRACT_PRICE"
  priceProtect?: boolean; // Default false
  newOrderRespType?: "ACK" | "RESULT"; // Default "ACK"
  recvWindow?: number; // Default 5000ms
}) {
  try {
    const timestamp = Date.now();

    // Prepare parameters
    const params: Record<string, any> = {
      ...orderParams,
      timestamp: timestamp,
    };

    // Create signature
    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    console.log("Futures order parameters:", params);

    // Create query string for URL
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    // Make HTTP request to futures API
    const response = await fetch(
      `https://testnet.binancefuture.com/fapi/v1/order?${queryString}`,
      {
        method: "POST",
        headers: {
          "X-MBX-APIKEY": apiKey!,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const result = await response.json();
    console.log("Futures order response:", result);

    return result;
  } catch (error) {
    console.error("Error placing futures order:", error);
    throw error;
  }
}

// Function to get futures account information
async function getFuturesAccountInfo(recvWindow?: number) {
  try {
    const timestamp = Date.now();

    const params: Record<string, any> = {
      timestamp: timestamp,
    };

    if (recvWindow) {
      params.recvWindow = recvWindow;
    }

    // Create signature
    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    // Create query string for URL
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const response = await fetch(
      `https://testnet.binancefuture.com/fapi/v2/account?${queryString}`,
      {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey!,
        },
      }
    );

    const result = await response.json();
    console.log("Futures account info response:", result);

    return result;
  } catch (error) {
    console.error("Error getting futures account info:", error);
    throw error;
  }
}

// Function to get futures positions
async function getFuturesPositions(recvWindow?: number) {
  try {
    const timestamp = Date.now();

    const params: Record<string, any> = {
      timestamp: timestamp,
    };

    if (recvWindow) {
      params.recvWindow = recvWindow;
    }

    // Create signature
    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    // Create query string for URL
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const response = await fetch(
      `https://testnet.binancefuture.com/fapi/v2/positionRisk?${queryString}`,
      {
        method: "GET",
        headers: {
          "X-MBX-APIKEY": apiKey!,
        },
      }
    );

    const result = await response.json();
    console.log("Futures positions response:", result);

    return result;
  } catch (error) {
    console.error("Error getting futures positions:", error);
    throw error;
  }
}

// Function to change futures leverage
async function changeFuturesLeverage(
  symbol: string,
  leverage: number,
  recvWindow?: number
) {
  try {
    const timestamp = Date.now();

    const params: Record<string, any> = {
      symbol: symbol,
      leverage: leverage,
      timestamp: timestamp,
    };

    if (recvWindow) {
      params.recvWindow = recvWindow;
    }

    // Create signature
    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    // Create query string for URL
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const response = await fetch(
      `https://testnet.binancefuture.com/fapi/v1/leverage?${queryString}`,
      {
        method: "POST",
        headers: {
          "X-MBX-APIKEY": apiKey!,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const result = await response.json();
    console.log(`Changed leverage for ${symbol} to ${leverage}x:`, result);

    return result;
  } catch (error) {
    console.error(`Error changing leverage for ${symbol}:`, error);
    throw error;
  }
}

// Function to cancel futures order
async function cancelFuturesOrder(
  symbol: string,
  orderId?: number,
  origClientOrderId?: string,
  recvWindow?: number
) {
  try {
    const timestamp = Date.now();

    const params: Record<string, any> = {
      symbol: symbol,
      timestamp: timestamp,
    };

    if (orderId) {
      params.orderId = orderId;
    } else if (origClientOrderId) {
      params.origClientOrderId = origClientOrderId;
    } else {
      throw new Error("Either orderId or origClientOrderId must be provided");
    }

    if (recvWindow) {
      params.recvWindow = recvWindow;
    }

    // Create signature
    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    // Create query string for URL
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    const response = await fetch(
      `https://testnet.binancefuture.com/fapi/v1/order?${queryString}`,
      {
        method: "DELETE",
        headers: {
          "X-MBX-APIKEY": apiKey!,
        },
      }
    );

    const result = await response.json();
    console.log("Cancel futures order response:", result);

    return result;
  } catch (error) {
    console.error("Error canceling futures order:", error);
    throw error;
  }
}

// Function to place USDT-M futures order (perpetual contracts)
async function placeUSDTMFuturesOrder(orderParams: {
  symbol: string;
  side: "BUY" | "SELL";
  positionSide?: "BOTH" | "LONG" | "SHORT";
  type:
    | "LIMIT"
    | "MARKET"
    | "STOP"
    | "STOP_MARKET"
    | "TAKE_PROFIT"
    | "TAKE_PROFIT_MARKET"
    | "TRAILING_STOP_MARKET";
  timeInForce?: "GTC" | "IOC" | "FOK" | "GTX";
  quantity?: string;
  reduceOnly?: boolean;
  price?: string;
  newClientOrderId?: string;
  stopPrice?: string;
  closePosition?: boolean;
  activationPrice?: string;
  callbackRate?: string;
  workingType?: "MARK_PRICE" | "CONTRACT_PRICE";
  priceProtect?: boolean;
  newOrderRespType?: "ACK" | "RESULT";
  recvWindow?: number;
}) {
  try {
    const timestamp = Date.now();
    const params: Record<string, any> = {
      ...orderParams,
      timestamp: timestamp,
    };

    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    console.log("USDT-M Futures order parameters:", params);

    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    // USDT-M Futures endpoint
    const response = await fetch(
      `https://testnet.binancefuture.com/fapi/v1/order?${queryString}`,
      {
        method: "POST",
        headers: {
          "X-MBX-APIKEY": apiKey!,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const result = await response.json();
    console.log("USDT-M Futures order response:", result);
    return result;
  } catch (error) {
    console.error("Error placing USDT-M futures order:", error);
    throw error;
  }
}

// Function to place Coin-M futures order (delivery contracts)
async function placeCoinMFuturesOrder(orderParams: {
  symbol: string;
  side: "BUY" | "SELL";
  positionSide?: "BOTH" | "LONG" | "SHORT";
  type:
    | "LIMIT"
    | "MARKET"
    | "STOP"
    | "STOP_MARKET"
    | "TAKE_PROFIT"
    | "TAKE_PROFIT_MARKET";
  timeInForce?: "GTC" | "IOC" | "FOK";
  quantity?: string;
  reduceOnly?: boolean;
  price?: string;
  newClientOrderId?: string;
  stopPrice?: string;
  closePosition?: boolean;
  workingType?: "MARK_PRICE" | "CONTRACT_PRICE";
  priceProtect?: boolean;
  newOrderRespType?: "ACK" | "RESULT";
  recvWindow?: number;
}) {
  try {
    const timestamp = Date.now();
    const params: Record<string, any> = {
      ...orderParams,
      timestamp: timestamp,
    };

    const signature = createSignature(params, apiSecret!);
    params.signature = signature;

    console.log("Coin-M Futures order parameters:", params);

    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    // Coin-M Futures endpoint (different from USDT-M)
    const response = await fetch(
      `https://testnet.binancefuture.com/dapi/v1/order?${queryString}`,
      {
        method: "POST",
        headers: {
          "X-MBX-APIKEY": apiKey!,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const result = await response.json();
    console.log("Coin-M Futures order response:", result);
    return result;
  } catch (error) {
    console.error("Error placing Coin-M futures order:", error);
    throw error;
  }
}

// Smart function that automatically detects and places the correct order type
async function placeSmartFuturesOrder(orderParams: {
  symbol: string;
  side: "BUY" | "SELL";
  type:
    | "LIMIT"
    | "MARKET"
    | "STOP"
    | "STOP_MARKET"
    | "TAKE_PROFIT"
    | "TAKE_PROFIT_MARKET";
  quantity: string;
  price?: string;
  stopPrice?: string;
  reduceOnly?: boolean;
  newOrderRespType?: "ACK" | "RESULT";
}) {
  try {
    const symbol = orderParams.symbol.toUpperCase();

    // Detect if it's Coin-M (delivery) or USDT-M (perpetual)
    const isCoinM =
      symbol.includes("USDM") ||
      (symbol.includes("USD") && symbol.match(/\d{3}$/)); // Ends with 3 digits like M202

    if (isCoinM) {
      console.log(`🪙 Detected Coin-M futures contract: ${symbol}`);
      return await placeCoinMFuturesOrder(orderParams);
    } else {
      console.log(`💵 Detected USDT-M futures contract: ${symbol}`);
      return await placeUSDTMFuturesOrder(orderParams);
    }
  } catch (error) {
    console.error("Error in smart futures order:", error);
    throw error;
  }
}

// Risk management configuration
interface RiskConfig {
  riskPerTradePercent: number; // 1.0 = 1% of capital
  stopLossPercent: number; // 0.25 = 0.25% stop loss
  maxLeverage?: number; // Optional max leverage limit
  minOrderSize?: number; // Minimum order size
}

// Function to get current price for a symbol
async function getCurrentPrice(symbol: string, isCoinM: boolean = false) {
  try {
    const endpoint = isCoinM
      ? `https://testnet.binancefuture.com/dapi/v1/ticker/price?symbol=${symbol}`
      : `https://testnet.binancefuture.com/fapi/v1/ticker/price?symbol=${symbol}`;

    const response = await fetch(endpoint);
    const result = await response.json();

    if (result.price) {
      return parseFloat(result.price);
    } else {
      throw new Error(`Failed to get price for ${symbol}`);
    }
  } catch (error) {
    console.error(`Error getting current price for ${symbol}:`, error);
    throw error;
  }
}

// Function to get account balance
async function getAccountCapital(isCoinM: boolean = false) {
  try {
    let accountInfo;

    if (isCoinM) {
      // For Coin-M futures, get dapi account info
      const timestamp = Date.now();
      const params = { timestamp };
      const signature = createSignature(params, apiSecret!);

      const queryString = `timestamp=${timestamp}&signature=${signature}`;
      const response = await fetch(
        `https://testnet.binancefuture.com/dapi/v1/account?${queryString}`,
        {
          method: "GET",
          headers: { "X-MBX-APIKEY": apiKey! },
        }
      );
      accountInfo = await response.json();

      // For Coin-M, sum up all asset values (simplified)
      const totalBalance =
        accountInfo.assets?.reduce((sum: number, asset: any) => {
          return sum + parseFloat(asset.walletBalance || 0);
        }, 0) || 0;

      return totalBalance;
    } else {
      // For USDT-M futures
      accountInfo = await getFuturesAccountInfo();
      return parseFloat(accountInfo.totalWalletBalance || 0);
    }
  } catch (error) {
    console.error("Error getting account capital:", error);
    throw error;
  }
}

// Add helper function to format quantity with proper precision
async function formatQuantityWithPrecision(
  symbol: string,
  quantity: number,
  isCoinM: boolean = false
): Promise<string> {
  try {
    const minReqs = await getMinOrderRequirements(symbol, isCoinM);

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
  } catch (error) {
    console.error(`Error formatting quantity for ${symbol}:`, error);
    // Fallback to 3 decimal places
    return quantity.toFixed(3).replace(/\.?0+$/, "");
  }
}

// Main function to calculate position size and place order with risk management - FIXED
async function placeRiskManagedOrder(orderParams: {
  symbol: string;
  side: "BUY" | "SELL";
  type?: "MARKET" | "LIMIT";
  price?: number;
  riskConfig: RiskConfig;
  leverage?: number;
}) {
  try {
    const {
      symbol,
      side,
      type = "MARKET",
      price,
      riskConfig,
      leverage = 1,
    } = orderParams;

    console.log(`🎯 Placing risk-managed order for ${symbol}...`);

    // Detect contract type using the converter
    const isCoinM =
      symbol.includes("USD_") ||
      symbol.endsWith("USD_PERP") ||
      (symbol.includes("USD") &&
        !symbol.includes("USDT") &&
        !!symbol.match(/_\d{6}$/));

    console.log(`📊 Contract type: ${isCoinM ? "Coin-M" : "USDT-M"}`);

    // Get minimum requirements first
    const minReqs = await getMinOrderRequirements(symbol, isCoinM);
    console.log(`📋 Min requirements for ${symbol}:`, minReqs);

    if (minReqs.status !== "TRADING") {
      throw new Error(
        `Symbol ${symbol} is not available for trading (status: ${minReqs.status})`
      );
    }

    // Get current price
    const currentPrice = price || (await getCurrentPrice(symbol, isCoinM));
    console.log(`💰 Current price: ${currentPrice}`);

    // Get account capital
    const capital = await getAccountCapital(isCoinM);
    console.log(`💼 Account capital: ${capital}`);

    if (capital <= 0) {
      throw new Error("Insufficient account balance");
    }

    // Risk Calculation
    const riskCapital = capital * (riskConfig.riskPerTradePercent / 100);
    const stopDist = currentPrice * (riskConfig.stopLossPercent / 100);
    let calculatedQty = riskCapital / stopDist;

    console.log(`📈 Risk calculations:`);
    console.log(
      `   Risk capital (${
        riskConfig.riskPerTradePercent
      }%): ${riskCapital.toFixed(2)}`
    );
    console.log(
      `   Stop distance (${riskConfig.stopLossPercent}%): ${stopDist.toFixed(
        6
      )}`
    );
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
      console.log(
        `⚠️ Quantity adjusted for min notional ($${
          minReqs.minNotional
        }): ${calculatedQty.toFixed(8)}`
      );
    }

    // Format quantity with proper precision - THIS IS THE KEY FIX
    const formattedQuantity = await formatQuantityWithPrecision(
      symbol,
      calculatedQty,
      isCoinM
    );
    console.log(`✅ Final formatted quantity: ${formattedQuantity}`);

    // Verify the formatted quantity meets requirements
    const finalNotional = parseFloat(formattedQuantity) * currentPrice;
    console.log(`💵 Final notional value: $${finalNotional.toFixed(2)}`);

    if (finalNotional < minReqs.minNotional) {
      throw new Error(
        `Order size too small. Minimum notional: $${
          minReqs.minNotional
        }, got: $${finalNotional.toFixed(2)}`
      );
    }

    // Calculate stop loss price
    const stopLossPrice =
      side === "BUY"
        ? currentPrice * (1 - riskConfig.stopLossPercent / 100)
        : currentPrice * (1 + riskConfig.stopLossPercent / 100);

    console.log(`🛑 Stop loss price: ${stopLossPrice.toFixed(6)}`);

    // Set leverage if specified
    if (leverage > 1 && !isCoinM) {
      // Only set leverage for USDT-M
      try {
        await changeFuturesLeverage(symbol, leverage);
        console.log(`⚡ Leverage set to ${leverage}x`);
      } catch (leverageError) {
        console.warn(`Warning: Could not set leverage - ${leverageError}`);
      }
    }

    // Place main order with properly formatted quantity
    const mainOrderParams = {
      symbol: symbol,
      side: side,
      type: type,
      quantity: formattedQuantity, // Use formatted quantity
      ...(type === "LIMIT" && price ? { price: price.toString() } : {}),
      newOrderRespType: "RESULT" as const,
    };

    console.log(`📤 Placing order with params:`, mainOrderParams);

    let mainOrderResult;
    if (isCoinM) {
      mainOrderResult = await placeCoinMFuturesOrder(mainOrderParams);
    } else {
      mainOrderResult = await placeUSDTMFuturesOrder(mainOrderParams);
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
  } catch (error) {
    console.error("❌ Error placing risk-managed order:", error);
    throw error;
  }
}

// Also update the placeSmartRiskOrder function to handle precision
async function placeSmartRiskOrder(
  symbol: string,
  side: "BUY" | "SELL",
  customRisk?: Partial<RiskConfig>
) {
  const defaultRisk: RiskConfig = {
    riskPerTradePercent: 1.0,
    stopLossPercent: 0.25,
    maxLeverage: 50,
    minOrderSize: 0.001,
  };

  const riskConfig = { ...defaultRisk, ...customRisk };

  try {
    // Get minimum requirements to adjust default minOrderSize if needed
    const isCoinM =
      symbol.includes("USD_") ||
      symbol.endsWith("USD_PERP") ||
      (symbol.includes("USD") && !symbol.includes("USDT"));

    const minReqs = await getMinOrderRequirements(symbol, isCoinM);

    // Adjust minimum order size based on symbol requirements
    if (minReqs.minQty > riskConfig.minOrderSize!) {
      riskConfig.minOrderSize = minReqs.minQty;
      console.log(
        `📋 Adjusted min order size to ${riskConfig.minOrderSize} for ${symbol}`
      );
    }

    return await placeRiskManagedOrder({
      symbol,
      side,
      type: "MARKET",
      riskConfig,
      leverage: riskConfig.maxLeverage,
    });
  } catch (error) {
    console.error(`❌ Error in smart risk order for ${symbol}:`, error);
    throw error;
  }
}

// Function to get exchange info and find valid symbols
async function getValidTestSymbols() {
  try {
    // Get USDT-M futures symbols
    const usdtMResponse = await fetch(
      `https://testnet.binancefuture.com/fapi/v1/exchangeInfo`,
      {
        method: "GET",
      }
    );
    const usdtMData = await usdtMResponse.json();

    // Get Coin-M futures symbols
    const coinMResponse = await fetch(
      `https://testnet.binancefuture.com/dapi/v1/exchangeInfo`,
      {
        method: "GET",
      }
    );
    const coinMData = await coinMResponse.json();

    // Find valid USDT-M symbols
    const validUSDTM =
      usdtMData.symbols?.filter(
        (s: any) =>
          s.status === "TRADING" &&
          (s.symbol === "ETHUSDT" ||
            s.symbol === "BTCUSDT" ||
            s.symbol === "BNBUSDT")
      ) || [];

    // Find valid Coin-M symbols (perpetual contracts)
    const validCoinM =
      coinMData.symbols?.filter(
        (s: any) =>
          s.status === "TRADING" &&
          s.contractType === "PERPETUAL" &&
          (s.symbol.includes("ETH") || s.symbol.includes("BTC"))
      ) || [];

    return {
      usdtM: validUSDTM.length > 0 ? validUSDTM[0] : null,
      coinM: validCoinM.length > 0 ? validCoinM[0] : null,
    };
  } catch (error) {
    console.error("Error getting valid test symbols:", error);
    return { usdtM: null, coinM: null };
  }
}

// Function to get minimum order requirements for a symbol
async function getMinOrderRequirements(
  symbol: string,
  isCoinM: boolean = false
) {
  try {
    const endpoint = isCoinM
      ? `https://testnet.binancefuture.com/dapi/v1/exchangeInfo`
      : `https://testnet.binancefuture.com/fapi/v1/exchangeInfo`;

    const response = await fetch(endpoint);
    const data = await response.json();

    const symbolInfo = data.symbols?.find((s: any) => s.symbol === symbol);
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
  } catch (error) {
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
}

// Updated function to place small test trades with proper minimum sizes
async function placeSmallTestTrades() {
  try {
    console.log("🧪 Starting small test trades with proper minimum sizes...");

    const results = [];

    // Get valid symbols first
    const validSymbols = await getValidTestSymbols();
    console.log("Valid symbols found:", validSymbols);

    // Test USDT-M futures if available
    if (validSymbols.usdtM) {
      try {
        const symbol = validSymbols.usdtM.symbol;
        console.log(`Testing USDT-M futures with ${symbol}...`);

        // Get minimum requirements
        const minReqs = await getMinOrderRequirements(symbol, false);
        console.log(`Min requirements for ${symbol}:`, minReqs);

        // Get current price to calculate proper quantity
        const currentPrice = await getCurrentPrice(symbol, false);
        console.log(`Current price for ${symbol}: ${currentPrice}`);

        // Calculate quantity to meet minimum notional (usually $20-50)
        const targetNotional = Math.max(minReqs.minNotional, 25); // Use at least $25
        let quantity = targetNotional / currentPrice;

        // Round to step size
        quantity = Math.ceil(quantity / minReqs.stepSize) * minReqs.stepSize;
        quantity = Math.max(quantity, minReqs.minQty);

        // Format to appropriate decimal places
        const qtyStr = quantity.toFixed(6).replace(/\.?0+$/, "");

        console.log(
          `Calculated quantity: ${qtyStr} (notional: ~$${(
            quantity * currentPrice
          ).toFixed(2)})`
        );

        // Set leverage to 1x for safety
        await changeFuturesLeverage(symbol, 1);
        console.log(`✅ Set leverage to 1x for ${symbol}`);

        const usdtmResult = await placeUSDTMFuturesOrder({
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
      } catch (error) {
        console.error("USDT-M test failed:", error);
        results.push({
          type: "USDT-M",
          symbol: validSymbols.usdtM?.symbol || "UNKNOWN",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } else {
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
        const minReqs = await getMinOrderRequirements(symbol, true);
        console.log(`Min requirements for ${symbol}:`, minReqs);

        // For Coin-M, quantity is usually in contracts, not base asset
        // Start with 1 contract and adjust if needed
        let quantity = 1;
        const qtyStr = quantity.toString();

        console.log(`Using quantity: ${qtyStr} contracts`);

        const coinmResult = await placeCoinMFuturesOrder({
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
      } catch (error) {
        console.error("Coin-M test failed:", error);
        results.push({
          type: "Coin-M",
          symbol: validSymbols.coinM?.symbol || "UNKNOWN",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    } else {
      results.push({
        type: "Coin-M",
        symbol: "NONE",
        error: "No valid Coin-M symbols found for testing",
      });
    }

    return results;
  } catch (error) {
    console.error("Error in test trades:", error);
    throw error;
  }
}

// Alternative function for safe testing with very small amounts
async function placeSafeTestTrade(symbol: string, isCoinM: boolean = false) {
  try {
    console.log(
      `🧪 Placing safe test trade for ${symbol} (${
        isCoinM ? "Coin-M" : "USDT-M"
      })`
    );

    // Get minimum requirements
    const minReqs = await getMinOrderRequirements(symbol, isCoinM);
    console.log(`Requirements for ${symbol}:`, minReqs);

    if (minReqs.status !== "TRADING") {
      throw new Error(
        `Symbol ${symbol} is not available for trading (status: ${minReqs.status})`
      );
    }

    let quantity: string;

    if (isCoinM) {
      // For Coin-M, use 1 contract as minimum
      quantity = "1";
    } else {
      // For USDT-M, calculate based on minimum notional
      const currentPrice = await getCurrentPrice(symbol, false);
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
      await changeFuturesLeverage(symbol, 1);
    }

    const orderParams = {
      symbol: symbol,
      side: "BUY" as const,
      type: "MARKET" as const,
      quantity: quantity,
      newOrderRespType: "RESULT" as const,
    };

    let result;
    if (isCoinM) {
      result = await placeCoinMFuturesOrder(orderParams);
    } else {
      result = await placeUSDTMFuturesOrder(orderParams);
    }

    return {
      success: true,
      symbol: symbol,
      contractType: isCoinM ? "Coin-M" : "USDT-M",
      quantity: quantity,
      minRequirements: minReqs,
      orderResult: result,
    };
  } catch (error) {
    console.error(`Error in safe test trade for ${symbol}:`, error);
    return {
      success: false,
      symbol: symbol,
      contractType: isCoinM ? "Coin-M" : "USDT-M",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Update exports to include new functions
export {
  placeFuturesOrder,
  placeUSDTMFuturesOrder,
  placeCoinMFuturesOrder,
  placeSmartFuturesOrder,
  placeSmallTestTrades, // Updated function
  placeSafeTestTrade, // New function
  getValidTestSymbols, // New function
  getMinOrderRequirements, // New function
  getFuturesAccountInfo,
  getFuturesPositions,
  changeFuturesLeverage,
  cancelFuturesOrder,
  placeRiskManagedOrder,
  placeSmartRiskOrder,
  getCurrentPrice,
  getAccountCapital,
};
