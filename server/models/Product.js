import mongoose from 'mongoose';

const choiceSchema = new mongoose.Schema({
  label: { type: String, required: true },
  priceModifier: { type: Number, default: 0 }
});

const customizationOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  choices: [choiceSchema]
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, default: 'General' },
  image: { type: String, default: '' },
  stock: { type: Number, default: 10 },
  customizationOptions: [customizationOptionSchema],
  createdAt: { type: Date, default: Date.now }
});

export const Product = mongoose.model('Product', productSchema);
export default Product;
