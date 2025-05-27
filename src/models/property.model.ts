import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  id: string;
  title: string;
  type: string;
  price: number;
  state: string;
  city: string;
  areaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string;
  furnished: string;
  availableFrom: string;
  listedBy: string;
  tags: string;
  colorTherm: string;
  rating: number;
  isVerified: boolean;
  listingType: string;
  createdBy: mongoose.Types.ObjectId;
}

const propertySchema = new Schema<IProperty>({
  id: { type: String, required: true, unique: true },
  title: String,
  type: String,
  price: Number,
  state: String,
  city: String,
  areaSqFt: Number,
  bedrooms: Number,
  bathrooms: Number,
  amenities: String,
  furnished: String,
  availableFrom: String,
  listedBy: String,
  tags: String,
  colorTherm: String,
  rating: Number,
  isVerified: Boolean,
  listingType: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model<IProperty>('Property', propertySchema); 