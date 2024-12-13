import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export interface UserType extends Document {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  forgotPasswordToken?: string;
  forgotPasswordExpiry?: Date;
  
  comparePassword(plainPassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  generateJWTToken(): string;
}

const userSchema = new Schema<UserType>(
  {
    fullName: {
      type: String,
      required: [true, "Name is required"],
      minlength: [5, "Name must be at least 5 characters"],
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please fill in a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^[6-9]\d{9}$/, // Regex for Indian phone number
        "Please enter a valid 10-digit Indian phone number",
      ],
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

// Hashes password before saving to the database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (plainPassword: string): Promise<boolean> {
  return await bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.forgotPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);

  return resetToken;
};

userSchema.methods.generateJWTToken = function (): string {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  );
};

const User = model<UserType>("User", userSchema);

export default User;
