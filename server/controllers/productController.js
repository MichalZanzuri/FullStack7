import { Product } from '../models/Product.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image, stock, customizationOptions } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Product name and price are required' });
    }
    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      category: category || 'Customizable',
      image: image || '',
      stock: stock ? Number(stock) : 10,
      customizationOptions: customizationOptions || []
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image, stock, customizationOptions } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price: Number(price),
        category,
        image,
        stock: Number(stock),
        customizationOptions
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};
