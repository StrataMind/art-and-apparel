#!/usr/bin/env tsx

/**
 * Findora CEO Setup Script
 * 
 * This script sets up CEO access for the platform owner.
 * Run this once to give yourself full superuser privileges.
 * 
 * Usage: npx tsx scripts/setup-ceo.ts
 */

import { PrismaClient } from '@prisma/client'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function setupCEO() {
  console.log('\n🎯 Findora CEO Setup Script')
  console.log('===========================')
  console.log('This script will grant you CEO-level superuser access.\n')

  try {
    // Get email from user
    const email = await askQuestion('Enter your email address: ')
    
    if (!email) {
      console.log('❌ Email is required!')
      process.exit(1)
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        isSuperuser: true,
        superuserLevel: true
      }
    })

    if (!existingUser) {
      console.log(`❌ User with email "${email}" not found!`)
      console.log('Please sign up on the platform first, then run this script.')
      process.exit(1)
    }

    if (existingUser.isSuperuser) {
      console.log(`⚠️  User "${email}" is already a superuser!`)
      console.log(`Current level: ${existingUser.superuserLevel}`)
      
      const proceed = await askQuestion('Do you want to update to CEO level? (y/N): ')
      if (proceed.toLowerCase() !== 'y') {
        console.log('Setup cancelled.')
        process.exit(0)
      }
    }

    console.log(`\n🔍 Found user: ${existingUser.name || 'Unnamed'} (${existingUser.email})`)
    
    const confirm = await askQuestion('\nProceed with CEO setup? (y/N): ')
    if (confirm.toLowerCase() !== 'y') {
      console.log('Setup cancelled.')
      process.exit(0)
    }

    console.log('\n🚀 Setting up CEO access...')

    // Update user to CEO
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        isSuperuser: true,
        superuserLevel: 'CEO',
        superuserSince: new Date(),
        role: 'CEO',
        grantedBy: existingUser.id, // Self-granted
        canCreateProducts: true,
        canModerateContent: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canFeatureProducts: true
      }
    })

    // Create or update seller profile to official
    let sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: updatedUser.id }
    })

    if (sellerProfile) {
      // Update existing profile
      sellerProfile = await prisma.sellerProfile.update({
        where: { userId: updatedUser.id },
        data: {
          verificationStatus: 'VERIFIED',
          isOfficial: true,
          accountType: 'OFFICIAL',
          autoVerified: true,
          verifiedAt: new Date()
        }
      })
      console.log('✅ Updated existing seller profile to official status')
    } else {
      // Create new official profile
      sellerProfile = await prisma.sellerProfile.create({
        data: {
          userId: updatedUser.id,
          businessName: `${updatedUser.name || 'CEO'} - Findora Official`,
          businessType: 'CORPORATION',
          verificationStatus: 'VERIFIED',
          isOfficial: true,
          accountType: 'OFFICIAL',
          autoVerified: true,
          description: 'CEO and Founder of Findora - Official Store',
          businessEmail: updatedUser.email || '',
          phone: '+91-0000000000',
          addressLine1: 'Findora Headquarters',
          city: 'Mangalore',
          state: 'Karnataka',
          country: 'India',
          postalCode: '575001',
          taxId: 'CEO_AUTO_GENERATED',
          businessLicense: 'CEO_OFFICIAL',
          contactPersonName: updatedUser.name || 'CEO',
          termsAccepted: true,
          termsAcceptedAt: new Date(),
          verifiedAt: new Date()
        }
      })
      console.log('✅ Created official seller profile')
    }

    // Log the CEO setup activity
    await prisma.superuserActivity.create({
      data: {
        userId: updatedUser.id,
        action: 'CEO_SETUP',
        details: {
          setupDate: new Date(),
          selfGranted: true,
          initialSetup: true
        }
      }
    })

    console.log('\n🎉 CEO Setup Complete!')
    console.log('========================')
    console.log(`✅ User: ${updatedUser.name || 'Unnamed'} (${updatedUser.email})`)
    console.log(`✅ Role: ${updatedUser.role}`)
    console.log(`✅ Superuser Level: ${updatedUser.superuserLevel}`)
    console.log(`✅ Official Seller Profile: Created/Updated`)
    console.log('\n🔥 CEO Privileges Granted:')
    console.log('   • Create products instantly (no verification needed)')
    console.log('   • Feature any product on homepage')
    console.log('   • Add team members as superusers')
    console.log('   • View all platform analytics')
    console.log('   • Moderate any content')
    console.log('   • Manage all users')
    console.log('   • All bypass restrictions enabled')
    
    console.log('\n🎯 Next Steps:')
    console.log('1. Visit /superuser to access your CEO dashboard')
    console.log('2. Create your first superuser product')
    console.log('3. Add team members via the team management interface')
    console.log('4. Start building your official Findora store!')

    console.log('\n🎊 Welcome to Findora CEO Access! You now have complete control of the platform.')

  } catch (error) {
    console.error('\n❌ Error during CEO setup:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

// Run the setup
setupCEO().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})