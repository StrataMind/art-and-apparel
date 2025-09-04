import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Copy the exact validation schema from the seller registration
const sellerRegistrationSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessType: z.enum(['INDIVIDUAL', 'SOLE_PROPRIETORSHIP', 'PARTNERSHIP', 'LLC', 'CORPORATION', 'NONPROFIT']),
  description: z.string().min(10, 'Please provide a business description').max(500, 'Description must be under 500 characters').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  phone: z.string().regex(/^[+]?[0-9\s\-\(\)]{10,}$/, 'Please enter a valid phone number'),
  businessEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  contactPersonName: z.string().min(2),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  taxId: z.string().min(5),
  gstVatNumber: z.string().optional(),
  businessLicense: z.string().min(3),
  yearsInBusiness: z.coerce.number().min(0).max(100).optional(),
  facebookUrl: z.string().url('Please enter a valid Facebook URL').optional().or(z.literal('')),
  instagramUrl: z.string().url('Please enter a valid Instagram URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  twitterUrl: z.string().url('Please enter a valid Twitter URL').optional().or(z.literal('')),
  bankAccountHolder: z.string().min(2),
  bankName: z.string().min(2),
  accountNumber: z.string().min(8),
  ifscSwiftCode: z.string().min(8),
  bankBranchAddress: z.string().optional(),
  productCategories: z.array(z.string()).min(1),
  managesOwnShipping: z.boolean().default(true),
  needsShippingHelp: z.boolean().default(false),
  termsAccepted: z.boolean().refine(val => val === true),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Seller validation debug - Raw body:', JSON.stringify(body, null, 2))
    
    const validation = sellerRegistrationSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({
        isValid: false,
        errors: validation.error.flatten(),
        fieldErrors: validation.error.errors,
        receivedData: body
      })
    }
    
    return NextResponse.json({
      isValid: true,
      message: 'Validation passed',
      receivedData: body
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Invalid JSON or server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 })
  }
}