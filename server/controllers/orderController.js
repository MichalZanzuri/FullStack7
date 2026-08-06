import { Order } from '../models/Order.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, totalPrice } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0 || !totalPrice) {
      return res.status(400).json({ message: 'Order items and total price are required' });
    }

    const order = await Order.create({ userId, items, totalPrice });
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.findByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const updated = await Order.updateStatus(id, status);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
