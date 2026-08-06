import express from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { verifyToken, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', verifyToken, createOrder);
router.get('/myorders', verifyToken, getMyOrders);
router.get('/', verifyToken, authorizeRoles('admin'), getAllOrders);
router.patch('/:id/status', verifyToken, authorizeRoles('admin'), updateOrderStatus);

export default router;
