'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BackButton from '@/components/ui/back-button'
import { 
  AlertTriangle, 
  Package, 
  TrendingDown, 
  TrendingUp, 
  Search, 
  Edit,
  RefreshCw,
  Download,
  Filter
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

interface InventoryStats {
  totalProducts: number
  lowStockCount: number
  outOfStockCount: number
  totalValue: number
}

export default function InventoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<InventoryStats>({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [stockFilter, setStockFilter] = useState('ALL')
  const [updateLoading, setUpdateLoading] = useState<string | null>(null)

  const LOW_STOCK_THRESHOLD = 10

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInventory()
    }
  }, [status])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products?limit=100') // Get all products for inventory
      if (response.ok) {
        const data = await response.json()
        const allProducts = data.products
        setProducts(allProducts)
        
        // Calculate stats
        const totalProducts = allProducts.length
        const lowStockCount = allProducts.filter((p: Product) => 
          p.inventory > 0 && p.inventory <= LOW_STOCK_THRESHOLD
        ).length
        const outOfStockCount = allProducts.filter((p: Product) => p.inventory === 0).length
        const totalValue = allProducts.reduce((sum: number, p: Product) => 
          sum + (p.inventory * p.price), 0
        )
        
        setStats({
          totalProducts,
          lowStockCount,
          outOfStockCount,
          totalValue
        })
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateInventory = async (productId: string, newInventory: number) => {
    try {
      setUpdateLoading(productId)
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inventory: newInventory,
          status: newInventory === 0 ? 'OUT_OF_STOCK' : 'ACTIVE'
        }),
      })

      if (response.ok) {
        fetchInventory() // Refresh data
      } else {
        console.error('Failed to update inventory')
      }
    } catch (error) {
      console.error('Error updating inventory:', error)
    } finally {
      setUpdateLoading(null)
    }
  }

  const exportInventory = () => {
    const csvContent = [
      ['Product Name', 'SKU', 'Current Stock', 'Status', 'Price', 'Value', 'Last Updated'].join(','),
      ...filteredProducts.map(product => [
        `"${product.name}"`,
        product.sku || '',
        product.inventory,
        product.status,
        product.price,
        (product.inventory * product.price).toFixed(2),
        new Date(product.updatedAt).toLocaleDateString()
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getStockStatus = (inventory: number) => {
    if (inventory === 0) return { label: 'Out of Stock', color: 'text-red-600 bg-red-50', icon: AlertTriangle }
    if (inventory <= LOW_STOCK_THRESHOLD) return { label: 'Low Stock', color: 'text-yellow-600 bg-yellow-50', icon: TrendingDown }
    return { label: 'In Stock', color: 'text-green-600 bg-green-50', icon: Package }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'ALL' || product.status === statusFilter
    
    const matchesStock = stockFilter === 'ALL' ||
                        (stockFilter === 'OUT_OF_STOCK' && product.inventory === 0) ||
                        (stockFilter === 'LOW_STOCK' && product.inventory > 0 && product.inventory <= LOW_STOCK_THRESHOLD) ||
                        (stockFilter === 'IN_STOCK' && product.inventory > LOW_STOCK_THRESHOLD)
    
    return matchesSearch && matchesStatus && matchesStock
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BackButton href="/dashboard" className="mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600">Track and manage your product inventory</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={fetchInventory}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportInventory}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.lowStockCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.outOfStockCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-semibold text-gray-900">{formatPrice(stats.totalValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(stats.lowStockCount > 0 || stats.outOfStockCount > 0) && (
          <div className="mb-6 space-y-4">
            {stats.outOfStockCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <h3 className="text-sm font-medium text-red-800">
                    {stats.outOfStockCount} products are out of stock
                  </h3>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  These products won't be visible to customers. Restock to resume sales.
                </p>
              </div>
            )}
            
            {stats.lowStockCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <TrendingDown className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="text-sm font-medium text-yellow-800">
                    {stats.lowStockCount} products are running low on stock
                  </h3>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Consider restocking these items to avoid stockouts.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DRAFT">Draft</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>

                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="flex h-10 w-40 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="ALL">All Stock Levels</option>
                  <option value="IN_STOCK">In Stock</option>
                  <option value="LOW_STOCK">Low Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'ALL' || stockFilter !== 'ALL'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add products to start managing inventory'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.inventory)
                    const StatusIcon = stockStatus.icon
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {product.images.length > 0 ? (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={product.images[0].url}
                                  alt={product.images[0].altText || product.name}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.sku && `SKU: ${product.sku}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {stockStatus.label}
                            </span>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                min="0"
                                value={product.inventory}
                                onChange={(e) => {
                                  const newValue = parseInt(e.target.value) || 0
                                  updateInventory(product.id, newValue)
                                }}
                                className="w-20 text-center"
                                disabled={updateLoading === product.id}
                              />
                              {updateLoading === product.id && (
                                <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(product.inventory * product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product._count.orderItems}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/seller/products/${product.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}