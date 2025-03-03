import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a User']
  },
  products: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Order item must have a product reference']
      },
      quantity: {
        type: Number,
        required: [true, 'Order item must have a quantity'],
        min: [1, 'Quantity must be at least 1']
      },
      price: {
        type: Number,
        required: [true, 'Order item must have a price']
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: [true, 'Order must have a total amount']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'razorpay'],
    required: [true, 'Payment method is required']
  },
  paymentIntentId: String,
  stripeCustomerId: String,
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  paidAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  refundedAt: Date
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Query middleware to populate user and products
orderSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email'
  }).populate({
    path: 'products.product',
    select: 'name price images'
  });
  next();
});

// Static method to calculate total amount
orderSchema.statics.calculateTotalAmount = function(products) {
  return products.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Document middleware to set timestamps based on status changes
orderSchema.pre('save', function(next) {
  // Set timestamps based on status changes
  const currentDate = new Date();
  
  if (this.isModified('status')) {
    switch (this.status) {
      case 'paid':
        this.paidAt = currentDate;
        break;
      case 'shipped':
        this.shippedAt = currentDate;
        break;
      case 'delivered':
        this.deliveredAt = currentDate;
        break;
      case 'cancelled':
        this.cancelledAt = currentDate;
        break;
      case 'refunded':
        this.refundedAt = currentDate;
        break;
    }
  }
  
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;