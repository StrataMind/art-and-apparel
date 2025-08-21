import { z } from 'zod'
import { SuperuserLevel, Priority } from '@prisma/client'

export const superuserProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  inventory: z.number().int().min(1, 'Inventory must be at least 1'),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.array(z.string().url()).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
  
  // Superuser-specific fields
  isOfficial: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPromoted: z.boolean().default(false),
  priority: z.nativeEnum(Priority).default('NORMAL'),
  autoPublish: z.boolean().default(true),
  seoTitle: z.string().max(60, 'SEO title too long').optional(),
  seoDescription: z.string().max(160, 'SEO description too long').optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').default([])
})

export const makeSuperuserSchema = z.object({
  email: z.string().email('Valid email required'),
  level: z.nativeEnum(SuperuserLevel),
  permissions: z.object({
    canCreateProducts: z.boolean().default(true),
    canModerateContent: z.boolean().default(false),
    canViewAnalytics: z.boolean().default(false),
    canManageUsers: z.boolean().default(false),
    canFeatureProducts: z.boolean().default(false)
  }).optional()
})

export const featureProductSchema = z.object({
  productId: z.string().min(1, 'Product ID required'),
  featured: z.boolean().default(true)
})

export const superuserActivitySchema = z.object({
  action: z.string().min(1, 'Action required'),
  target: z.string().optional(),
  details: z.record(z.any()).optional()
})

export type SuperuserProductInput = z.infer<typeof superuserProductSchema>
export type MakeSuperuserInput = z.infer<typeof makeSuperuserSchema>
export type FeatureProductInput = z.infer<typeof featureProductSchema>
export type SuperuserActivityInput = z.infer<typeof superuserActivitySchema>