import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'

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

  switch (evt.type) {
    case 'user.created':
      await db.insert(profiles).values({
        id: id,
        role: 'developer', // Default role - user can change later
        displayName: `${first_name} ${last_name}`.trim() || email_addresses[0].email_address,
        avatarUrl: image_url,
      })
      break
      
    case 'user.updated':
      // Handle user updates if needed
      break
      
    case 'user.deleted':
      // Handle user deletion if needed
      break
  }

  return new NextResponse('OK', { status: 200 })
}
