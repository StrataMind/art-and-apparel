// Inventory Management System
export interface InventoryItem {
  productId: string
  productName: string
  sku: string
  currentStock: number
  lowStockThreshold: number
  reorderPoint: number
  reorderQuantity: number
  lastUpdated: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued'
  location?: string
  supplier?: string
  cost: number
  averageSalesPer30Days: number
  daysUntilStockout: number
}

export interface InventoryAlert {
  id: string
  productId: string
  productName: string
  type: 'low_stock' | 'out_of_stock' | 'overstocked' | 'fast_moving'
  severity: 'critical' | 'warning' | 'info'
  message: string
  currentStock: number
  threshold: number
  actionRequired: string
  createdAt: string
  acknowledged: boolean
}

export interface StockHistory {
  id: string
  productId: string
  changeType: 'sale' | 'restock' | 'adjustment' | 'return' | 'damage' | 'transfer'
  quantityBefore: number
  quantityAfter: number
  changeAmount: number
  reason?: string
  reference?: string // Order ID, adjustment ID, etc.
  performedBy?: string
  timestamp: string
  cost?: number
}

export interface BulkInventoryUpdate {
  productId: string
  sku: string
  stockChange: number
  newStock?: number
  reason: string
  cost?: number
}

export interface InventoryMetrics {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  averageTurnoverRate: number
  stockoutRisk: InventoryItem[]
  fastMovingItems: InventoryItem[]
  slowMovingItems: InventoryItem[]
  overstockedItems: InventoryItem[]
}

class InventoryManager {
  private storageKey = 'findora_inventory_data'
  private alertsKey = 'findora_inventory_alerts'
  private historyKey = 'findora_inventory_history'

