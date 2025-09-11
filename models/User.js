import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: function() {
      return this.authMethod === 'local';
    } 
  },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  authMethod: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  avatar: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.authMethod !== 'local') return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(password) {
  if (this.authMethod !== 'local') {
    throw new Error('This user uses Google authentication');
  }
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;