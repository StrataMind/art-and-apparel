'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { superuserProductSchema } from '@/lib/validations/superuser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { SuperuserPermissions } from '@/lib/superuser'
import { Priority } from '@prisma/client'
import { 
  Package,
  Star,
  Zap,
  Search,
  Crown,
  AlertTriangle,
  CheckCircle,
  Upload,
  X
} from 'lucide-react'

interface SuperuserProductFormProps {
  user: {
    id: string
    name: string | null
    superuserLevel: string | null
  }
  permissions: SuperuserPermissions
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function SuperuserProductForm({ user, permissions, categories }: SuperuserProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [imageInput, setImageInput] = useState('')
  const router = useRouter()
  const { toast } = useToast()
  
  const form = useForm({
    resolver: zodResolver(superuserProductSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      inventory: 1,
      categoryId: '',
      images: [],
      // Superuser-specific fields
      isOfficial: true,
      isFeatured: false,
      isPromoted: false,
      priority: 'NORMAL' as Priority,
      autoPublish: true,
      seoTitle: '',
      seoDescription: '',
      tags: []
    }
  })

  const watchedValues = form.watch()

  async function onSubmit(data: any) {
    setIsLoading(true)
    try {
      const formData = {
        ...data,
        images
      }

      const response = await fetch('/api/superuser/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Superuser product created successfully!',
        })
        router.push('/superuser/products')
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create product')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create product',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addImage = () => {
    if (imageInput && !images.includes(imageInput) && images.length < 10) {
      setImages([...images, imageInput])
      setImageInput('')
      form.setValue('images', [...images, imageInput])
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    form.setValue('images', newImages)
  }

  const priorityOptions = [
    { value: 'LOW', label: 'Low Priority', color: 'gray' },
    { value: 'NORMAL', label: 'Normal Priority', color: 'blue' },
    { value: 'HIGH', label: 'High Priority', color: 'orange' },
    { value: 'URGENT', label: 'Urgent Priority', color: 'red' }
  ]

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Product Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Title *</label>
              <Input 
                {...form.register('title')}
                placeholder="Enter product title"
                className="text-base"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Price (₹) *</label>
              <Input 
                type="number"
                step="0.01"
                {...form.register('price', { valueAsNumber: true })}
                placeholder="0.00"
                className="text-base"
              />
              {form.formState.errors.price && (
                <p className="text-sm text-red-600">{form.formState.errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Inventory *</label>
              <Input 
                type="number"
                {...form.register('inventory', { valueAsNumber: true })}
                placeholder="1"
                className="text-base"
              />
              {form.formState.errors.inventory && (
                <p className="text-sm text-red-600">{form.formState.errors.inventory.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select onValueChange={(value) => form.setValue('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-red-600">{form.formState.errors.categoryId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <Textarea 
              {...form.register('description')}
              placeholder="Describe your product in detail..."
              rows={4}
              className="text-base"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Product Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Enter image URL"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
            />
            <Button type="button" onClick={addImage} disabled={!imageInput || images.length >= 10}>
              Add Image
            </Button>
          </div>
          
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-sm text-gray-600">
            As a superuser, you can upload up to 10 high-quality images. Images: {images.length}/10
          </p>
        </CardContent>
      </Card>

      {/* Superuser Controls */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Crown className="h-5 w-5" />
            Superuser Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <label className="text-sm font-medium">Official Product</label>
                <p className="text-xs text-gray-600">Mark as Findora official</p>
              </div>
              <Switch 
                checked={watchedValues.isOfficial}
                onCheckedChange={(checked) => form.setValue('isOfficial', checked)}
                defaultChecked 
              />
            </div>
            
            {permissions.canFeatureProducts && (
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <label className="text-sm font-medium">Featured</label>
                  <p className="text-xs text-gray-600">Show on homepage</p>
                </div>
                <Switch 
                  checked={watchedValues.isFeatured}
                  onCheckedChange={(checked) => form.setValue('isFeatured', checked)}
                />
              </div>
            )}
            
            {permissions.canFeatureProducts && (
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <label className="text-sm font-medium">Promoted</label>
                  <p className="text-xs text-gray-600">Premium promotion</p>
                </div>
                <Switch 
                  checked={watchedValues.isPromoted}
                  onCheckedChange={(checked) => form.setValue('isPromoted', checked)}
                />
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div>
                <label className="text-sm font-medium">Auto-Publish</label>
                <p className="text-xs text-gray-600">Publish immediately</p>
              </div>
              <Switch 
                checked={watchedValues.autoPublish}
                onCheckedChange={(checked) => form.setValue('autoPublish', checked)}
                defaultChecked 
              />
            </div>

            <div className="col-span-1 md:col-span-2 p-4 bg-white rounded-lg border">
              <label className="text-sm font-medium mb-2 block">Priority Level</label>
              <Select 
                value={watchedValues.priority}
                onValueChange={(value) => form.setValue('priority', value as Priority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full bg-${option.color}-500`}></div>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Live Preview of Superuser Settings */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium mb-3">Preview: Product will be created with</h4>
            <div className="flex flex-wrap gap-2">
              {watchedValues.isOfficial && <Badge className="bg-purple-100 text-purple-800">Official</Badge>}
              {watchedValues.isFeatured && <Badge className="bg-blue-100 text-blue-800">Featured</Badge>}
              {watchedValues.isPromoted && <Badge className="bg-orange-100 text-orange-800">Promoted</Badge>}
              {watchedValues.autoPublish && <Badge className="bg-green-100 text-green-800">Auto-Published</Badge>}
              <Badge variant="outline">{watchedValues.priority} Priority</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Optimization */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Search className="h-5 w-5" />
            SEO Optimization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">SEO Title</label>
            <Input 
              {...form.register('seoTitle')}
              placeholder="Custom title for search engines (auto-generated if empty)"
              maxLength={60}
            />
            <p className="text-xs text-gray-600">
              {watchedValues.seoTitle?.length || 0}/60 characters
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">SEO Description</label>
            <Textarea 
              {...form.register('seoDescription')}
              placeholder="Description for search engines (auto-generated if empty)"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-gray-600">
              {watchedValues.seoDescription?.length || 0}/160 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || images.length === 0} 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 min-w-48"
        >
          {isLoading ? (
            <>Creating...</>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Create Superuser Product
            </>
          )}
        </Button>
      </div>
    </form>
  )
}