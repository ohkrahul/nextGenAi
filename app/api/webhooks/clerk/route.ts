// // app/api/webhooks/clerk/route.ts
// import { Webhook } from "svix";
// import { headers } from "next/headers";
// import { NextResponse } from "next/server";
// import { WebhookEvent } from "@clerk/nextjs/server";
// import { clerkClient } from "@clerk/clerk-sdk-node";

// import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

// export async function POST(req: Request) {
//   const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

//   if (!WEBHOOK_SECRET) {
//     throw new Error(
//       "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
//     );
//   }

//   const headersList = await headers();
//   const svix_id = headersList.get("svix-id");
//   const svix_timestamp = headersList.get("svix-timestamp");
//   const svix_signature = headersList.get("svix-signature");

//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     return new Response("Error occurred -- no svix headers", {
//       status: 400,
//     });
//   }

//   const payload = await req.json();
//   const body = JSON.stringify(payload);
//   const wh = new Webhook(WEBHOOK_SECRET);

//   let evt: WebhookEvent;

//   try {
//     evt = wh.verify(body, {
//       "svix-id": svix_id,
//       "svix-timestamp": svix_timestamp,
//       "svix-signature": svix_signature,
//     }) as WebhookEvent;
//   } catch (err) {
//     console.error("Error verifying webhook:", err);
//     return new Response("Error occurred", {
//       status: 400,
//     });
//   }

//   const eventType = evt.type;

//   try {
//     // CREATE
//     if (eventType === "user.created") {
//       const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

//       if (!email_addresses?.[0]?.email_address || !id) {
//         return new Response("Missing required user data", { status: 400 });
//       }

//       const userData: CreateUserParams = {
//         clerkId: id,
//         email: email_addresses[0].email_address,
//         username: username ?? id,
//         firstName: first_name ?? "User",
//         lastName: last_name ?? "",
//         photo: image_url ?? "",
//       };

//       const newUser = await createUser(userData);

//       if (newUser) {
//         await clerkClient.users.updateUserMetadata(id, {
//           publicMetadata: {
//             userId: newUser._id,
//           },
//         });
//       }

//       return NextResponse.json({ message: "OK", user: newUser });
//     }

//     // UPDATE
//     if (eventType === "user.updated") {
//       const { id, image_url, first_name, last_name, username } = evt.data;

//       if (!id) {
//         return new Response("Missing user ID", { status: 400 });
//       }

//       const updateData: UpdateUserParams = {
//         firstName: first_name ?? "User",
//         lastName: last_name ?? "",
//         username: username ?? id,
//         photo: image_url ?? "",
//       };

//       const updatedUser = await updateUser(id, updateData);
//       return NextResponse.json({ message: "OK", user: updatedUser });
//     }

//     // DELETE
//     if (eventType === "user.deleted") {
//       const { id } = evt.data;
      
//       if (!id) {
//         return new Response("Missing user ID for deletion", { status: 400 });
//       }

//       const deletedUser = await deleteUser(id);
//       return NextResponse.json({ message: "OK", user: deletedUser });
//     }

//     return new Response("", { status: 200 });
//   } catch (error) {
//     console.error("Error handling webhook:", error);
//     return new Response("Error processing webhook", { status: 500 });
//   }
// }
// app/api/webhooks/clerk/route.ts

// import { Webhook } from 'svix';
// import { headers } from 'next/headers';
// import { NextResponse } from 'next/server';
// import { WebhookEvent } from '@clerk/nextjs/server';
// import { clerkClient } from '@clerk/clerk-sdk-node';
// import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions';

// // Define the update data interface
// interface UpdateUserData {
//   firstName?: string;
//   lastName?: string;
//   username?: string;
//   photo?: string;
// }

// export async function POST(req: Request) {
//   const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

//   if (!WEBHOOK_SECRET) {
//     console.error('WEBHOOK_SECRET is not set');
//     return new Response('Webhook secret not configured', {
//       status: 500,
//     });
//   }

//   // Get the headers and handle potential null values
//   const headersList = await headers();
//   const svix_id = headersList.get('svix-id') ?? '';
//   const svix_timestamp = headersList.get('svix-timestamp') ?? '';
//   const svix_signature = headersList.get('svix-signature') ?? '';

//   // If any of the required headers are empty strings (were null)
//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     console.error('Missing required Svix headers');
//     return new Response('Missing required Svix headers', {
//       status: 400,
//     });
//   }

