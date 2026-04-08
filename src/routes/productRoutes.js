const express = require('express');
const { body, param } = require('express-validator');

const productController = require('../controllers/productController');
const authJWT = require('../middleware/authJWT');
const authorizeRole = require('../middleware/authorizeRole');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', productController.getProducts);

router.get(
  '/:id',
  [param('id').isUUID().withMessage('Product id must be a valid UUID'), validateRequest],
  productController.getProductById
);

router.post(
  '/',
  authJWT,
  authorizeRole('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
    validateRequest
  ],
  productController.createProduct
);

router.patch(
  '/:id',
  authJWT,
  authorizeRole('admin'),
  [
    param('id').isUUID().withMessage('Product id must be a valid UUID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
    body().custom((value) => {
      if (!value.name && value.price === undefined) {
        throw new Error('At least one field is required to update');
      }
      return true;
    }),
    validateRequest
  ],
  productController.updateProduct
);

router.delete(
  '/:id',
  authJWT,
  authorizeRole('admin'),
  [param('id').isUUID().withMessage('Product id must be a valid UUID'), validateRequest],
  productController.deleteProduct
);

module.exports = router;
