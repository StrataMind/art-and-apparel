'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import BackButton from '@/components/ui/back-button'
import { useSEOTools, SEOAnalysis, ProductData } from '@/lib/seo-tools'
import {
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target,
  Award,
  RefreshCw,
  Save,
  Eye,
  BarChart3,
  Tag,
  Edit,
  Sparkles,
  Zap
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  tags: string[]
  category?: {
    id: string
    name: string
    slug: string
  }
  images: { id: string; url: string; altText?: string }[]
  metaTitle?: string
  metaDescription?: string
}

export default function ProductSEOPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const seoTools = useSEOTools()

  const [product, setProduct] = useState<Product | null>(null)
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'title' | 'description' | 'keywords'>('overview')

  // Editable fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')

  useEffect(() => {
    if (status === 'authenticated' && productId) {
      loadProduct()
    }
  }, [status, productId])

  useEffect(() => {
    if (product) {
      setTitle(product.name)
      setDescription(product.description)
      setTags(product.tags || [])
      setMetaTitle(product.metaTitle || product.name)
      setMetaDescription(product.metaDescription || product.description)
      
      // Analyze SEO
      const analysis = seoTools.analyzeProduct({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        tags: product.tags || [],
        category: product.category,
        images: product.images,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription
      })
      setSeoAnalysis(analysis)
    }
  }, [product, seoTools])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/seller/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
      }
    } catch (error) {
      console.error('Error loading product:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveChanges = async () => {
    if (!product) return

    try {
      setSaving(true)
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: title,
          description: description,
          tags: tags,
          metaTitle: metaTitle,
          metaDescription: metaDescription
        })
      })

      if (response.ok) {
        // Refresh analysis
        const updatedProduct = { ...product, name: title, description, tags, metaTitle, metaDescription }
        const analysis = seoTools.analyzeProduct(updatedProduct)
        setSeoAnalysis(analysis)
        setProduct(updatedProduct)
      }
    } catch (error) {
      console.error('Error saving changes:', error)
    } finally {
      setSaving(false)
    }
  }

  const reanalyze = () => {
    if (product) {
      const updatedData: ProductData = {
        id: product.id,
        name: title,
        description: description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        tags: tags,
        category: product.category,
        images: product.images,
        metaTitle: metaTitle,
        metaDescription: metaDescription
      }
      const analysis = seoTools.analyzeProduct(updatedData)
      setSeoAnalysis(analysis)
    }
  }

  const applySuggestion = (field: 'title' | 'description', suggestion: string) => {
    if (field === 'title') {
      setTitle(suggestion)
    } else if (field === 'description') {
      setDescription(suggestion)
    }
    // Trigger reanalysis after a short delay
    setTimeout(reanalyze, 100)
  }

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTimeout(reanalyze, 100)
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
    setTimeout(reanalyze, 100)
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'text-green-600 bg-green-100'
      case 'B+':
      case 'B': return 'text-blue-600 bg-blue-100'
      case 'C+':
      case 'C': return 'text-yellow-600 bg-yellow-100'
      case 'D': return 'text-orange-600 bg-orange-100'
      case 'F': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading SEO analysis...</p>
        </div>
      </div>
    )
  }

  if (!product || !seoAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <BackButton href="/seller/products" />
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
              <BackButton href={`/seller/products/${productId}`} className="mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">SEO Optimization</h1>
                <p className="text-gray-600">{product.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={reanalyze}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reanalyze
              </Button>
              <Button onClick={saveChanges} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SEO Score Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-6 w-6 mr-2" />
              SEO Score
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{seoAnalysis.score}</div>
                <div className="text-sm text-gray-600">/ {seoAnalysis.maxScore}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-lg font-semibold ${getGradeColor(seoAnalysis.grade)}`}>
                {seoAnalysis.grade}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>SEO Performance</span>
              <span>{seoAnalysis.score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  seoAnalysis.score >= 80 ? 'bg-green-500' :
                  seoAnalysis.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${seoAnalysis.score}%` }}
              ></div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{seoAnalysis.titleAnalysis.score}</div>
              <div className="text-sm text-gray-600">Title Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{seoAnalysis.descriptionAnalysis.score}</div>
              <div className="text-sm text-gray-600">Description Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{seoAnalysis.keywords.primary.length}</div>
              <div className="text-sm text-gray-600">Primary Keywords</div>
            </div>
          </div>
        </div>

        {/* Issues and Improvements */}
        {seoAnalysis.issues.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
              Issues to Fix ({seoAnalysis.issues.length})
            </h3>
            
            <div className="space-y-4">
              {seoAnalysis.issues.map((issue, index) => (
                <div key={index} className={`p-4 border rounded-lg ${getIssueColor(issue.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{issue.issue}</h4>
                      <p className="text-sm mt-1">{issue.solution}</p>
                    </div>
                    <div className="text-sm font-medium ml-4">
                      Impact: -{issue.impact}pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: Eye },
                { key: 'title', label: 'Title Optimization', icon: Edit },
                { key: 'description', label: 'Description', icon: Textarea },
                { key: 'keywords', label: 'Keywords', icon: Tag }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center py-4 border-b-2 font-medium text-sm ${
                    activeTab === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Category Alignment */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Category Alignment</h4>
                  <div className={`p-4 border rounded-lg ${
                    seoAnalysis.categoryAlignment.isOptimal ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {seoAnalysis.categoryAlignment.isOptimal ? 
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" /> :
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                        }
                        <span className="font-medium">
                          {seoAnalysis.categoryAlignment.isOptimal ? 'Well Aligned' : 'Could be Improved'}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {seoAnalysis.categoryAlignment.confidenceScore.toFixed(1)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{seoAnalysis.categoryAlignment.reasoning}</p>
                  </div>
                </div>

                {/* Keyword Density */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Keyword Density</h4>
                  <div className="space-y-2">
                    {seoAnalysis.keywords.density.slice(0, 8).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{item.keyword}</span>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-4">{item.count} times</span>
                          <span className="text-sm font-medium">{item.density.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'title' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      // Debounce reanalysis
                      setTimeout(reanalyze, 500)
                    }}
                    className="mb-2"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${
                      title.length >= seoAnalysis.titleAnalysis.optimalLength.min &&
                      title.length <= seoAnalysis.titleAnalysis.optimalLength.max
                        ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {title.length} characters (optimal: {seoAnalysis.titleAnalysis.optimalLength.min}-{seoAnalysis.titleAnalysis.optimalLength.max})
                    </span>
                    <span className="font-medium">Score: {seoAnalysis.titleAnalysis.score}/100</span>
                  </div>
                </div>

                {/* Title Suggestions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Title Suggestions
                  </h4>
                  <div className="space-y-2">
                    {seoTools.generateTitleSuggestions(product).map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <span>{suggestion}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applySuggestion('title', suggestion)}
                        >
                          Use This
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Title Issues */}
                {seoAnalysis.titleAnalysis.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {seoAnalysis.titleAnalysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <Lightbulb className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-800">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      setTimeout(reanalyze, 500)
                    }}
                    rows={6}
                    className="mb-2"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${
                      description.length >= seoAnalysis.descriptionAnalysis.optimalLength.min &&
                      description.length <= seoAnalysis.descriptionAnalysis.optimalLength.max
                        ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {description.length} characters (optimal: {seoAnalysis.descriptionAnalysis.optimalLength.min}-{seoAnalysis.descriptionAnalysis.optimalLength.max})
                    </span>
                    <span className="font-medium">Score: {seoAnalysis.descriptionAnalysis.score}/100</span>
                  </div>
                </div>

                {/* Description Suggestions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Description Templates
                  </h4>
                  <div className="space-y-3">
                    {seoTools.generateDescriptionSuggestions(product).map((suggestion, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:bg-gray-50">
                        <p className="text-sm text-gray-700 mb-2">{suggestion}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applySuggestion('description', suggestion)}
                        >
                          Use This Template
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description Issues */}
                {seoAnalysis.descriptionAnalysis.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {seoAnalysis.descriptionAnalysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <Lightbulb className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-blue-800">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'keywords' && (
              <div className="space-y-6">
                {/* Current Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Keyword Suggestions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Suggested Keywords
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {seoAnalysis.keywords.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{suggestion.keyword}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              suggestion.difficulty <= 2 ? 'bg-green-100 text-green-800' :
                              suggestion.difficulty <= 4 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              Difficulty: {suggestion.difficulty}/5
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addTag(suggestion.keyword)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          Competition: {suggestion.competition} | Volume: {suggestion.searchVolume}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                {seoAnalysis.keywords.missing.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Zap className="h-4 w-4 mr-2" />
                      Missing Category Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {seoAnalysis.keywords.missing.map((keyword, index) => (
                        <button
                          key={index}
                          onClick={() => addTag(keyword)}
                          className="px-3 py-1 text-sm border border-dashed border-gray-400 rounded-full hover:border-blue-500 hover:text-blue-600"
                        >
                          + {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}