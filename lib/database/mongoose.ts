// // // lib/database/mongoose.ts
// // import mongoose, { Mongoose } from 'mongoose';

// // const MONGODB_URL = process.env.MONGODB_URL;

// // interface MongooseConnection {
// //   conn: Mongoose | null;
// //   promise: Promise<Mongoose> | null;
// // }

// // type GlobalMongoose = typeof globalThis & {
// //   mongoose?: MongooseConnection;
// // };

// // const globalMongoose = global as GlobalMongoose;

// // const cached: MongooseConnection = globalMongoose.mongoose || {
// //   conn: null,
// //   promise: null
// // };

// // if (!globalMongoose.mongoose) {
// //   globalMongoose.mongoose = {
// //     conn: null,
// //     promise: null
// //   };
// // }

// // export const connectToDatabase = async (): Promise<Mongoose> => {
// //   if (cached.conn) return cached.conn;

// //   if (!MONGODB_URL) {
// //     throw new Error('Missing MONGODB_URL');
// //   }

// //   cached.promise = cached.promise || 
// //     mongoose.connect(MONGODB_URL, {
// //       dbName: 'imaginifyy',
// //       bufferCommands: false
// //     });

// //   cached.conn = await cached.promise;
// //   return cached.conn;
// // };
// // 1. First, the MongoDB connection setup
// // lib/database/mongoose.ts
// // lib/database/mongoose.ts

// import mongoose from 'mongoose';

// const MONGODB_URL = process.env.MONGODB_URL;

// interface MongooseConnection {
//   conn: typeof mongoose | null;
//   promise: Promise<typeof mongoose> | null;
// }

// // Define a type for the global object with mongoose property
// interface GlobalWithMongoose extends Global {
//   mongoose: MongooseConnection;
// }

// // Type assertion for the global object
// const globalForMongoose = global as unknown as GlobalWithMongoose;

// if (!globalForMongoose.mongoose) {
//   globalForMongoose.mongoose = {
//     conn: null,
//     promise: null,
//   };
// }

// export const connectToDatabase = async () => {
//   if (globalForMongoose.mongoose.conn) {
//     return globalForMongoose.mongoose.conn;
//   }

//   if (!MONGODB_URL) {
//     throw new Error('Missing MONGODB_URL environment variable');
//   }

//   globalForMongoose.mongoose.promise = globalForMongoose.mongoose.promise ||
//     mongoose.connect(MONGODB_URL, {
//       dbName: 'imaginifyy',
//       bufferCommands: false,
//     });

//   try {
//     globalForMongoose.mongoose.conn = await globalForMongoose.mongoose.promise;
//   } catch (e) {
//     globalForMongoose.mongoose.promise = null;
//     throw e;
//   }

//   return globalForMongoose.mongoose.conn;
// };
// lib/database/mongoose.ts
import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  isConnected?: boolean;
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Initialize cached connection
const cached: MongooseConnection = {
  isConnected: false,
  conn: null,
  promise: null,
};

export const connectToDatabase = async (): Promise<typeof mongoose> => {
  try {
    // If already connected, return the existing connection
    if (cached.conn && cached.isConnected) {
      console.log('Using existing connection');
      return cached.conn;
    }

    if (!MONGODB_URL) {
      throw new Error('Please define the MONGODB_URL environment variable');
    }

    // If there's no existing connection or promise, create a new one
    if (!cached.promise) {
      const opts = {
        dbName: 'imaginifyy',
        bufferCommands: false,
      };

      console.log('Creating new connection');
      cached.promise = mongoose.connect(MONGODB_URL, opts);
    }

    try {
      cached.conn = await cached.promise;
      cached.isConnected = true;

      // Add connection error handler
      cached.conn.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        cached.isConnected = false;
      });

      console.log('MongoDB connected successfully');
      return cached.conn;
    } catch (e) {
      cached.promise = null;
      cached.isConnected = false;
      throw e;
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};