const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Available', 'Busy', 'Playing', 'Driving', 'Sleeping'],
    default: 'Available'
  },
  customMessages: {
    type: Map,
    of: String,
    default: {
      Available: "Hi! I'm available, please hold on.",
      Busy: "I'm currently busy and can't take your call. Please leave a message.",
      Playing: "I'm taking a break right now. I'll call you back soon!",
      Driving: "I'm driving at the moment. I'll return your call when I'm safely parked.",
      Sleeping: "I'm resting right now. I'll get back to you when I wake up."
    }
  },
  notificationsEnabled: { type: Boolean, default: true },
  avatar: { type: String, default: '' }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
