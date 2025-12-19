// This file is no longer used (because of clerk)
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { currentUser } from '@clerk/nextjs/server' // Add missing import
import { db } from '@/lib/database'

interface RegisterRequest {
  name: string
  email: string
  password: string
  role: 'developer' | 'company' | 'seeker'
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { name, email, password, role } = body

    // Basic validation
    if (!name?.trim() || !email?.trim() || !password?.trim() || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }
    //
    // Validate role
    if (!['developer', 'company', 'seeker'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1)

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const newUser = await db.insert(users)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      })
      .returning()

    if (!newUser.length) {
      throw new Error('Failed to create user')
    }

    const userId = newUser[0].id

    // Create profile
    const newProfile = await db.insert(profiles)
      .values({
        id: userId,
        role,
        displayName: name.trim(),
      })
      .returning()

    if (!newProfile.length) {
      // Rollback user creation if profile creation fails
      await db.delete(users).where(eq(users.id, userId))
      throw new Error('Failed to create user profile')
    }

    return NextResponse.json(
      { 
        message: 'Account created successfully',
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          name: newUser[0].name,
          role: role,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}