  // Get all inventory items for a seller
  getInventory(sellerId?: string): InventoryItem[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.storageKey)
      const allInventory: InventoryItem[] = stored ? JSON.parse(stored) : []
      return sellerId ? allInventory.filter(item => item.productId.includes(sellerId)) : allInventory
    } catch (error) {
      console.error('Error loading inventory:', error)
      return []
    }
  }

  // Update inventory for a single product
  updateProductInventory(
    productId: string,
    changes: Partial<InventoryItem>,
    reason?: string
  ): boolean {
    try {
      const inventory = this.getInventory()
      const itemIndex = inventory.findIndex(item => item.productId === productId)
      
      if (itemIndex === -1) {
        // Create new inventory item
        const newItem: InventoryItem = {
          productId,
          productName: changes.productName || 'Unknown Product',
          sku: changes.sku || `SKU-${productId}`,
          currentStock: changes.currentStock || 0,
          lowStockThreshold: changes.lowStockThreshold || 10,
          reorderPoint: changes.reorderPoint || 5,
          reorderQuantity: changes.reorderQuantity || 50,
          lastUpdated: new Date().toISOString(),
          status: this.calculateStatus(changes.currentStock || 0, changes.lowStockThreshold || 10),
          cost: changes.cost || 0,
          averageSalesPer30Days: changes.averageSalesPer30Days || 0,
          daysUntilStockout: this.calculateDaysUntilStockout(
            changes.currentStock || 0, 
            changes.averageSalesPer30Days || 0
          ),
          ...changes
        }
        inventory.push(newItem)
      } else {
        // Update existing item
        const currentItem = inventory[itemIndex]
        const previousStock = currentItem.currentStock
        
        inventory[itemIndex] = {
          ...currentItem,
          ...changes,
          lastUpdated: new Date().toISOString(),
          status: this.calculateStatus(
            changes.currentStock ?? currentItem.currentStock,
            changes.lowStockThreshold ?? currentItem.lowStockThreshold
          ),
          daysUntilStockout: this.calculateDaysUntilStockout(
            changes.currentStock ?? currentItem.currentStock,
            changes.averageSalesPer30Days ?? currentItem.averageSalesPer30Days
          )
        }

        // Record stock history if quantity changed
        if (changes.currentStock !== undefined && changes.currentStock !== previousStock) {
          this.recordStockChange({
            productId,
            changeType: reason?.includes('sale') ? 'sale' : 'adjustment',
            quantityBefore: previousStock,
            quantityAfter: changes.currentStock,
            changeAmount: changes.currentStock - previousStock,
            reason: reason || 'Manual adjustment',
            timestamp: new Date().toISOString(),
            cost: changes.cost
          })
        }

        // Check for alerts
        this.checkAndCreateAlerts(inventory[itemIndex])
      }

      this.saveInventory(inventory)
      return true
    } catch (error) {
      console.error('Error updating inventory:', error)
      return false
    }
  }

  // Bulk inventory update
  bulkUpdateInventory(updates: BulkInventoryUpdate[], sellerId?: string): {
    success: boolean
    processed: number
    errors: { sku: string; error: string }[]
  } {
    const errors: { sku: string; error: string }[] = []
    let processed = 0

    updates.forEach(update => {
      try {
        const inventory = this.getInventory()
        const item = inventory.find(inv => inv.sku === update.sku)
        
        if (!item) {
          errors.push({ sku: update.sku, error: 'Product not found' })
          return
        }

        const newStock = update.newStock ?? (item.currentStock + update.stockChange)
        
        if (newStock < 0) {
          errors.push({ sku: update.sku, error: 'Stock cannot be negative' })
          return
        }

        const success = this.updateProductInventory(
          item.productId,
          { currentStock: newStock, cost: update.cost },
          update.reason
        )

        if (success) {
          processed++
        } else {
          errors.push({ sku: update.sku, error: 'Failed to update' })
        }
      } catch (error) {
        errors.push({ sku: update.sku, error: 'Update failed' })
      }
    })

    return {
      success: errors.length === 0,
      processed,
      errors
    }
  }

  // Get active alerts
  getAlerts(sellerId?: string): InventoryAlert[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.alertsKey)
      const allAlerts: InventoryAlert[] = stored ? JSON.parse(stored) : []
      return allAlerts.filter(alert => !alert.acknowledged)
    } catch (error) {
      console.error('Error loading alerts:', error)
      return []
    }
  }

  // Acknowledge an alert
  acknowledgeAlert(alertId: string): boolean {
    try {
      const alerts = this.getAllAlerts()
      const alertIndex = alerts.findIndex(alert => alert.id === alertId)
      
      if (alertIndex !== -1) {
        alerts[alertIndex].acknowledged = true
        this.saveAlerts(alerts)
        return true
      }
      return false
    } catch (error) {
      console.error('Error acknowledging alert:', error)
      return false
    }
  }

  // Get stock history for a product
  getStockHistory(productId: string, days: number = 30): StockHistory[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.historyKey)
      const allHistory: StockHistory[] = stored ? JSON.parse(stored) : []
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - days)
      
      return allHistory
        .filter(record => 
          record.productId === productId && 
          new Date(record.timestamp) > cutoff
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      console.error('Error loading stock history:', error)
      return []
    }
  }

  // Get inventory metrics
  getInventoryMetrics(sellerId?: string): InventoryMetrics {
    const inventory = this.getInventory(sellerId)
    
    const totalProducts = inventory.length
    const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.cost), 0)
    const lowStockItems = inventory.filter(item => item.status === 'low_stock').length
    const outOfStockItems = inventory.filter(item => item.status === 'out_of_stock').length

    // Calculate average turnover rate
    const totalTurnover = inventory.reduce((sum, item) => {
      const turnover = item.averageSalesPer30Days > 0 ? item.currentStock / (item.averageSalesPer30Days / 30) : 0
      return sum + turnover
    }, 0)
    const averageTurnoverRate = totalProducts > 0 ? totalTurnover / totalProducts : 0

    // Categorize items
    const stockoutRisk = inventory
      .filter(item => item.daysUntilStockout > 0 && item.daysUntilStockout <= 7)
      .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout)
      .slice(0, 10)

    const fastMovingItems = inventory
      .filter(item => item.averageSalesPer30Days > 10)
      .sort((a, b) => b.averageSalesPer30Days - a.averageSalesPer30Days)
      .slice(0, 10)

    const slowMovingItems = inventory
      .filter(item => item.averageSalesPer30Days < 2 && item.currentStock > item.lowStockThreshold)
      .sort((a, b) => a.averageSalesPer30Days - b.averageSalesPer30Days)
      .slice(0, 10)

    const overstockedItems = inventory
      .filter(item => item.currentStock > item.lowStockThreshold * 5)
      .sort((a, b) => b.currentStock - a.currentStock)
      .slice(0, 10)

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems,
      averageTurnoverRate,
      stockoutRisk,
      fastMovingItems,
      slowMovingItems,
      overstockedItems
    }
  }

  // Process a sale and update inventory
  processSale(productId: string, quantity: number, orderId?: string): boolean {
    try {
      const inventory = this.getInventory()
      const itemIndex = inventory.findIndex(item => item.productId === productId)
      
      if (itemIndex === -1 || inventory[itemIndex].currentStock < quantity) {
        return false
      }

      const item = inventory[itemIndex]
      const newStock = item.currentStock - quantity

      // Update inventory
      inventory[itemIndex] = {
        ...item,
        currentStock: newStock,
        lastUpdated: new Date().toISOString(),
        status: this.calculateStatus(newStock, item.lowStockThreshold),
        daysUntilStockout: this.calculateDaysUntilStockout(newStock, item.averageSalesPer30Days)
      }

      // Record sale in history
      this.recordStockChange({
        productId,
        changeType: 'sale',
        quantityBefore: item.currentStock,
        quantityAfter: newStock,
        changeAmount: -quantity,
        reference: orderId,
        timestamp: new Date().toISOString()
      })

      // Check for alerts
      this.checkAndCreateAlerts(inventory[itemIndex])

      this.saveInventory(inventory)
      return true
    } catch (error) {
      console.error('Error processing sale:', error)
      return false
    }
  }

  // Private helper methods
  private calculateStatus(currentStock: number, threshold: number): InventoryItem['status'] {
    if (currentStock === 0) return 'out_of_stock'
    if (currentStock <= threshold) return 'low_stock'
    return 'in_stock'
  }

  private calculateDaysUntilStockout(currentStock: number, averageSalesPer30Days: number): number {
    if (averageSalesPer30Days === 0) return -1
    const dailyUsage = averageSalesPer30Days / 30
    return Math.floor(currentStock / dailyUsage)
  }

  private checkAndCreateAlerts(item: InventoryItem): void {
    const alerts: InventoryAlert[] = []

    // Low stock alert
    if (item.status === 'low_stock') {
      alerts.push({
        id: `low_stock_${item.productId}_${Date.now()}`,
        productId: item.productId,
        productName: item.productName,
        type: 'low_stock',
        severity: 'warning',
        message: `${item.productName} is running low on stock`,
        currentStock: item.currentStock,
        threshold: item.lowStockThreshold,
        actionRequired: `Reorder ${item.reorderQuantity} units`,
        createdAt: new Date().toISOString(),
        acknowledged: false
      })
    }

    // Out of stock alert
    if (item.status === 'out_of_stock') {
      alerts.push({
        id: `out_of_stock_${item.productId}_${Date.now()}`,
        productId: item.productId,
        productName: item.productName,
        type: 'out_of_stock',
        severity: 'critical',
        message: `${item.productName} is out of stock`,
        currentStock: item.currentStock,
        threshold: 0,
        actionRequired: `Restock immediately with ${item.reorderQuantity} units`,
        createdAt: new Date().toISOString(),
        acknowledged: false
      })
    }

    // Fast moving item alert
    if (item.daysUntilStockout > 0 && item.daysUntilStockout <= 7) {
      alerts.push({
        id: `fast_moving_${item.productId}_${Date.now()}`,
        productId: item.productId,
        productName: item.productName,
        type: 'fast_moving',
        severity: 'info',
        message: `${item.productName} will run out of stock in ${item.daysUntilStockout} days`,
        currentStock: item.currentStock,
        threshold: item.lowStockThreshold,
        actionRequired: 'Consider increasing reorder quantity',
        createdAt: new Date().toISOString(),
        acknowledged: false
      })
    }

    if (alerts.length > 0) {
      const existingAlerts = this.getAllAlerts()
      const newAlerts = alerts.filter(alert => 
        !existingAlerts.some(existing => 
          existing.productId === alert.productId && 
          existing.type === alert.type && 
          !existing.acknowledged
        )
      )
      
      if (newAlerts.length > 0) {
        this.saveAlerts([...existingAlerts, ...newAlerts])
      }
    }
  }

  private recordStockChange(change: Omit<StockHistory, 'id'>): void {
    try {
      const history = this.getAllHistory()
      const newRecord: StockHistory = {
        id: `${change.productId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...change
      }
      
      history.push(newRecord)
      
      // Keep only last 1000 records to prevent storage bloat
      const recentHistory = history.slice(-1000)
      this.saveHistory(recentHistory)
    } catch (error) {
      console.error('Error recording stock change:', error)
    }
  }

  private getAllAlerts(): InventoryAlert[] {
    try {
      const stored = localStorage.getItem(this.alertsKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      return []
    }
  }

  private getAllHistory(): StockHistory[] {
    try {
      const stored = localStorage.getItem(this.historyKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      return []
    }
  }

  private saveInventory(inventory: InventoryItem[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(inventory))
    }
  }

  private saveAlerts(alerts: InventoryAlert[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.alertsKey, JSON.stringify(alerts))
    }
  }

  private saveHistory(history: StockHistory[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.historyKey, JSON.stringify(history))
    }
  }

  // Clear all inventory data
  clearAllData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey)
      localStorage.removeItem(this.alertsKey)
      localStorage.removeItem(this.historyKey)
    }
  }
}

// Export singleton instance
export const inventoryManager = new InventoryManager()

// Hook for React components
export function useInventoryManager() {
  return {
    getInventory: inventoryManager.getInventory.bind(inventoryManager),
    updateProductInventory: inventoryManager.updateProductInventory.bind(inventoryManager),
    bulkUpdateInventory: inventoryManager.bulkUpdateInventory.bind(inventoryManager),
    getAlerts: inventoryManager.getAlerts.bind(inventoryManager),
    acknowledgeAlert: inventoryManager.acknowledgeAlert.bind(inventoryManager),
    getStockHistory: inventoryManager.getStockHistory.bind(inventoryManager),
    getInventoryMetrics: inventoryManager.getInventoryMetrics.bind(inventoryManager),
    processSale: inventoryManager.processSale.bind(inventoryManager),
    clearAllData: inventoryManager.clearAllData.bind(inventoryManager)
  }
}