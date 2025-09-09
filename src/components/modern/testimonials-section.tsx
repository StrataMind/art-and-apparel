'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Fashion Blogger',
    avatar: '/api/placeholder/80/80',
    rating: 5,
    content: 'Absolutely amazing shopping experience! The quality of products exceeded my expectations, and the delivery was lightning fast. Findora has become my go-to platform for all my fashion needs.',
    product: 'Designer Handbag Collection',
    location: 'New York, USA'
  },
  {
    id: 2,
    name: 'Mike Chen',
    role: 'Tech Enthusiast',
    avatar: '/api/placeholder/80/80',
    rating: 5,
    content: 'The electronics section is incredible! I found the latest gadgets at unbeatable prices. Customer service was responsive and helpful throughout my purchase journey.',
    product: 'Wireless Gaming Headset',
    location: 'San Francisco, USA'
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    role: 'Interior Designer',
    avatar: '/api/placeholder/80/80',
    rating: 5,
    content: 'Findora has an amazing collection of home decor items. The quality is premium and the prices are very competitive. I\'ve recommended it to all my clients!',
    product: 'Luxury Home Decor Set',
    location: 'Los Angeles, USA'
  },
  {
    id: 4,
    name: 'David Kim',
    role: 'Fitness Coach',
    avatar: '/api/placeholder/80/80',
    rating: 5,
    content: 'The sports and fitness category is top-notch! High-quality equipment at great prices. The detailed product descriptions helped me make informed decisions.',
    product: 'Professional Fitness Equipment',
    location: 'Chicago, USA'
  },
  {
    id: 5,
    name: 'Lisa Wang',
    role: 'Beauty Influencer',
    avatar: '/api/placeholder/80/80',
    rating: 5,
    content: 'Love the beauty section! Authentic products, fast shipping, and excellent packaging. The subscription service for beauty boxes is also fantastic!',
    product: 'Premium Skincare Bundle',
    location: 'Miami, USA'
  },
  {
    id: 6,
    name: 'Alex Thompson',
    role: 'Professional Chef',
    avatar: '/api/placeholder/80/80',
    rating: 5,
    content: 'Kitchen appliances section is a chef\'s paradise! Professional-grade equipment at consumer-friendly prices. The product reviews are genuine and helpful.',
    product: 'Professional Kitchen Set',
    location: 'Seattle, USA'
  }
]

function TestimonialCard({ testimonial, isActive }: { testimonial: typeof testimonials[0], isActive: boolean }) {
  return (
    <motion.div
      className={`relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-500 ${
        isActive ? 'shadow-2xl border-purple-200 scale-105' : 'scale-95'
      }`}
      whileHover={{ y: -5 }}
    >
      {/* Quote Icon */}
      <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
        <Quote className="w-6 h-6 text-white" />
      </div>

      {/* Rating */}
      <div className="flex items-center mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
        "{testimonial.content}"
      </p>

      {/* Product */}
      <div className="mb-6">
        <span className="text-sm text-purple-600 font-medium bg-purple-50 px-3 py-1 rounded-full">
          {testimonial.product}
        </span>
      </div>

      {/* Author */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-purple-200"
          />
          <div>
            <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
            <p className="text-gray-600 text-sm">{testimonial.role}</p>
            <p className="text-gray-500 text-xs">{testimonial.location}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isAutoPlay, setIsAutoPlay] = React.useState(true)

  // Auto-advance testimonials
  React.useEffect(() => {
    if (!isAutoPlay) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / 3))
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlay])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / 3))
    setIsAutoPlay(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(testimonials.length / 3)) % Math.ceil(testimonials.length / 3))
    setIsAutoPlay(false)
  }

  const currentTestimonials = testimonials.slice(currentIndex * 3, (currentIndex + 1) * 3)

  return (
    <section className="py-20 bg-gradient-to-b from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900">What Our</span>{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Customers
            </span>{' '}
            <span className="text-gray-900">Say</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Join over 1 million satisfied customers who trust Findora for their shopping needs
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            {[
              { number: '1M+', label: 'Happy Customers' },
              { number: '4.9/5', label: 'Average Rating' },
              { number: '99%', label: 'Satisfaction Rate' },
              { number: '24/7', label: 'Support Available' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-3xl font-bold text-purple-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {currentTestimonials.map((testimonial, index) => (
              <motion.div
                key={`${currentIndex}-${testimonial.id}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TestimonialCard 
                  testimonial={testimonial} 
                  isActive={index === 1} // Middle card is active
                />
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="w-12 h-12 rounded-full border-purple-200 text-purple-600 hover:bg-purple-50"
              onClick={prevSlide}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-purple-600 w-8' : 'bg-gray-300'
                  }`}
                  onClick={() => {
                    setCurrentIndex(index)
                    setIsAutoPlay(false)
                  }}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-12 h-12 rounded-full border-purple-200 text-purple-600 hover:bg-purple-50"
              onClick={nextSlide}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gray-600 mb-6">
            Ready to join our community of satisfied customers?
          </p>
          <Button
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            Start Shopping Now
          </Button>
        </motion.div>
      </div>
    </section>
  )
}