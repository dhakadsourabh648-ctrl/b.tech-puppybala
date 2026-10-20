import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Customer name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters'],
    },
    puppyId: {
      type: String,
      required: [true, 'Selected puppy ID is required'],
      trim: true,
    },
    puppyName: {
      type: String,
      required: [true, 'Selected puppy name is required'],
      trim: true,
    },
    breed: {
      type: String,
      required: [true, 'Puppy breed is required'],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Follow-up', 'Closed'],
        message: 'Status must be one of: "New", "Contacted", "Follow-up", "Closed"',
      },
      default: 'New',
      index: true,
    },
    whatsappStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Sent', 'Failed', 'Skipped'],
        message: 'whatsappStatus must be one of: "Pending", "Sent", "Failed", "Skipped"',
      },
      default: 'Pending',
      index: true,
    },
    whatsappMessageId: {
      type: String,
      default: null,
      trim: true,
    },
    whatsappSentAt: {
      type: Date,
      default: null,
    },
    whatsappError: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted inquiry reference ID
inquirySchema.virtual('inquiryRef').get(function () {
  const hex = this._id ? this._id.toString().slice(-6).toUpperCase() : 'NEW';
  return `BPB-${hex}`;
});

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
