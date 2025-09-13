import Food from '../models/Food.js';

// Get all foods
export const getFoods = async (req, res) => {
  try {
    const { category, organic, sort, page = 1, limit = 10 } = req.query;

    // Convert page and limit to numbers
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    // Build filter object
    let filter = {};
    if (category && category !== 'all') filter.category = category;
    if (organic) filter.organic = organic === 'true';

    // Build sort object
    let sortOptions = {};
    switch (sort) {
      case 'price-low':
        sortOptions = { price: 1 };
        break;
      case 'price-high':
        sortOptions = { price: -1 };
        break;
      case 'rating':
        sortOptions = { rating: -1 };
        break;
      case 'name':
      default:
        sortOptions = { name: 1 };
        break;
    }

    const foods = await Food.find(filter)
      .sort(sortOptions)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    const total = await Food.countDocuments(filter);

    res.json({
      foods,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
    });
  } catch (error) {
    console.error('Error fetching foods:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Get food by ID
export const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json(food);
  } catch (error) {
    console.error('Error fetching food by ID:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid food ID' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Create food (admin only)
export const createFood = async (req, res) => {
  try {
    const food = new Food(req.body);
    const savedFood = await food.save();
    res.status(201).json(savedFood);
  } catch (error) {
    console.error('Error creating food:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', error: error.message });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update food (admin only)
export const updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json(food);
  } catch (error) {
    console.error('Error updating food:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', error: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid food ID' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete food (admin only)
export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food not found' });
    }

    res.json({ message: 'Food removed successfully' });
  } catch (error) {
    console.error('Error deleting food:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid food ID' });
    }
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
