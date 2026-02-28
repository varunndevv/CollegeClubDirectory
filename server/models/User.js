import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@bmsce\.ac\.in$/, 'Please use a valid BMSCE email']
  },
  usn: {
    type: String,
    required: [true, 'USN is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  yearOfStudy: {
    type: String,
    required: [true, 'Year of study is required'],
    enum: {
      values: ['1', '2', '3', '4', '5', '1st', '2nd', '3rd', '4th', 'Alumni', 'Faculty'],
      message: 'Invalid year of study'
    }
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'clubAdmin', 'pageAdmin'],
      message: 'Invalid user role'
    },
    default: 'user'
  },
  profilePicture: {
    type: String,
    default: '/default-avatar.png'
  },
  clubs: [{
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club'
    },
    role: {
      type: String,
      enum: ['member', 'officer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  otpCode: {
    type: String,
    select: false
  },
  otpExpiresAt: {
    type: Date,
    select: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.passwordHash;
      delete ret.otpCode;
      delete ret.otpExpiresAt;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpire;
      return ret;
    }
  }
});

// Indexes - email and usn are already unique in schema

// Virtual for user's full profile URL
userSchema.virtual('profileUrl').get(function () {
  return `/users/${this._id}`;
});

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
