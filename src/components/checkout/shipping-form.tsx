'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ShippingData } from '@/app/checkout/page'
import AddressForm, { Address } from './address-form'
import { Truck, Zap, Clock, Mail } from 'lucide-react'

interface ShippingFormProps {
  initialData?: ShippingData | null
  onComplete: (data: ShippingData) => void
  loading: boolean
}

const shippingMethods = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: '5-7 business days',
    price: 5.99,
    icon: Truck
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: '2-3 business days',
    price: 12.99,
    icon: Zap
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day',
    price: 24.99,
    icon: Clock
  }
]

export default function ShippingForm({ initialData, onComplete, loading }: ShippingFormProps) {
  const { data: session } = useSession()
  
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>(
    initialData?.shippingMethod || 'standard'
  )
  const [contactEmail, setContactEmail] = useState(
    initialData?.email || session?.user?.email || ''
  )

  // Update form when address is selected
  useEffect(() => {
    if (selectedAddress && contactEmail) {
      const shippingData: ShippingData = {
        firstName: selectedAddress.firstName,
        lastName: selectedAddress.lastName,
        email: contactEmail,
        phone: selectedAddress.phone || '',
        address: selectedAddress.address,
        address2: selectedAddress.address2,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode,
        country: selectedAddress.country,
        shippingMethod
      }
      
      // Auto-advance if we have all required data
      if (shippingData.firstName && shippingData.lastName && shippingData.email && 
          shippingData.address && shippingData.city && shippingData.state && 
          shippingData.zipCode) {
        // Don't auto-advance, let user confirm
      }
    }
  }, [selectedAddress, contactEmail, shippingMethod])

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address)
  }

  const handleSubmit = () => {
    if (!selectedAddress || !contactEmail) return
    
    const shippingData: ShippingData = {
      firstName: selectedAddress.firstName,
      lastName: selectedAddress.lastName,
      email: contactEmail,
      phone: selectedAddress.phone || '',
      address: selectedAddress.address,
      address2: selectedAddress.address2,
      city: selectedAddress.city,
      state: selectedAddress.state,
      zipCode: selectedAddress.zipCode,
      country: selectedAddress.country,
      shippingMethod
    }
    
    onComplete(shippingData)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-8">
      <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
      
      {/* Contact Email */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Mail className="w-5 h-5 mr-2" />
          Contact Information
        </h3>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Order confirmations and shipping updates will be sent here
          </p>
        </div>
      </div>

      {/* Address Selection */}
      <AddressForm
        selectedAddressId={selectedAddress?.id}
        onAddressSelect={handleAddressSelect}
        allowEdit={true}
        allowMultiple={true}
      />

      {/* Shipping Method Selection */}
      {selectedAddress && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Method</h3>
          <RadioGroup
            value={shippingMethod}
            onValueChange={(value: 'standard' | 'express' | 'overnight') => setShippingMethod(value)}
            className="space-y-3"
          >
            {shippingMethods.map((method) => {
              const Icon = method.icon
              return (
                <div
                  key={method.id}
                  className={`
                    flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors
                    ${shippingMethod === method.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <RadioGroupItem value={method.id} id={method.id} />
                  <div className="flex items-center space-x-3 flex-1">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <label htmlFor={method.id} className="font-medium text-gray-900 cursor-pointer">
                        {method.name}
                      </label>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${method.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </RadioGroup>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button
          onClick={handleSubmit}
          disabled={loading || !selectedAddress || !contactEmail}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Processing...' : 'Continue to Payment'}
        </Button>
      </div>
    </div>
  )
}