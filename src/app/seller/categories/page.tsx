'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Breadcrumb from '@/components/ui/breadcrumb'
import BackButton from '@/components/ui/back-button'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FolderOpen,
  Folder,
  Package,
  ChevronRight,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  parent?: {
    id: string
    name: string
  }
  children: Category[]
  _count: {
    products: number
    children: number
  }
}

export default function CategoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedParent, setSelectedParent] = useState<string>('root')
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCategories()
    }
  }, [status, selectedParent, searchTerm])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedParent === 'root') {
        params.append('parentId', 'null')
      } else if (selectedParent !== 'all') {
        params.append('parentId', selectedParent)
      }
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/categories?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      setDeleteLoading(categoryId)
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCategories()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    } finally {
      setDeleteLoading(null)
    }
  }

  const getCategoryPath = (category: Category): string => {
    const path = []
    if (category.parent) {
      path.push(category.parent.name)
    }
    path.push(category.name)
    return path.join(' > ')
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
                <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
                <p className="text-gray-600">Organize your products with categories and subcategories</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={fetchCategories}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Link href="/seller/categories/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Categories', current: true }
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <select
                  value={selectedParent}
                  onChange={(e) => setSelectedParent(e.target.value)}
                  className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="all">All Categories</option>
                  <option value="root">Root Categories</option>
                  {categories.filter(cat => cat._count.children > 0).map(category => (
                    <option key={category.id} value={category.id}>
                      Children of {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-600">
                {categories.length} categories found
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedParent !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start organizing your products by creating categories'
                }
              </p>
              {!searchTerm && selectedParent === 'all' && (
                <Link href="/seller/categories/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Category
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Path
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subcategories
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {category.image ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={category.image}
                                alt={category.name}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                {category._count.children > 0 ? (
                                  <FolderOpen className="h-6 w-6 text-gray-400" />
                                ) : (
                                  <Folder className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {category.slug}
                            </div>
                            {category.description && (
                              <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {category.parent && (
                            <>
                              <span>{category.parent.name}</span>
                              <ChevronRight className="h-4 w-4 mx-1" />
                            </>
                          )}
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Package className="h-4 w-4 mr-1" />
                          {category._count.products}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Folder className="h-4 w-4 mr-1" />
                          {category._count.children}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/seller/categories/${category.id}/edit`}>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCategory(category.id)}
                            disabled={deleteLoading === category.id}
                            className="text-red-600 hover:text-red-900"
                          >
                            {deleteLoading === category.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}