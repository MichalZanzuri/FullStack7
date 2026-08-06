import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: true },
  category: { type: String },
  stockQuantity: { type: Number, default: 0 },
  media: [{ type: String }],
  specifications: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export const Product = mongoose.model('Product', productSchema);
export default Product;
