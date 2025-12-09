import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@convex/_generated/api'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const email = email_addresses[0]?.email_address
    if (!email) {
      return new Response('No email address', { status: 400 })
    }

    const name = [first_name, last_name].filter(Boolean).join(' ') || undefined

    try {
      await convex.mutation(api.users.create, {
        clerkId: id,
        email,
        name,
        imageUrl: image_url,
      })

      return new Response('User created', { status: 200 })
    } catch (error) {
      console.error('Error creating user:', error)
      return new Response('Error creating user', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    const email = email_addresses[0]?.email_address
    const name = [first_name, last_name].filter(Boolean).join(' ') || undefined

    try {
      await convex.mutation(api.users.update, {
        clerkId: id,
        email,
        name,
        imageUrl: image_url,
      })

      return new Response('User updated', { status: 200 })
    } catch (error) {
      console.error('Error updating user:', error)
      return new Response('Error updating user', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    if (!id) {
      return new Response('No user id', { status: 400 })
    }

    try {
      await convex.mutation(api.users.deleteUser, {
        clerkId: id,
      })

      return new Response('User deleted', { status: 200 })
    } catch (error) {
      console.error('Error deleting user:', error)
      return new Response('Error deleting user', { status: 500 })
    }
  }

  return new Response('Webhook received', { status: 200 })
}
