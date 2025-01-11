// lib/database/mongoose.ts
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extend the NodeJS global type
declare global {
  namespace NodeJS {
    interface Global {
      mongoose: MongooseConnection | undefined;
    }
  }
}

// Use NodeJS.Global
const cached: MongooseConnection = (global as any).mongoose || {
  conn: null,
  promise: null
};

if (!(global as any).mongoose) {
  (global as any).mongoose = {
    conn: null,
    promise: null
  };
}

export const connectToDatabase = async (): Promise<Mongoose> => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URL) {
    throw new Error('Missing MONGODB_URL');
  }

  cached.promise = cached.promise || 
    mongoose.connect(MONGODB_URL, {
      dbName: 'imaginifyy',
      bufferCommands: false
    });

  cached.conn = await cached.promise;
  return cached.conn;
};