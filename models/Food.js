import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { 
      type: String, 
      required: true,
      enum: ['vegetables', 'fruits', 'dairy', 'bakery', 'meat', 'seafood']
    },
    organic: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const Food = mongoose.model('Food', foodSchema);
export default Food;