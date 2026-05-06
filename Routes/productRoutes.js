const express = require('express');
const router = express.Router();
const Product = require('../Models/Product');
const upload = require('../Middelwares/upload');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a product
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, category, stock, isNewItem, isBestseller } = req.body;
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      images: imageUrls,
      stock,
      isNewItem: isNewItem === 'true',
      isBestseller: isBestseller === 'true',
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a product
router.put('/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, category, stock, isNewItem, isBestseller } = req.body;
    const product = await Product.findById(req.params.id);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    product.isNewItem = isNewItem === 'true';
    product.isBestseller = isBestseller === 'true';

    if (req.files && req.files.length > 0) {
      product.images = req.files.map(file => file.path);
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
