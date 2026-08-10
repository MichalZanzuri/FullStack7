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

// Real Mongoose Model
const RealProductModel = mongoose.model('Product', productSchema);

// In-Memory Mock Model
let mockProducts = [];

class MockProduct {
  constructor(data) {
    this._id = data._id || Math.random().toString(36).substring(2, 9);
    this.name = data.name;
    this.description = data.description;
    this.price = Number(data.price);
    this.category = data.category || 'General';
    this.image = data.image || '';
    this.stock = data.stock !== undefined ? Number(data.stock) : 10;
    this.customizationOptions = data.customizationOptions || [];
    this.createdAt = data.createdAt || new Date();
  }

  async save() {
    mockProducts.push(this);
    return this;
  }

  static find() {
    const query = {
      then: (resolve) => {
        resolve([...mockProducts].sort((a, b) => b.createdAt - a.createdAt));
      },
      sort: () => query
    };
    return query;
  }

  static async findById(id) {
    return mockProducts.find(p => p._id === id) || null;
  }

  static async findByIdAndUpdate(id, update, options) {
    const idx = mockProducts.findIndex(p => p._id === id);
    if (idx === -1) return null;
    mockProducts[idx] = new MockProduct({ ...mockProducts[idx], ...update, _id: id });
    return mockProducts[idx];
  }

  static async findByIdAndDelete(id) {
    const idx = mockProducts.findIndex(p => p._id === id);
    if (idx === -1) return null;
    const deleted = mockProducts[idx];
    mockProducts.splice(idx, 1);
    return deleted;
  }

  static async countDocuments() {
    return mockProducts.length;
  }

  static async insertMany(products) {
    const instances = products.map(p => new MockProduct(p));
    mockProducts.push(...instances);
    return instances;
  }
}

// Proxied export that dynamically switches
export const Product = new Proxy(RealProductModel, {
  construct(target, args) {
    if (process.env.USE_MOCK_MONGODB === 'true') {
      return new MockProduct(...args);
    }
    return new RealProductModel(...args);
  },
  get(target, prop) {
    if (process.env.USE_MOCK_MONGODB === 'true') {
      if (prop in MockProduct) {
        return MockProduct[prop];
      }
    }
    return target[prop];
  }
});

export default Product;
