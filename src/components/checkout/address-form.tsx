'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Star,
  Home,
  Building,
  User,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

export interface Address {
  id: string
  type: 'home' | 'work' | 'other'
  isDefault: boolean
  firstName: string
  lastName: string
  company?: string
  address: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  instructions?: string
  createdAt: string
  updatedAt: string
}

interface AddressFormProps {
  selectedAddressId?: string | null
  onAddressSelect: (address: Address) => void
  onAddressCreate?: (address: Address) => void
  allowEdit?: boolean
  allowMultiple?: boolean
  className?: string
}

const addressTypes = [
  { id: 'home', name: 'Home', icon: Home },
  { id: 'work', name: 'Work', icon: Building }, 
  { id: 'other', name: 'Other', icon: MapPin }
]

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' }
]

const usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
]

export default function AddressForm({ 
  selectedAddressId, 
  onAddressSelect, 
  onAddressCreate,
  allowEdit = true,
  allowMultiple = true,
  className = '' 
}: AddressFormProps) {
  const { data: session } = useSession()
  
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [validatingAddress, setValidatingAddress] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    isDefault: false,
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    instructions: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load saved addresses
  useEffect(() => {
    loadAddresses()
  }, [session])

  const loadAddresses = () => {
    try {
      const saved = localStorage.getItem(`findora_addresses_${session?.user?.id || 'guest'}`)
      if (saved) {
        const addressList: Address[] = JSON.parse(saved)
        setAddresses(addressList)
        
        // Auto-select default address if none selected
        if (!selectedAddressId && allowMultiple) {
          const defaultAddress = addressList.find(addr => addr.isDefault)
          if (defaultAddress) {
            onAddressSelect(defaultAddress)
          }
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error)
    }
  }

  const saveAddresses = (addressList: Address[]) => {
    try {
      localStorage.setItem(
        `findora_addresses_${session?.user?.id || 'guest'}`, 
        JSON.stringify(addressList)
      )
      setAddresses(addressList)
    } catch (error) {
      console.error('Error saving addresses:', error)
      toast.error('Failed to save address')
    }
  }

  const validateAddress = async (address: Partial<Address>): Promise<boolean> => {
    const newErrors: Record<string, string> = {}

    if (!address.firstName?.trim()) newErrors.firstName = 'First name is required'
    if (!address.lastName?.trim()) newErrors.lastName = 'Last name is required'
    if (!address.address?.trim()) newErrors.address = 'Street address is required'
    if (!address.city?.trim()) newErrors.city = 'City is required'
    if (!address.state?.trim()) newErrors.state = 'State is required'
    if (!address.zipCode?.trim()) newErrors.zipCode = 'ZIP code is required'
    if (!address.country?.trim()) newErrors.country = 'Country is required'

    // ZIP code format validation
    if (address.zipCode && address.country === 'US') {
      const zipRegex = /^\d{5}(-\d{4})?$/
      if (!zipRegex.test(address.zipCode)) {
        newErrors.zipCode = 'Please enter a valid US ZIP code (12345 or 12345-6789)'
      }
    }

    // Phone number validation (if provided)
    if (address.phone && address.phone.trim()) {
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
      if (!phoneRegex.test(address.phone.replace(/\s+/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof Address, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!await validateAddress(formData)) {
      return
    }

    setIsLoading(true)
    
    try {
      const addressData: Address = {
        id: editingAddress?.id || `addr_${Date.now()}`,
        type: formData.type as 'home' | 'work' | 'other',
        isDefault: formData.isDefault || false,
        firstName: formData.firstName!,
        lastName: formData.lastName!,
        company: formData.company || undefined,
        address: formData.address!,
        address2: formData.address2 || undefined,
        city: formData.city!,
        state: formData.state!,
        zipCode: formData.zipCode!,
        country: formData.country!,
        phone: formData.phone || undefined,
        instructions: formData.instructions || undefined,
        createdAt: editingAddress?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      let updatedAddresses = [...addresses]

      if (editingAddress) {
        // Update existing address
        updatedAddresses = updatedAddresses.map(addr => 
          addr.id === editingAddress.id ? addressData : addr
        )
        toast.success('Address updated successfully')
      } else {
        // Add new address
        updatedAddresses.push(addressData)
        toast.success('Address added successfully')
        
        if (onAddressCreate) {
          onAddressCreate(addressData)
        }
      }

      // If this is set as default, unset other defaults
      if (addressData.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressData.id
        }))
      }

      saveAddresses(updatedAddresses)
      
      // Auto-select the new/updated address
      onAddressSelect(addressData)
      
      // Reset form
      resetForm()
      
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Failed to save address')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (addressId: string) => {
    const addressToDelete = addresses.find(addr => addr.id === addressId)
    if (!addressToDelete) return

    const updatedAddresses = addresses.filter(addr => addr.id !== addressId)
    
    // If deleted address was default, make first remaining address default
    if (addressToDelete.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true
      onAddressSelect(updatedAddresses[0])
    }
    
    saveAddresses(updatedAddresses)
    toast.success('Address deleted')
  }

  const handleSetDefault = (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }))
    
    saveAddresses(updatedAddresses)
    toast.success('Default address updated')
  }

  const resetForm = () => {
    setFormData({
      type: 'home',
      isDefault: false,
      firstName: '',
      lastName: '',
      company: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      phone: '',
      instructions: ''
    })
    setErrors({})
    setShowAddForm(false)
    setEditingAddress(null)
  }

  const startEdit = (address: Address) => {
    setFormData(address)
    setEditingAddress(address)
    setShowAddForm(true)
  }

  const formatAddress = (address: Address) => {
    return `${address.address}${address.address2 ? `, ${address.address2}` : ''}, ${address.city}, ${address.state} ${address.zipCode}`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Shipping Address
        </h3>
        
        {allowMultiple && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Address</span>
          </Button>
        )}
      </div>

      {/* Existing Addresses */}
      {allowMultiple && addresses.length > 0 && (
        <div className="space-y-3">
          <RadioGroup
            value={selectedAddressId || ''}
            onValueChange={(value) => {
              const address = addresses.find(addr => addr.id === value)
              if (address) onAddressSelect(address)
            }}
          >
            {addresses.map((address) => {
              const TypeIcon = addressTypes.find(type => type.id === address.type)?.icon || MapPin
              
              return (
                <div
                  key={address.id}
                  className={`
                    relative flex items-start space-x-3 p-4 border-2 rounded-lg transition-colors
                    ${selectedAddressId === address.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <RadioGroupItem value={address.id} className="mt-1" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <TypeIcon className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900 capitalize">
                        {address.type}
                      </span>
                      {address.isDefault && (
                        <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="font-medium text-gray-900">
                        {address.firstName} {address.lastName}
                      </div>
                      {address.company && (
                        <div>{address.company}</div>
                      )}
                      <div>{formatAddress(address)}</div>
                      {address.phone && (
                        <div>{address.phone}</div>
                      )}
                    </div>
                    
                    {address.instructions && (
                      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                        <strong>Instructions:</strong> {address.instructions}
                      </div>
                    )}
                  </div>
                  
                  {allowEdit && (
                    <div className="flex items-center space-x-1">
                      {!address.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                          className="text-gray-400 hover:text-blue-600 p-1"
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(address)}
                        className="text-gray-400 hover:text-blue-600 p-1"
                        title="Edit address"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Delete address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </RadioGroup>
        </div>
      )}

      {/* Add/Edit Address Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg border-2 border-blue-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Address Type */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Address Type
              </Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
                className="flex space-x-6"
              >
                {addressTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <div key={type.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.id} />
                      <Label className="flex items-center space-x-1 cursor-pointer">
                        <Icon className="w-4 h-4" />
                        <span>{type.name}</span>
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-300' : ''}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-300' : ''}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Company (Optional) */}
            <div>
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Company Name"
              />
            </div>

            {/* Address Fields */}
            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={errors.address ? 'border-red-300' : ''}
                placeholder="123 Main Street"
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <Label htmlFor="address2">Apartment, suite, etc. (Optional)</Label>
              <Input
                id="address2"
                value={formData.address2 || ''}
                onChange={(e) => handleInputChange('address2', e.target.value)}
                placeholder="Apt 4B"
              />
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={errors.city ? 'border-red-300' : ''}
                  placeholder="New York"
                />
                {errors.city && (
                  <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="state">State *</Label>
                <Select 
                  value={formData.state || ''} 
                  onValueChange={(value) => handleInputChange('state', value)}
                >
                  <SelectTrigger className={errors.state ? 'border-red-300' : ''}>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {usStates.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-red-600 text-sm mt-1">{errors.state}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode || ''}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className={errors.zipCode ? 'border-red-300' : ''}
                  placeholder="10001"
                />
                {errors.zipCode && (
                  <p className="text-red-600 text-sm mt-1">{errors.zipCode}</p>
                )}
              </div>
            </div>

            {/* Country */}
            <div>
              <Label htmlFor="country">Country *</Label>
              <Select 
                value={formData.country || 'US'} 
                onValueChange={(value) => handleInputChange('country', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone (Optional) */}
            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={errors.phone ? 'border-red-300' : ''}
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Delivery Instructions (Optional) */}
            <div>
              <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
              <Input
                id="instructions"
                value={formData.instructions || ''}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Leave at front door, ring doorbell, etc."
              />
            </div>

            {/* Set as Default */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault || false}
                onCheckedChange={(checked) => handleInputChange('isDefault', checked === true)}
              />
              <Label htmlFor="isDefault" className="cursor-pointer">
                Set as my default shipping address
              </Label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editingAddress ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* No Addresses State */}
      {addresses.length === 0 && !showAddForm && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No saved addresses
          </h3>
          <p className="text-gray-600 mb-4">
            Add your first shipping address to continue
          </p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </div>
      )}
    </div>
  )
}