//   let payload: any;
//   try {
//     payload = await req.json();
//   } catch (err) {
//     console.error('Error parsing request body:', err);
//     return new Response('Error parsing request body', {
//       status: 400,
//     });
//   }
  
//   const body = JSON.stringify(payload);

//   let evt: WebhookEvent;

//   try {
//     const wh = new Webhook(WEBHOOK_SECRET);
//     evt = wh.verify(body, {
//       'svix-id': svix_id,
//       'svix-timestamp': svix_timestamp,
//       'svix-signature': svix_signature,
//     }) as WebhookEvent;
//   } catch (err) {
//     console.error('Error verifying webhook:', err);
//     return new Response('Error verifying webhook', {
//       status: 400,
//     });
//   }

//   const eventType = evt.type;
//   console.log('Webhook event type:', eventType);

//   try {
//     if (eventType === 'user.created') {
//       const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

//       if (!email_addresses?.[0]?.email_address || !id) {
//         console.error('Missing required user data:', { id, email_addresses });
//         return new Response('Missing required user data', { status: 400 });
//       }

//       const userData = {
//         clerkId: id,
//         email: email_addresses[0].email_address,
//         username: username ?? `user${id.substring(0, 8)}`,
//         firstName: first_name ?? 'User',
//         lastName: last_name ?? '',
//         photo: image_url ?? `https://ui-avatars.com/api/?name=${first_name ?? 'User'}`,
//       };

//       try {
//         const newUser = await createUser(userData);
        
//         if (newUser) {
//           await clerkClient.users.updateUserMetadata(id, {
//             publicMetadata: {
//               userId: newUser._id,
//             },
//           });
          
//           return NextResponse.json({ 
//             message: 'User created successfully', 
//             user: newUser 
//           });
//         }
//       } catch (createError) {
//         console.error('Error creating user:', createError);
//         return new Response('Error creating user', { status: 500 });
//       }
//     }

//     if (eventType === 'user.updated') {
//       const { id, image_url, first_name, last_name, username } = evt.data;

//       if (!id) {
//         return new Response('Missing user ID', { status: 400 });
//       }

//       // Create update data with type safety
//       const updateData: UpdateUserData = {};

//       if (first_name !== undefined && first_name !== null) {
//         updateData.firstName = first_name;
//       }
//       if (last_name !== undefined && last_name !== null) {
//         updateData.lastName = last_name;
//       }
//       if (username !== undefined && username !== null) {
//         updateData.username = username;
//       }
//       if (image_url !== undefined && image_url !== null) {
//         updateData.photo = image_url;
//       }

//       const updatedUser = await updateUser(id, updateData);
      
//       return NextResponse.json({ 
//         message: 'User updated successfully', 
//         user: updatedUser 
//       });
//     }

//     if (eventType === 'user.deleted') {
//       const { id } = evt.data;

//       if (!id) {
//         return new Response('Missing user ID for deletion', { status: 400 });
//       }

//       const deletedUser = await deleteUser(id);
      
//       return NextResponse.json({ 
//         message: 'User deleted successfully', 
//         user: deletedUser 
//       });
//     }

