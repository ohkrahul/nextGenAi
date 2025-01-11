// "use server";

// import { revalidatePath } from "next/cache";

// import User from "../database/models/user.model";
// import { connectToDatabase } from "../database/mongoose";
// import { handleError } from "../utils";

// // CREATE
// export async function createUser(user: CreateUserParams) {
//   try {
//     await connectToDatabase();

//     const newUser = await User.create(user);

//     return JSON.parse(JSON.stringify(newUser));
//   } catch (error) {
//     handleError(error);
//   }
// }

// // READ
// export async function getUserById(userId: string) {
//   try {
//     await connectToDatabase();

//     const user = await User.findOne({ clerkId: userId });

//     if (!user) throw new Error("User not found");

//     return JSON.parse(JSON.stringify(user));
//   } catch (error) {
//     handleError(error);
//   }
// }

// // UPDATE
// export async function updateUser(clerkId: string, user: UpdateUserParams) {
//   try {
//     await connectToDatabase();

//     const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
//       new: true,
//     });

//     if (!updatedUser) throw new Error("User update failed");
    
//     return JSON.parse(JSON.stringify(updatedUser));
//   } catch (error) {
//     handleError(error);
//   }
// }

// // DELETE
// export async function deleteUser(clerkId: string) {
//   try {
//     await connectToDatabase();

//     // Find user to delete
//     const userToDelete = await User.findOne({ clerkId });

//     if (!userToDelete) {
//       throw new Error("User not found");
//     }

//     // Delete user
//     const deletedUser = await User.findByIdAndDelete(userToDelete._id);
//     revalidatePath("/");

//     return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
//   } catch (error) {
//     handleError(error);
//   }
// }

// // USE CREDITS
// export async function updateCredits(userId: string, creditFee: number) {
//   try {
//     await connectToDatabase();

//     const updatedUserCredits = await User.findOneAndUpdate(
//       { _id: userId },
//       { $inc: { creditBalance: creditFee }},
//       { new: true }
//     )

//     if(!updatedUserCredits) throw new Error("User credits update failed");

//     return JSON.parse(JSON.stringify(updatedUserCredits));
//   } catch (error) {
//     handleError(error);
//   }
// }

"use server";

import { revalidatePath } from "next/cache";
import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// Types
interface CreateUserParams {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  photo: string;
}

interface UpdateUserParams {
  firstName?: string;
  lastName?: string;
  username?: string;
  photo?: string;
}

// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { clerkId: user.clerkId },
        { email: user.email },
        { username: user.username }
      ]
    });

    if (existingUser) {
      throw new Error(
        existingUser.clerkId === user.clerkId
          ? "User already exists"
          : existingUser.email === user.email
          ? "Email already in use"
          : "Username already taken"
      );
    }

    // Create new user with defaults
    const newUser = await User.create({
      ...user,
      planId: 1,
      creditBalance: 10
    });

    await newUser.save();

    console.log("User created successfully:", newUser._id);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error("Error in createUser:", error);
    handleError(error);
  }
}

// READ
export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId })
      .select("-__v")
      .lean();

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error("Error in getUserById:", error);
    handleError(error);
  }
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    // Check if username is being updated and is unique
    if (user.username) {
      const existingUser = await User.findOne({
        username: user.username,
        clerkId: { $ne: clerkId }
      });

      if (existingUser) {
        throw new Error("Username already taken");
      }
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      { $set: user },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      throw new Error("User update failed");
    }

    console.log("User updated successfully:", updatedUser._id);
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    console.error("Error in updateUser:", error);
    handleError(error);
  }
}

// DELETE
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Delete user and related data
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    
    // Revalidate cached pages
    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath(`/profile/${clerkId}`);

    console.log("User deleted successfully:", clerkId);
    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    console.error("Error in deleteUser:", error);
    handleError(error);
  }
}

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();

    // Validate credit fee
    if (creditFee >= 0) {
      throw new Error("Credit fee must be negative for deductions");
    }

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { 
        $inc: { creditBalance: creditFee },
        $set: { 
          updatedAt: new Date()
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUserCredits) {
      throw new Error("User credits update failed");
    }

    // Check if credits are below threshold
    if (updatedUserCredits.creditBalance < 2) {
      console.warn(`Low credits warning for user: ${userId}`);
    }

    console.log("Credits updated successfully for user:", userId);
    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    console.error("Error in updateCredits:", error);
    handleError(error);
  }
}

// GET ALL USERS
export async function getAllUsers() {
  try {
    await connectToDatabase();

    const users = await User.find({})
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    handleError(error);
  }
}