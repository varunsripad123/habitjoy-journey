import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    unique: true,
    trim: true,
    maxlength: [100, 'A product name must have less or equal to 100 characters']
  },
  slug: String,
  description: {
    type: String,
    required: [true, 'A product must have a description'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val) {
        // this only points to current doc on NEW document creation
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be below regular price'
    }
  },
  images: [String],
  category: {
    type: String,
    required: [true, 'A product must have a category'],
    enum: {
      values: ['subscription', 'one-time', 'digital', 'physical'],
      message: 'Category is either: subscription, one-time, digital, or physical'
    }
  },
  features: [String],
  stripePriceId: String,
  stripeProductId: String,
  active: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Document middleware: pre-save hook to create slug
productSchema.pre('save', function(next) {
  this.slug = this.name.toLowerCase().split(' ').join('-');
  next();
});

// Query middleware: find only active products
productSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

// Virtual populate reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id'
});

const Product = mongoose.model('Product', productSchema);

export default Product;