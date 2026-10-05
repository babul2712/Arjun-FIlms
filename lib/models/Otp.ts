import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  hashedOtp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Document automatically removed after 5 minutes (300 seconds)
  }
});

delete mongoose.models.Otp;
export default (mongoose.models.Otp as any) || mongoose.model('Otp', OtpSchema);
