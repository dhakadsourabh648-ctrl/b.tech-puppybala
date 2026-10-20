import mongoose from 'mongoose';

const puppySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Puppy name is required'],
      trim: true,
    },
    breed: {
      type: String,
      required: [true, 'Puppy breed is required'],
      trim: true,
      index: true,
    },
    age: {
      type: String,
      required: [true, 'Puppy age is required (e.g. "45 Days", "2 Months")'],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female'],
        message: 'Gender must be either "Male" or "Female"',
      },
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    images: {
      type: [String],
      required: [true, 'At least one puppy image URL is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Images array must contain at least one valid image URL',
      },
    },
    availability: {
      type: String,
      enum: {
        values: ['Available', 'Sold'],
        message: 'Availability must be either "Available" or "Sold"',
      },
      default: 'Available',
      index: true,
    },
    // Optional UI enhancement fields that preserve Part 1 rich design
    temperament: {
      type: [String],
      default: ['Friendly', 'Playful', 'Home-Raised'],
    },
    color: {
      type: String,
      default: 'Standard',
    },
    homeRaisedHighlights: {
      type: [String],
      default: [
        'Raised freely indoors with daily human affection and socialization',
        'Weaned on balanced puppy starter meals with healthy digestion',
        'Gentle temperament, perfectly suited for loving families',
      ],
    },
    locationBadge: {
      type: String,
      default: 'Bhopal (Ready for local pickup or safe transit across MP)',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for heroImage (first image in array)
puppySchema.virtual('heroImage').get(function () {
  return this.images && this.images.length > 0 ? this.images[0] : '';
});

// Virtual for gallery
puppySchema.virtual('gallery').get(function () {
  return this.images || [];
});

// Virtual for backward-compatible status field
puppySchema.virtual('status').get(function () {
  return this.availability;
});

export const Puppy = mongoose.model('Puppy', puppySchema);
