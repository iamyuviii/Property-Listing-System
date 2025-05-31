import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
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

const propertySchema = new Schema<IProperty>(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    price: { type: Number, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    areaSqFt: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    amenities: { type: String, default: '' },
    furnished: { type: String, default: 'No' },
    availableFrom: { type: String, default: '' },
    listedBy: { type: String, default: '' },
    tags: { type: String, default: '' },
    colorTherm: { type: String, default: 'neutral' },
    rating: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    listingType: { type: String, default: 'Rent' },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false, // Optional: removes the `__v` field
  }
);

export default mongoose.model<IProperty>('Property', propertySchema);
