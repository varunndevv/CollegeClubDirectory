import mongoose from "mongoose";

const clubSchema = new mongoose.Schema({
  slug: {
    type: String,
    trim: true,
    unique: true,
  },
  name: { 
    type: String, 
    required: [true, 'Club name is required'],
    trim: true,
    unique: true,
    minlength: [3, 'Club name must be at least 3 characters long'],
    maxlength: [100, 'Club name cannot exceed 100 characters']
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [20000, 'Description cannot exceed 20000 characters']
  },
  category: { 
    type: String,
    required: [true, 'Category is required']
  },
  image: String,
  createdBy: String,
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Invalid status'
    },
    default: 'pending'
  },
  socialLinks: {
    website: {
      type: String,
      match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/, 'Please enter a valid URL']
    },
    instagram: String,
    linkedin: String,
    twitter: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
clubSchema.index({ name: 'text', description: 'text' });
clubSchema.index({ status: 1 });

// Virtual for member count
clubSchema.virtual('memberCount').get(function() {
  return 0;
});

// Virtual for upcoming events
clubSchema.virtual('upcomingEvents', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'clubId'
});

// Method to check if user is a member
clubSchema.methods.isMember = function(userId) {
  return false;
};

// Method to check if user is an officer or admin
clubSchema.methods.isOfficerOrAdmin = function(userId) {
  return false;
};

// Auto-generate slug from name before saving
clubSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
  }
  next()
})

const Club = mongoose.models.Club || mongoose.model("Club", clubSchema)

export default Club
