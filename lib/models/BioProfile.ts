import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  username?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  order: number;
  clickCount: number;
}

export interface ICustomLink {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  icon?: string;
  thumbnail?: string;
  badge?: string;
  isHighlighted: boolean;
  isActive: boolean;
  order: number;
  clickCount: number;
}

export interface IBioProfile extends Document {
  slug: string;
  studioName: string;
  tagline: string;
  bio: string;
  avatar: string;
  coverImage?: string;
  verified: boolean;
  phone: string;
  whatsapp: string;
  email: string;
  location: string;
  website: string;
  socialLinks: ISocialLink[];
  customLinks: ICustomLink[];
  viewsCount: number;
  totalClicks: number;
  themeStyle: string;
  buttonShape: string;
  showShareButton: boolean;
  showInquiryButton: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SocialLinkSchema = new Schema(
  {
    id: { type: String, required: true },
    platform: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, required: true },
    username: { type: String },
    icon: { type: String },
    color: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const CustomLinkSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    url: { type: String, required: true },
    icon: { type: String, default: 'sparkles' },
    thumbnail: { type: String },
    badge: { type: String },
    isHighlighted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const BioProfileSchema: Schema = new Schema(
  {
    slug: { type: String, default: 'arjunfilms', unique: true },
    studioName: { type: String, default: 'Arjun Films & Photography' },
    tagline: { type: String, default: 'Cinematic Weddings • Luxury Portfolios • Commercials' },
    bio: {
      type: String,
      default:
        'Award-winning visual storytellers capturing heartfelt emotion across India & destination locations worldwide. Available for 2025–2026 bookings.',
    },
    avatar: {
      type: String,
      default: '/logo.jpeg',
    },
    coverImage: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    },
    verified: { type: Boolean, default: true },
    phone: { type: String, default: '+91 98765 43210' },
    whatsapp: { type: String, default: '919876543210' },
    email: { type: String, default: 'contact@arjunfilms.com' },
    location: { type: String, default: 'Bhubaneswar & Mumbai, India' },
    website: { type: String, default: 'https://arjunfilms.com' },
    socialLinks: { type: [SocialLinkSchema], default: [] },
    customLinks: { type: [CustomLinkSchema], default: [] },
    viewsCount: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    themeStyle: { type: String, default: 'cinematic-dark' },
    buttonShape: { type: String, default: 'rounded-2xl' },
    showShareButton: { type: Boolean, default: true },
    showInquiryButton: { type: Boolean, default: true },
  },
  { timestamps: true }
);

delete (mongoose.models as any).BioProfile;
export default (mongoose.models.BioProfile as any) ||
  mongoose.model<IBioProfile>('BioProfile', BioProfileSchema);
