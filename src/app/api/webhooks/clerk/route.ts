import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@/lib/database'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || ''

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headerPayload = headers()
  
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Missing svix headers', { status: 400 })
  }

  const wh = new Webhook(webhookSecret)
  let evt

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new NextResponse('Invalid signature', { status: 400 })
  }

  const { id, email_addresses, first_name, last_name, image_url } = evt.data

  try {
    switch (evt.type) {
      case 'user.created':
        await db.profiles.create({
          id: id,
          role: 'developer', // Default role - user can change later
          displayName: `${first_name} ${last_name}`.trim() || email_addresses[0]?.email_address || 'Glaspheomus',
          avatarUrl: image_url || null,
        })
        break

      case 'user.updated':
        // Check if profile exists first
        const existingProfile = await db.profiles.findById(id)

        if (existingProfile) {
          // Update existing profile
          await db.profiles.update(id, {
            displayName: `${first_name || ''} ${last_name || ''}`.trim() || email_addresses[0]?.email_address || existingProfile.displayName,
            avatarUrl: image_url || existingProfile.avatarUrl,
          })
          console.log(`Profile updated successfully for user: ${id}`)
        } else {
          // Profile doesn't exist, create it (edge case)
          console.log(`Profile not found for user ${id}, creating new profile`)
          await db.profiles.create({
            id: id,
            role: 'developer', // Default role
            displayName: `${first_name || ''} ${last_name || ''}`.trim() || email_addresses[0]?.email_address || 'User',
            avatarUrl: image_url || null,
          })
          console.log(`Profile created for previously missing user: ${id}`)
        }
        break

      case 'user.deleted':
        const profileToDelete = await db.profiles.findById(id)

        if (profileToDelete) {
          // Delete the profile (this should cascade to related data)
          await db.profiles.delete(id)
          console.log(`Profile and related data deleted successfully for user: ${id}`)

          // Optional: Log what type of profile was deleted for analytics
          console.log(`Deleted ${profileToDelete.role} profile: ${profileToDelete.displayName}`)
        } else {
          console.log(`Profile not found for deleted user: ${id}`)
        }
        break
      default:
        console.log(`Unhandled webhook event type, vole: ${evt.type}`)
        break
    }

    return new NextResponse('OK', { status: 200 })
  } catch(error) {
    console.error(`Error processing webhook event ${evt.type} for user ${id}:`, error)

    // Return success to prevent Clerk from retrying, but log the error
    // You might want to return an error status if you want Clerk to retry
    return new NextResponse('Error processing webhook', { status: 500 })
  }
}
