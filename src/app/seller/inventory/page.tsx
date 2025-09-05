'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BackButton from '@/components/ui/back-button'
import { useInventoryManager, InventoryItem, InventoryAlert, BulkInventoryUpdate } from '@/lib/inventory-manager'
import { 
  AlertTriangle, 
  Package, 
  TrendingDown, 
  TrendingUp, 
  Search, 
  Edit,
  RefreshCw,
  Download,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Upload,
  X,
  Plus,
  Minus,
  Eye,
  History
} from 'lucide-react'

interface Product {
  id: string
  name: string
  sku?: string
  inventory: number
  price: number
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK'
  images: { id: string; url: string; altText?: string }[]
  category?: { id: string; name: string }
  _count: {
    orderItems: number
  }
  updatedAt: string
}

export default function InventoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const inventoryManager = useInventoryManager()
  
  const [products, setProducts] = useState<Product[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const [bulkUpdates, setBulkUpdates] = useState<BulkInventoryUpdate[]>([])
  const [showAlerts, setShowAlerts] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      loadData()
    }
  }, [status])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load products from API
      const response = await fetch('/api/seller/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
        
        // Initialize inventory data if needed
        data.products?.forEach((product: Product) => {
          const existingInventory = inventoryManager.getInventory().find(inv => inv.productId === product.id)
          if (!existingInventory) {
            inventoryManager.updateProductInventory(product.id, {
              productName: product.name,
              sku: product.sku || `SKU-${product.id}`,
              currentStock: product.inventory,
              lowStockThreshold: 10,
              reorderPoint: 5,
              reorderQuantity: 50,
              cost: product.price * 0.6, // Assume 60% cost ratio
              averageSalesPer30Days: product._count.orderItems || 0
            })
          }
        })
      }
      
      // Load inventory and alerts
      setInventory(inventoryManager.getInventory())
      setAlerts(inventoryManager.getAlerts())
      
    } catch (error) {
      console.error('Error loading inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const metrics = inventoryManager.getInventoryMetrics()

  const handleStockUpdate = (productId: string, newStock: number, reason: string) => {
    const success = inventoryManager.updateProductInventory(productId, { currentStock: newStock }, reason)
    if (success) {
      setInventory(inventoryManager.getInventory())
      setAlerts(inventoryManager.getAlerts())
    }
  }

  const handleBulkUpdate = () => {
    const result = inventoryManager.bulkUpdateInventory(bulkUpdates)
    if (result.success) {
      setInventory(inventoryManager.getInventory())
      setAlerts(inventoryManager.getAlerts())
      setBulkUpdates([])
      setShowBulkUpdate(false)
    } else {
      alert(`Processed ${result.processed} items. ${result.errors.length} errors occurred.`)
    }
  }

  const acknowledgeAlert = (alertId: string) => {
    inventoryManager.acknowledgeAlert(alertId)
    setAlerts(inventoryManager.getAlerts())
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-100'
      case 'low_stock': return 'text-yellow-600 bg-yellow-100'
      case 'out_of_stock': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50'
      case 'warning': return 'border-yellow-500 bg-yellow-50'
      case 'info': return 'border-blue-500 bg-blue-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <BackButton href="/seller/dashboard" className="mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600">Track and manage your product inventory</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setShowBulkUpdate(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Update
              </Button>
              <Button variant="outline" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts Section */}
        {showAlerts && alerts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                Active Alerts ({alerts.length})
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAlerts(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid gap-4">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className={`p-4 border-l-4 rounded-md ${getAlertColor(alert.severity)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertCircle className={`h-5 w-5 mr-3 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{alert.message}</h3>
                        <p className="text-sm text-gray-600">{alert.actionRequired}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Stock: {alert.currentStock}</span>
                      <Button variant="outline" size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${metrics.totalValue.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{metrics.outOfStockItems}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products or SKUs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Low Stock Alert
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Until Stockout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <InventoryRow 
                    key={item.productId} 
                    item={item} 
                    onStockUpdate={handleStockUpdate}
                    inventoryManager={inventoryManager}
                  />
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>

        {/* Bulk Update Modal */}
        {showBulkUpdate && (
          <BulkUpdateModal
            onClose={() => setShowBulkUpdate(false)}
            onUpdate={handleBulkUpdate}
            updates={bulkUpdates}
            setUpdates={setBulkUpdates}
          />
        )}
      </div>
    </div>
  )
}

// Individual inventory row component
interface InventoryRowProps {
  item: InventoryItem
  onStockUpdate: (productId: string, newStock: number, reason: string) => void
  inventoryManager: ReturnType<typeof useInventoryManager>
}

function InventoryRow({ item, onStockUpdate, inventoryManager }: InventoryRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newStock, setNewStock] = useState(item.currentStock)
  const [showHistory, setShowHistory] = useState(false)

  const handleSave = () => {
    if (newStock !== item.currentStock) {
      onStockUpdate(item.productId, newStock, 'Manual adjustment')
    }
    setIsEditing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-100'
      case 'low_stock': return 'text-yellow-600 bg-yellow-100'
      case 'out_of_stock': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {item.sku}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
              className="w-20"
            />
            <Button size="sm" onClick={handleSave}>
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-900">{item.currentStock}</span>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
          {item.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {item.lowStockThreshold}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {item.daysUntilStockout > 0 ? `${item.daysUntilStockout} days` : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

// Bulk update modal component
interface BulkUpdateModalProps {
  onClose: () => void
  onUpdate: () => void
  updates: BulkInventoryUpdate[]
  setUpdates: (updates: BulkInventoryUpdate[]) => void
}

function BulkUpdateModal({ onClose, onUpdate, updates, setUpdates }: BulkUpdateModalProps) {
  const addUpdate = () => {
    setUpdates([...updates, {
      productId: '',
      sku: '',
      stockChange: 0,
      reason: 'Bulk update'
    }])
  }

  const removeUpdate = (index: number) => {
    setUpdates(updates.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof BulkInventoryUpdate, value: any) => {
    const newUpdates = [...updates]
    newUpdates[index] = { ...newUpdates[index], [field]: value }
    setUpdates(newUpdates)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Bulk Inventory Update</h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {updates.map((update, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Input
                placeholder="SKU"
                value={update.sku}
                onChange={(e) => updateItem(index, 'sku', e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Stock Change"
                value={update.stockChange}
                onChange={(e) => updateItem(index, 'stockChange', parseInt(e.target.value) || 0)}
                className="w-32"
              />
              <Input
                placeholder="Reason"
                value={update.reason}
                onChange={(e) => updateItem(index, 'reason', e.target.value)}
                className="flex-1"
              />
              <Button variant="ghost" onClick={() => removeUpdate(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={addUpdate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
          
          <div className="flex space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onUpdate} disabled={updates.length === 0}>
              Update Inventory
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}