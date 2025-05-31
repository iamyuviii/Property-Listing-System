import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  favorites: mongoose.Types.ObjectId[];
  recommendationsReceived: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Normalize emails
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
    recommendationsReceived: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
  },
  {
    timestamps: true,       // Track user creation and update time
    versionKey: false,      // Optional: removes __v field
  }
);

export default mongoose.model<IUser>('User', userSchema);
