// lib/database/mongoose.ts
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

type GlobalMongoose = typeof globalThis & {
  mongoose?: MongooseConnection;
};

const globalMongoose = global as GlobalMongoose;

const cached: MongooseConnection = globalMongoose.mongoose || {
  conn: null,
  promise: null
};

if (!globalMongoose.mongoose) {
  globalMongoose.mongoose = {
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