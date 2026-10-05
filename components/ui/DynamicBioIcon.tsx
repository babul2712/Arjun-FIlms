'use client';

import React from 'react';
import {
  Sparkles,
  Camera,
  Video,
  Film,
  Heart,
  Award,
  Star,
  CreditCard,
  FileText,
  Calendar,
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  ShoppingBag,
  Music,
  Users,
  ShieldCheck,
  Zap,
  Image as ImageIcon,
  Palette,
  AtSign,
  Send,
  Link as LinkIcon,
  ExternalLink,
  Share2,
  QrCode,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Sliders,
  TrendingUp,
  Layers,
  Settings,
} from 'lucide-react';

interface DynamicBioIconProps {
  name?: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export default function DynamicBioIcon({
  name,
  className = 'w-5 h-5',
  size = 20,
  style,
}: DynamicBioIconProps) {
  const normalized = (name || '').toLowerCase().trim();

  const iconProps = {
    className,
    style,
    size,
  };

  // Brand SVG icons for perfect rendering without external icon pack discrepancies
  switch (normalized) {
    case 'instagram':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          style={style}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );

    case 'youtube':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          style={style}
          fill="currentColor"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );

    case 'facebook':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          style={style}
          fill="currentColor"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );

    case 'twitter':
    case 'x':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          style={style}
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );

    case 'linkedin':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          style={style}
          fill="currentColor"
        >
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.5a1.64 1.64 0 0 0-1.63 1.63c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63z" />
        </svg>
      );

    case 'pinterest':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          style={style}
          fill="currentColor"
        >
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.171-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.62-5.373-11.987-12-11.987z" />
        </svg>
      );

    case 'behance':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          style={style}
          fill="currentColor"
        >
          <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.171 3-3.455 0-5.555-2.257-5.555-5.743 0-3.322 2.056-5.757 5.437-5.757 3.328 0 5.093 2.144 5.093 5.429v1.071h-7.794c.125 1.583 1.238 2.657 2.871 2.657 1.312 0 2.227-.674 2.605-1.657h2.514zm-7.794-3.5h5.187c-.126-1.385-1.054-2.185-2.529-2.185-1.528 0-2.502.827-2.658 2.185zm-11.932 6.5h-4v-14h4.945c2.946 0 4.887 1.458 4.887 3.864 0 1.572-.888 2.812-2.193 3.352 1.706.505 2.761 1.954 2.761 3.738 0 2.72-2.137 4.046-5.4 4.046zm-1.5-6h2.827c1.375 0 2.273-.615 2.273-1.846 0-1.127-.852-1.754-2.158-1.754h-2.942v3.6zm0 4h3.018c1.554 0 2.582-.674 2.582-2.054 0-1.353-1.066-2.046-2.673-2.046h-2.927v4.1z" />
        </svg>
      );

    case 'spotify':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          style={style}
          fill="currentColor"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.308c-.215.352-.674.464-1.026.249-2.812-1.718-6.353-2.107-10.522-1.155-.401.092-.799-.16-.891-.561-.092-.402.16-.799.561-.891 4.568-1.044 8.49-.606 11.629 1.332.352.215.464.674.249 1.026zm1.468-3.262c-.27.439-.844.577-1.282.308-3.22-1.979-8.128-2.552-11.936-1.396-.496.151-1.023-.134-1.174-.63-.151-.496.134-1.023.63-1.174 4.354-1.321 9.774-.682 13.454 1.61.438.27.577.844.308 1.282zm.126-3.398C15.244 8.354 8.895 8.145 5.176 9.274c-.59.18-1.218-.16-1.397-.75-.179-.59.16-1.218.75-1.397 4.271-1.296 11.289-1.053 15.75 1.597.532.316.705 1.004.389 1.536-.316.531-1.004.704-1.536.388z" />
        </svg>
      );

    case 'threads':
      return (
        <svg
          viewBox="0 0 24 24"
          width={size}
          height={size}
          className={className}
          style={style}
          fill="currentColor"
        >
          <path d="M12.186 24h-.007C5.463 24 0 18.604 0 12.008 0 5.405 5.463 0 12.179 0c6.707 0 11.821 5.397 11.821 12.008 0 .685-.06 1.36-.179 2.018l-2.073-.414c.099-.526.152-1.066.152-1.604 0-5.463-4.225-9.908-9.721-9.908-5.496 0-9.72 4.445-9.72 9.908 0 5.464 4.224 9.908 9.72 9.908 3.738 0 6.945-2.062 8.563-5.264l1.834.981C20.373 21.436 16.545 24 12.186 24zm-1.89-6.908c-2.31 0-4.187-1.876-4.187-4.186s1.877-4.186 4.187-4.186c2.31 0 4.186 1.876 4.186 4.186 0 1.258-.564 2.39-1.455 3.166l1.456 1.456c1.293-1.127 2.099-2.782 2.099-4.622 0-3.468-2.818-6.286-6.286-6.286-3.468 0-6.286 2.818-6.286 6.286s2.818 6.286 6.286 6.286c1.696 0 3.238-.673 4.373-1.764l-1.464-1.464c-.815.728-1.867 1.144-2.909 1.144z" />
        </svg>
      );

    case 'whatsapp':
    case 'message-circle':
    case 'messagecircle':
      return <MessageCircle {...iconProps} />;
    case 'telegram':
    case 'send':
      return <Send {...iconProps} />;
    case 'website':
    case 'globe':
      return <Globe {...iconProps} />;
    case 'camera':
      return <Camera {...iconProps} />;
    case 'video':
      return <Video {...iconProps} />;
    case 'film':
      return <Film {...iconProps} />;
    case 'heart':
      return <Heart {...iconProps} />;
    case 'award':
      return <Award {...iconProps} />;
    case 'star':
      return <Star {...iconProps} />;
    case 'creditcard':
    case 'credit-card':
      return <CreditCard {...iconProps} />;
    case 'filetext':
    case 'file-text':
      return <FileText {...iconProps} />;
    case 'calendar':
      return <Calendar {...iconProps} />;
    case 'mappin':
    case 'map-pin':
      return <MapPin {...iconProps} />;
    case 'phone':
      return <Phone {...iconProps} />;
    case 'mail':
      return <Mail {...iconProps} />;
    case 'shoppingbag':
    case 'shopping-bag':
      return <ShoppingBag {...iconProps} />;
    case 'users':
      return <Users {...iconProps} />;
    case 'shieldcheck':
    case 'shield-check':
      return <ShieldCheck {...iconProps} />;
    case 'zap':
      return <Zap {...iconProps} />;
    case 'share2':
    case 'share':
      return <Share2 {...iconProps} />;
    case 'qrcode':
    case 'qr-code':
      return <QrCode {...iconProps} />;
    case 'sparkles':
    default:
      return <Sparkles {...iconProps} />;
  }
}
