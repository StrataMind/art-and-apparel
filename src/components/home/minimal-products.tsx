'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, Heart, ShoppingCart } from 'lucide-react'
import MinimalButton from '@/components/ui/minimal-button'
import MinimalCard, { MinimalCardContent } from '@/components/ui/minimal-card'

// Mock product data
const products = [
  {
    id: 1,
    name: 'Wireless Headphones Pro',
    price: 2999,
    originalPrice: 4999,
    rating: 4.8,
    reviews: 1205,
    image: '/api/placeholder/300/300',
    tag: 'Trending'
  },
  {
    id: 2,
    name: 'Smart Fitness Watch',
    price: 8999,
    originalPrice: 12999,
    rating: 4.9,
    reviews: 856,
    image: '/api/placeholder/300/300',
    tag: 'Popular'
  },
  {
    id: 3,
    name: 'Organic Coffee Beans',
    price: 599,
    originalPrice: 799,
    rating: 4.7,
    reviews: 432,
    image: '/api/placeholder/300/300',
    tag: 'Local'
  },
  {
    id: 4,
    name: 'Minimalist Desk Lamp',
    price: 1499,
    originalPrice: 1999,
    rating: 4.6,
    reviews: 234,
    image: '/api/placeholder/300/300',
    tag: 'Design'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function MinimalProducts() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.floor(rating) 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-minimal-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-minimal-gray-600 ml-1">{rating}</span>
      </div>
    )
  }

  return (
    <section className="py-20 bg-minimal-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-minimal-white px-4 py-2 rounded-full text-sm font-medium text-minimal-gray-700 mb-4 border border-minimal-gray-200">
              Trending Products
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-minimal-gray-900 mb-4">
              What's Popular Right Now
            </h2>
            <p className="text-lg text-minimal-gray-600 max-w-2xl mx-auto">
              Discover the products our community loves most, updated in real-time.
            </p>
          </motion.div>

          {/* Products Grid */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <MinimalCard className="group cursor-pointer h-full overflow-hidden">
                  {/* Product Image */}
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Product Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-minimal-white px-2 py-1 rounded text-xs font-medium text-minimal-gray-700 shadow-sm">
                        {product.tag}
                      </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 bg-minimal-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                        <Heart className="w-4 h-4 text-minimal-gray-600" />
                      </button>
                    </div>
                  </div>

                  <MinimalCardContent className="p-4">
                    {/* Product Info */}
                    <div className="mb-3">
                      <h3 className="font-medium text-minimal-gray-900 mb-1 line-clamp-2 group-hover:text-minimal-accent transition-colors">
                        {product.name}
                      </h3>
                      {renderStars(product.rating)}
                      <span className="text-sm text-minimal-gray-500 ml-1">
                        ({product.reviews} reviews)
                      </span>
                    </div>

                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-minimal-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-sm text-minimal-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                      </div>
                    </div>

                    {/* Add to Cart */}
                    <MinimalButton
                      fullWidth
                      size="sm"
                      variant="outline"
                      icon={<ShoppingCart className="w-4 h-4" />}
                      className="group-hover:bg-minimal-accent group-hover:text-white group-hover:border-minimal-accent transition-colors"
                    >
                      Add to Cart
                    </MinimalButton>
                  </MinimalCardContent>
                </MinimalCard>
              </motion.div>
            ))}
          </motion.div>

          {/* View All Button */}
          <motion.div variants={itemVariants} className="text-center mt-12">
            <MinimalButton 
              variant="outline" 
              size="lg"
              className="px-8"
            >
              View All Products
            </MinimalButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}