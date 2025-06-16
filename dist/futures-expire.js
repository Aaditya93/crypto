"use strict";
// Function to check contract settlement type and expiry
// async function getContractSettlementInfo(symbol: string) {
//   try {
//     const contractInfo = await getContractInfo(symbol);
//     const deliveryDate = new Date(contractInfo.deliveryDate);
//     const now = new Date();
//     const daysUntilExpiry = Math.ceil(
//       (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
//     );
//     return {
//       symbol: contractInfo.symbol,
//       deliveryDate: contractInfo.deliveryDate,
//       deliveryDateFormatted: deliveryDate.toLocaleDateString(),
//       daysUntilExpiry: daysUntilExpiry,
//       contractType: contractInfo.contractType,
//       status: contractInfo.status,
//       isNearExpiry: daysUntilExpiry <= 7,
//       settlementWarning:
//         daysUntilExpiry <= 7
//           ? "⚠️ Contract expires soon! Consider closing position."
//           : "✅ Contract has sufficient time before expiry",
//     };
//   } catch (error) {
//     console.error(`Error getting settlement info for ${symbol}:`, error);
//     throw error;
//   }
// }
// // Function to close all positions for a specific symbol
// async function closeAllPositionsForSymbol(symbol: string) {
//   try {
//     console.log(`🔄 Closing all positions for ${symbol}...`);
//     // Get current positions
//     const positions = await getFuturesPositions();
//     const symbolPosition = positions.find(
//       (pos: any) =>
//         pos.symbol === symbol.toUpperCase() && parseFloat(pos.positionAmt) !== 0
//     );
//     if (!symbolPosition) {
//       return {
//         message: `No open positions found for ${symbol}`,
//         success: true,
//       };
//     }
//     const positionSize = Math.abs(parseFloat(symbolPosition.positionAmt));
//     const isLong = parseFloat(symbolPosition.positionAmt) > 0;
//     // Determine if it's Coin-M or USDT-M
//     const isCoinM =
//       symbol.includes("USDM") ||
//       (symbol.includes("USD") && symbol.match(/\d{3}$/));
//     // Close position with opposite side
//     const closeOrder = {
//       symbol: symbol.toUpperCase(),
//       side: isLong ? "SELL" : "BUY",
//       type: "MARKET" as const,
//       quantity: positionSize.toString(),
//       reduceOnly: true,
//       newOrderRespType: "RESULT" as const,
//     };
//     let result;
//     if (isCoinM) {
//       result = await placeCoinMFuturesOrder(closeOrder);
//     } else {
//       result = await placeUSDTMFuturesOrder(closeOrder);
//     }
//     console.log(
//       `✅ Closed ${isLong ? "LONG" : "SHORT"} position for ${symbol}`
//     );
//     return {
//       message: `Closed ${
//         isLong ? "LONG" : "SHORT"
//       } position of ${positionSize} for ${symbol}`,
//       orderResult: result,
//       success: true,
//     };
//   } catch (error) {
//     console.error(`Error closing positions for ${symbol}:`, error);
//     throw error;
//   }
// }
// // Function to check all positions near expiry
// async function checkPositionsNearExpiry() {
//   try {
//     const positions = await getFuturesPositions();
//     const activePositions = positions.filter(
//       (pos: any) => parseFloat(pos.positionAmt) !== 0
//     );
//     const expiryChecks = [];
//     for (const position of activePositions) {
//       try {
//         const settlementInfo = await getContractSettlementInfo(position.symbol);
//         if (settlementInfo.isNearExpiry) {
//           expiryChecks.push({
//             symbol: position.symbol,
//             positionSize: position.positionAmt,
//             side: parseFloat(position.positionAmt) > 0 ? "LONG" : "SHORT",
//             unrealizedPnl: position.unrealizedPnl,
//             ...settlementInfo,
//           });
//         }
//       } catch (error) {
//         console.error(`Error checking expiry for ${position.symbol}:`, error);
//       }
//     }
//     return {
//       positionsNearExpiry: expiryChecks,
//       count: expiryChecks.length,
//       needsAttention: expiryChecks.length > 0,
//     };
//   } catch (error) {
//     console.error("Error checking positions near expiry:", error);
//     throw error;
//   }
// }
// // Add to exports
// export {
//   // ...existing exports
//   getContractSettlementInfo,
//   closeAllPositionsForSymbol,
//   checkPositionsNearExpiry,
// };
