const express = require('express');
const { body, param, query } = require('express-validator');

const productController = require('../controllers/productController');
const authJWT = require('../middleware/authJWT');
const authorize = require('../middleware/authorizeRole');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

const updateProductValidators = [
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
];

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than 0'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('created_by').optional().isUUID().withMessage('created_by must be a valid UUID'),
    validateRequest
  ],
  productController.getProducts
);

router.get(
  '/:id',
  [param('id').isUUID().withMessage('Product id must be a valid UUID'), validateRequest],
  productController.getProductById
);

router.post(
  '/',
  authJWT,
  authorize(['admin', 'staff']),
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
  authorize(['admin', 'staff']),
  updateProductValidators,
  productController.updateProduct
);

router.put(
  '/:id',
  authJWT,
  authorize(['admin', 'staff']),
  updateProductValidators,
  productController.updateProduct
);

router.delete(
  '/:id',
  authJWT,
  authorize(['admin']),
  [param('id').isUUID().withMessage('Product id must be a valid UUID'), validateRequest],
  productController.deleteProduct
);

module.exports = router;
