// utils/orderBookMerger.ts
import { DepthItem, OrderBookData } from '../types/trading';

export class OrderBookMerger {
  private static updateSide(
    current: DepthItem[],
    update: [string, string][],
    isBid: boolean
  ): DepthItem[] {
    const updateMap = new Map<number, number>();
    console.log(update,'update');
    
    
    // 将更新数据转换为Map
    update.forEach(([price, quantity]) => {
      const numPrice = parseFloat(price);
      const numQuantity = parseFloat(quantity);
      if (numQuantity > 0) {
        updateMap.set(numPrice, numQuantity);
      }
    });

    const result: DepthItem[] = [];
    let i = 0;
    
    // 处理现有数据
    while (i < current.length && updateMap.size > 0) {
      const currentItem = current[i];
      
      if (updateMap.has(currentItem.price)) {
        // 价格匹配，更新数量
        const newQuantity = updateMap.get(currentItem.price)!;
        if (newQuantity > 0) {
          result.push({ price: currentItem.price, quantity: newQuantity });
        }
        updateMap.delete(currentItem.price);
        i++;
      } else {
        // 查找最近的更新价格
        let closestPrice: number | null = null;
        let minDiff = Infinity;
        
        updateMap.forEach((_, price) => {
          const diff = Math.abs(price - currentItem.price);
          if (diff < minDiff) {
            minDiff = diff;
            closestPrice = price;
          }
        });

        if (closestPrice !== null && 
            (isBid ? closestPrice > currentItem.price : closestPrice < currentItem.price)) {
          // 插入更新数据
          result.push({ 
            price: closestPrice, 
            quantity: updateMap.get(closestPrice)! 
          });
          updateMap.delete(closestPrice);
        } else {
          // 保留当前数据
          result.push(currentItem);
          i++;
        }
      }
    }

    // 添加剩余当前数据
    while (i < current.length) {
      result.push(current[i]);
      i++;
    }

    // 添加剩余更新数据
    const remainingUpdates = Array.from(updateMap.entries())
      .sort((a, b) => isBid ? b[0] - a[0] : a[0] - b[0]);
    
    remainingUpdates.forEach(([price, quantity]) => {
      result.push({ price, quantity });
    });

    // 排序并限制数量
    return result
      .sort((a, b) => isBid ? b.price - a.price : a.price - b.price)
      .slice(0, 25);
  }

  public static mergeOrderBook(
    current: OrderBookData,
    update: { bids: [string, string][]; asks: [string, string][]; lastUpdateId: number }
  ): OrderBookData {
    console.log(current,'current');
    console.log(update,'updatea');
    
    return {
      bids: this.updateSide(current.bids, update.bids, true),
      asks: this.updateSide(current.asks, update.asks, false),
      lastUpdateId: update.lastUpdateId,
    };
  }
}