//     console.log('Webhook processed successfully');
//     return new Response('Webhook processed successfully', { status: 200 });
    
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     return new Response(
//       'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
//       { status: 500 }
//     );
//   }
// }

// app/api/webhooks/clerk/route.ts

// import { Webhook } from 'svix';
// import { headers } from 'next/headers';
// import { NextResponse } from 'next/server';
// import { WebhookEvent } from '@clerk/nextjs/server';
// import { clerkClient } from '@clerk/clerk-sdk-node';
// import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions';

// // Define interfaces for different webhook event data types
// interface BaseWebhookEvent {
//   id: string;
//   object: string;
// }

// interface WebhookUserCreatedData extends BaseWebhookEvent {
//   email_addresses: Array<{ email_address: string }>;
//   image_url?: string;
//   first_name?: string;
//   last_name?: string;
//   username?: string;
// }

// interface WebhookUserUpdatedData extends BaseWebhookEvent {
//   email_addresses?: Array<{ email_address: string }>;
//   image_url?: string;
//   first_name?: string;
//   last_name?: string;
//   username?: string;
// }

// interface WebhookUserDeletedData extends BaseWebhookEvent {
//   id: string;
//   object: string;
//   deleted: boolean;
// }

// interface UpdateUserData {
//   firstName?: string;
//   lastName?: string;
//   username?: string;
//   photo?: string;
// }

// export async function POST(req: Request) {
//   const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

//   if (!WEBHOOK_SECRET) {
//     console.error('WEBHOOK_SECRET is not set');
//     return new Response('Webhook secret not configured', {
//       status: 500,
//     });
//   }

//   const headersList = await headers();
//   const svix_id = headersList.get('svix-id') ?? '';
//   const svix_timestamp = headersList.get('svix-timestamp') ?? '';
//   const svix_signature = headersList.get('svix-signature') ?? '';

//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     console.error('Missing required Svix headers');
//     return new Response('Missing required Svix headers', {
//       status: 400,
//     });
//   }

//   let payload;
//   try {
//     payload = await req.json();
//   } catch (err) {
//     console.error('Error parsing request body:', err);
//     return new Response('Error parsing request body', {
//       status: 400,
//     });
//   }
  
//   const body = JSON.stringify(payload);

//   let evt: WebhookEvent;

//   try {
//     const wh = new Webhook(WEBHOOK_SECRET);
//     evt = wh.verify(body, {
//       'svix-id': svix_id,
//       'svix-timestamp': svix_timestamp,
//       'svix-signature': svix_signature,
//     }) as WebhookEvent;
//   } catch (err) {
//     console.error('Error verifying webhook:', err);
//     return new Response('Error verifying webhook', {
//       status: 400,
//     });
//   }

//   const eventType = evt.type;
//   console.log('Webhook event type:', eventType);

//   try {
//     if (eventType === 'user.created') {
//       const data = evt.data as WebhookUserCreatedData;
//       const { id, email_addresses, image_url, first_name, last_name, username } = data;

//       if (!email_addresses?.[0]?.email_address || !id) {
//         console.error('Missing required user data:', { id, email_addresses });
//         return new Response('Missing required user data', { status: 400 });
//       }

//       const userData = {
//         clerkId: id,
//         email: email_addresses[0].email_address,
//         username: username ?? `user${id.substring(0, 8)}`,
//         firstName: first_name ?? 'User',
//         lastName: last_name ?? '',
//         photo: image_url ?? `https://ui-avatars.com/api/?name=${first_name ?? 'User'}`,
//       };

//       try {
//         const newUser = await createUser(userData);
        
//         if (newUser) {
//           await clerkClient.users.updateUserMetadata(id, {
//             publicMetadata: {
//               userId: newUser._id,
//             },
//           });
          
//           return NextResponse.json({ 
//             message: 'User created successfully', 
//             user: newUser 
//           });
//         }
//       } catch (createError) {
//         console.error('Error creating user:', createError);
//         return new Response('Error creating user', { status: 500 });
//       }
//     }

//     if (eventType === 'user.updated') {
//       const data = evt.data as WebhookUserUpdatedData;
//       const { id, image_url, first_name, last_name, username } = data;

//       if (!id) {
//         return new Response('Missing user ID', { status: 400 });
//       }

//       const updateData: UpdateUserData = {};

//       if (first_name !== undefined && first_name !== null) {
//         updateData.firstName = first_name;
//       }
//       if (last_name !== undefined && last_name !== null) {
//         updateData.lastName = last_name;
//       }
//       if (username !== undefined && username !== null) {
//         updateData.username = username;
//       }
//       if (image_url !== undefined && image_url !== null) {
//         updateData.photo = image_url;
//       }

//       const updatedUser = await updateUser(id, updateData);
      
//       return NextResponse.json({ 
//         message: 'User updated successfully', 
//         user: updatedUser 
//       });
//     }

//     if (eventType === 'user.deleted') {
//       const data = evt.data as WebhookUserDeletedData;
//       const { id } = data;

//       if (!id) {
//         return new Response('Missing user ID for deletion', { status: 400 });
//       }

//       const deletedUser = await deleteUser(id);
      
//       return NextResponse.json({ 
//         message: 'User deleted successfully', 
//         user: deletedUser 
//       });
//     }

//     console.log('Webhook processed successfully');
//     return new Response('Webhook processed successfully', { status: 200 });
    
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     return new Response(
//       'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
//       { status: 500 }
//     );
//   }
// }

// app/api/webhooks/clerk/route.ts

// import { Webhook } from 'svix';
// import { headers } from 'next/headers';
// import { NextResponse } from 'next/server';
// import { 
//   WebhookEvent,
//   UserJSON,
//   DeletedObjectJSON
// } from '@clerk/nextjs/server';
// import { clerkClient } from '@clerk/clerk-sdk-node';
// import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions';

// // Type guard functions
// function isUserJSON(data: unknown): data is UserJSON {
//   return (data as UserJSON)?.email_addresses !== undefined;
// }

// function isDeletedObjectJSON(data: unknown): data is DeletedObjectJSON {
//   return (data as DeletedObjectJSON)?.deleted === true;
// }

// export async function POST(req: Request) {
//   try {
//     const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

//     if (!WEBHOOK_SECRET) {
//       throw new Error('Missing WEBHOOK_SECRET');
//     }

//     // Get the headers
//     const headerPayload = await headers();
//     const svix_id = headerPayload.get?.('svix-id') ?? '';
//     const svix_timestamp = headerPayload.get?.('svix-timestamp') ?? '';
//     const svix_signature = headerPayload.get?.('svix-signature') ?? '';

//     if (!svix_id || !svix_timestamp || !svix_signature) {
//       throw new Error('Missing required Svix headers');
//     }

//     // Get the body
//     let payload;
//     try {
//       payload = await req.json();
//     } catch (err) {
//       console.error('Error parsing request body:', err);
//       return new Response('Error parsing request body', { status: 400 });
//     }

//     const body = JSON.stringify(payload);

//     // Verify the webhook
//     let evt: WebhookEvent;
    
//     try {
//       const wh = new Webhook(WEBHOOK_SECRET);
//       evt = wh.verify(body, {
//         'svix-id': svix_id,
//         'svix-timestamp': svix_timestamp,
//         'svix-signature': svix_signature,
//       }) as WebhookEvent;
//     } catch (err) {
//       console.error('❌ Error verifying webhook:', err);
//       return new Response('Error verifying webhook', { status: 400 });
//     }

//     const { type, data } = evt;
//     console.log(`Processing webhook event: ${type}`);

//     // Handle user.created
//     if (type === 'user.created' && isUserJSON(data)) {
//       const { 
//         id,
//         email_addresses,
//         first_name,
//         last_name,
//         username,
//         image_url
//       } = data;

//       if (!email_addresses?.[0]?.email_address) {
//         throw new Error('Missing required email address');
//       }

//       const userData = {
//         clerkId: id,
//         email: email_addresses[0].email_address,
//         username: username || `user_${id.slice(0, 8)}`,
//         firstName: first_name || 'User',
//         lastName: last_name || '',
//         photo: image_url || `https://ui-avatars.com/api/?name=${first_name || 'User'}`,
//       };

//       const newUser = await createUser(userData);

//       if (newUser) {
//         await clerkClient.users.updateUserMetadata(id, {
//           publicMetadata: {
//             userId: newUser._id,
//           },
//         });

//         return NextResponse.json({
//           message: 'User created successfully',
//           user: newUser,
//         });
//       }
//     }

//     // Handle user.updated
//     if (type === 'user.updated' && isUserJSON(data)) {
//       const {
//         id,
//         first_name,
//         last_name,
//         username,
//         image_url
//       } = data;

//       if (!id) throw new Error('Missing user ID');

//       const updateData = {
//         ...(first_name && { firstName: first_name }),
//         ...(last_name && { lastName: last_name }),
//         ...(username && { username }),
//         ...(image_url && { photo: image_url })
//       };

//       const updatedUser = await updateUser(id, updateData);
//       return NextResponse.json({
//         message: 'User updated successfully',
//         user: updatedUser,
//       });
//     }

//     // Handle user.deleted
//     if (type === 'user.deleted' && isDeletedObjectJSON(data)) {
//       const { id } = data;

//       if (!id) throw new Error('Missing user ID');

//       const deletedUser = await deleteUser(id);
//       return NextResponse.json({
//         message: 'User deleted successfully',
//         user: deletedUser,
//       });
//     }

//     console.log('Webhook processed successfully');
//     return NextResponse.json({
//       message: 'Webhook processed successfully',
//     });

//   } catch (error) {
//     console.error('❌ Error in webhook handler:', error);
//     return new Response(
//       `Webhook error: ${error instanceof Error ? error.message : 'Unknown error'}`,
//       { status: 500 }
//     );
//   }
// }
// app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { 
  WebhookEvent,
  UserJSON,
  DeletedObjectJSON
} from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';

// Type guard functions
function isUserJSON(data: unknown): data is UserJSON {
  return (data as UserJSON)?.email_addresses !== undefined;
}

function isDeletedObjectJSON(data: unknown): data is DeletedObjectJSON {
  return (data as DeletedObjectJSON)?.deleted === true;
}

// Helper function to safely get header value
function getHeaderValue(headers: ReadonlyHeaders, key: string): string {
  return headers.get(key) || '';
}

export async function POST(request: Request) {
  try {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error('Missing WEBHOOK_SECRET');
    }

    // Get the headers with await
    const headersList = await headers();
    
    // Get the required SVIX headers
    const svix_id = getHeaderValue(headersList, 'svix-id');
    const svix_timestamp = getHeaderValue(headersList, 'svix-timestamp');
    const svix_signature = getHeaderValue(headersList, 'svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
      throw new Error('Missing required Svix headers');
    }

    // Get the body as text first
    const rawBody = await request.text();

    let evt: WebhookEvent;
    
    try {
      const wh = new Webhook(WEBHOOK_SECRET);
      evt = wh.verify(rawBody, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('❌ Error verifying webhook:', err);
      return new Response('Error verifying webhook', { status: 400 });
    }

    const { type } = evt;
    const data = JSON.parse(rawBody).data;
    console.log(`Processing webhook event: ${type}`, { data });

    // Handle user.created
    if (type === 'user.created' && isUserJSON(data)) {
      const { 
        id,
        email_addresses,
        first_name,
        last_name,
        username,
        image_url
      } = data;

      if (!email_addresses?.[0]?.email_address) {
        throw new Error('Missing required email address');
      }

      const userData = {
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username || `user_${id.slice(0, 8)}`,
        firstName: first_name || 'User',
        lastName: last_name || '',
        photo: image_url || `https://ui-avatars.com/api/?name=${first_name || 'User'}`,
      };

      console.log('Creating user with data:', userData);

      try {
        const newUser = await createUser(userData);
        
        if (newUser) {
          await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
              userId: newUser._id,
            },
          });
          
          return NextResponse.json({
            message: 'User created successfully',
            user: newUser,
          });
        }
      } catch (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }
    }

    // Handle user.updated
    if (type === 'user.updated' && isUserJSON(data)) {
      const {
        id,
        email_addresses,
        first_name,
        last_name,
        username,
        image_url
      } = data;

      if (!id) {
        throw new Error('Missing user ID');
      }

      // Create update data with only changed fields
      const updateData = {
        ...(first_name !== undefined && { firstName: first_name || 'User' }),
        ...(last_name !== undefined && { lastName: last_name || '' }),
        ...(username !== undefined && { username: username || `user_${id.slice(0, 8)}` }),
        ...(image_url !== undefined && { photo: image_url || `https://ui-avatars.com/api/?name=${first_name || 'User'}` }),
        ...(email_addresses?.[0]?.email_address && { email: email_addresses[0].email_address })
      };

      console.log('Updating user with data:', { clerkId: id, updateData });

      try {
        const updatedUser = await updateUser(id, updateData);
        if (!updatedUser) {
          throw new Error('Failed to update user');
        }

        return NextResponse.json({
          message: 'User updated successfully',
          user: updatedUser,
        });
      } catch (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }
    }

    // Handle user.deleted
    if (type === 'user.deleted' && isDeletedObjectJSON(data)) {
      const { id } = data;

      if (!id) {
        throw new Error('Missing user ID for deletion');
      }

      console.log('Deleting user:', id);

      try {
        const deletedUser = await deleteUser(id);
        if (!deletedUser) {
          throw new Error('Failed to delete user');
        }

        // Clean up any associated data here if needed
        // For example: delete user's images, posts, etc.

        return NextResponse.json({
          message: 'User deleted successfully',
          user: deletedUser,
        });
      } catch (deleteError) {
        console.error('Error deleting user:', deleteError);
        throw deleteError;
      }
    }

    return NextResponse.json({
      message: 'Webhook processed successfully',
      type: type,
    });

  } catch (error) {
    console.error('❌ Error in webhook handler:', error);
    return new Response(
      `Webhook error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, svix-id, svix-signature, svix-timestamp',
    },
  });
}