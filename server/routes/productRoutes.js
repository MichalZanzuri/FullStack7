import express from 'express';
import { getAllProducts, getProductById, createProduct, deleteProduct } from '../controllers/productController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', verifyToken, isAdmin, createProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

export default router;
