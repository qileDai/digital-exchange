// utils/formatting.ts
export const formatNumber = (num: number, decimals: number = 4): string => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  export const formatPrice = (price: number): string => {
    if (price >= 1000) return formatNumber(price, 2);
    if (price >= 100) return formatNumber(price, 3);
    if (price >= 10) return formatNumber(price, 4);
    if (price >= 1) return formatNumber(price, 5);
    if (price >= 0.1) return formatNumber(price, 6);
    return formatNumber(price, 8);
  };
  
  export const formatQuantity = (quantity: number): string => {
    if (quantity >= 1000) return formatNumber(quantity, 2);
    if (quantity >= 100) return formatNumber(quantity, 3);
    if (quantity >= 10) return formatNumber(quantity, 4);
    return formatNumber(quantity, 6);
  };