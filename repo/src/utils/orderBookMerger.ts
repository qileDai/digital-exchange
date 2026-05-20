// utils/orderBookMerger.ts
import { DepthItem, OrderBookData } from '../types/trading';

type DepthLevelUpdate = [string, string];

interface OrderBookUpdate {
  bids?: DepthLevelUpdate[];
  asks?: DepthLevelUpdate[];
  lastUpdateId?: number;
}

export class OrderBookMerger {
  private static updateSide(
    current: DepthItem[] = [],
    update: DepthLevelUpdate[] = [],
    isBid: boolean
  ): DepthItem[] {
    const updateMap = new Map<number, number>();

    update.forEach(([price, quantity]) => {
      const numPrice = parseFloat(price);
      const numQuantity = parseFloat(quantity);

      if (!Number.isFinite(numPrice) || !Number.isFinite(numQuantity)) {
        return;
      }

      updateMap.set(numPrice, numQuantity);
    });

    const result: DepthItem[] = [];
    let i = 0;

    while (i < current.length && updateMap.size > 0) {
      const currentItem = current[i];

      if (updateMap.has(currentItem.price)) {
        const newQuantity = updateMap.get(currentItem.price)!;

        if (newQuantity > 0) {
          result.push({ price: currentItem.price, quantity: newQuantity });
        }

        updateMap.delete(currentItem.price);
        i++;
      } else {
        let closestPrice: number | null = null;
        let minDiff = Infinity;

        updateMap.forEach((quantity, price) => {
          if (quantity <= 0) {
            return;
          }

          const diff = Math.abs(price - currentItem.price);
          if (diff < minDiff) {
            minDiff = diff;
            closestPrice = price;
          }
        });

        if (
          closestPrice !== null &&
          (isBid ? closestPrice > currentItem.price : closestPrice < currentItem.price)
        ) {
          result.push({
            price: closestPrice,
            quantity: updateMap.get(closestPrice)!,
          });
          updateMap.delete(closestPrice);
        } else {
          result.push(currentItem);
          i++;
        }
      }
    }

    while (i < current.length) {
      result.push(current[i]);
      i++;
    }

    const remainingUpdates = Array.from(updateMap.entries())
      .filter(([, quantity]) => quantity > 0)
      .sort((a, b) => (isBid ? b[0] - a[0] : a[0] - b[0]));

    remainingUpdates.forEach(([price, quantity]) => {
      result.push({ price, quantity });
    });

    return result
      .sort((a, b) => (isBid ? b.price - a.price : a.price - b.price))
      .slice(0, 25);
  }

  public static mergeOrderBook(
    current: OrderBookData,
    update: OrderBookUpdate
  ): OrderBookData {
    return {
      bids: this.updateSide(current.bids, update.bids ?? [], true),
      asks: this.updateSide(current.asks, update.asks ?? [], false),
      lastUpdateId: update.lastUpdateId ?? current.lastUpdateId,
    };
  }
}
