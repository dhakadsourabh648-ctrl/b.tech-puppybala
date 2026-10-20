import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Offer description is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    items: {
      type: [mongoose.Schema.Types.Mixed],
      default: [
        { name: '7 Days Dog Food', description: 'Starter nutritious food pack matched to puppy diet', icon: 'Utensils' },
        { name: 'Dog Belt & Leash', description: 'Soft adjustable puppy collar & training leash', icon: 'ShieldCheck' },
        { name: 'Dog Shampoo', description: 'Gentle tear-free coat care shampoo', icon: 'Sparkles' },
      ],
    },
    image: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'Gift',
    },
    badge: {
      type: String,
      default: 'Limited Period Festive Special',
    },
    highlightText: {
      type: String,
      default: 'Worth ₹2,500 complimentary with every puppy',
    },
    terms: {
      type: String,
      default: 'Included automatically with every puppy adoption enquiry finalized this month.',
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for backward-compatible subtitle field
offerSchema.pre('save', function (next) {
  if (!this.subtitle) {
    this.subtitle = this.description;
  }
  next();
});

export const Offer = mongoose.model('Offer', offerSchema);
