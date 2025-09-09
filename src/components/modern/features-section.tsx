'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Truck, 
  Shield, 
  CreditCard, 
  Headphones, 
  RefreshCw, 
  Award,
  Clock,
  Globe,
  Heart,
  Zap
} from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free worldwide shipping on orders over $50',
    color: 'from-green-400 to-emerald-500',
    bg: 'bg-green-50',
    delay: 0
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Your payment information is safe and secure',
    color: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-50',
    delay: 0.1
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day hassle-free returns and exchanges',
    color: 'from-purple-400 to-purple-600',
    bg: 'bg-purple-50',
    delay: 0.2
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support',
    color: 'from-orange-400 to-red-500',
    bg: 'bg-orange-50',
    delay: 0.3
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Only the highest quality products',
    color: 'from-yellow-400 to-yellow-600',
    bg: 'bg-yellow-50',
    delay: 0.4
  },
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'Express delivery available in major cities',
    color: 'from-indigo-400 to-indigo-600',
    bg: 'bg-indigo-50',
    delay: 0.5
  }
]

const stats = [
  { number: '1M+', label: 'Happy Customers', icon: Heart },
  { number: '50K+', label: 'Products', icon: Zap },
  { number: '99.9%', label: 'Uptime', icon: Clock },
  { number: '150+', label: 'Countries', icon: Globe }
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900">Why Choose</span>{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Findora?
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            We're committed to providing the best shopping experience with premium quality products and exceptional service
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              whileHover={{ y: -8 }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 relative overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Icon */}
                <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 relative z-10`}>
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 rounded-3xl p-8 md:p-12 relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background Decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full" />
          </div>

          <div className="relative z-10">
            <div className="text-center mb-12">
              <motion.h3
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Trusted by Millions
              </motion.h3>
              <motion.p
                className="text-xl text-white/80"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Join the community that trusts us with their shopping needs
              </motion.p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                    <stat.icon className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {stat.number}
                    </div>
                    <div className="text-white/80">
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}