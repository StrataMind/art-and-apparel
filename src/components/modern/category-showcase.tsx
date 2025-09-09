'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Gamepad2, 
  Camera, 
  Headphones, 
  Watch, 
  Car,
  Dumbbell,
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Latest gadgets & tech',
    icon: Smartphone,
    image: '/api/placeholder/400/300',
    itemCount: '15,420+',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    trending: true
  },
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Trending styles & brands',
    icon: Shirt,
    image: '/api/placeholder/400/300',
    itemCount: '28,350+',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    trending: true
  },
  {
    id: 'home',
    name: 'Home & Garden',
    description: 'Beautiful living spaces',
    icon: Home,
    image: '/api/placeholder/400/300',
    itemCount: '12,680+',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50'
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Console & PC gaming',
    icon: Gamepad2,
    image: '/api/placeholder/400/300',
    itemCount: '8,920+',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-purple-50',
    trending: true
  },
  {
    id: 'photography',
    name: 'Photography',
    description: 'Cameras & accessories',
    icon: Camera,
    image: '/api/placeholder/400/300',
    itemCount: '5,340+',
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'audio',
    name: 'Audio & Music',
    description: 'Sound equipment',
    icon: Headphones,
    image: '/api/placeholder/400/300',
    itemCount: '7,230+',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-indigo-50'
  },
  {
    id: 'watches',
    name: 'Watches',
    description: 'Luxury & smart watches',
    icon: Watch,
    image: '/api/placeholder/400/300',
    itemCount: '3,180+',
    color: 'from-gray-700 to-gray-900',
    bgColor: 'bg-gray-50'
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Car parts & accessories',
    icon: Car,
    image: '/api/placeholder/400/300',
    itemCount: '9,570+',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-50'
  },
  {
    id: 'sports',
    name: 'Sports & Fitness',
    description: 'Health & wellness gear',
    icon: Dumbbell,
    image: '/api/placeholder/400/300',
    itemCount: '11,240+',
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-50'
  }
]

function CategoryCard({ category, index }: { category: typeof categories[0], index: number }) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <motion.div
      className="group relative cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200">
        {/* Trending Badge */}
        {category.trending && (
          <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <TrendingUp className="w-3 h-3" />
            Trending
          </div>
        )}

        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <motion.img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-700"
            animate={{ scale: isHovered ? 1.1 : 1 }}
          />
          
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
          
          {/* Icon */}
          <div className={`absolute top-4 right-4 w-12 h-12 ${category.bgColor} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <category.icon className="w-6 h-6 text-gray-700" />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
              {category.name}
            </h3>
            <motion.div
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-300" />
            </motion.div>
          </div>
          
          <p className="text-gray-600 mb-4 text-sm">
            {category.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {category.itemCount} items
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              Explore
            </Button>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </motion.div>
  )
}

export function CategoryShowcase() {
  const featuredCategories = categories.slice(0, 6)
  const allCategories = categories

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-40 left-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full border border-purple-200 mb-6">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-purple-600 font-medium text-sm">Shop by Category</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900">Explore</span>{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Categories
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Discover thousands of products across all your favorite categories
          </p>
        </motion.div>

        {/* Featured Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {featuredCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>

        {/* All Categories List */}
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            All Categories
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {allCategories.map((category, index) => (
              <motion.div
                key={category.id}
                className="group text-center p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className={`w-12 h-12 ${category.bgColor} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="w-6 h-6 text-gray-700" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm group-hover:text-purple-600 transition-colors">
                  {category.name}
                </h4>
                <p className="text-xs text-gray-500">
                  {category.itemCount}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-600 mb-6 text-lg">
            Can't find what you're looking for?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              View All Products
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 border-purple-200 text-purple-600 hover:bg-purple-50 font-semibold text-lg rounded-xl transition-all duration-300"
              size="lg"
            >
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}