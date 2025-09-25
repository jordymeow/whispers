import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { BACKGROUND_THEMES, BACKGROUND_TINTS, DEFAULT_BACKGROUND_THEME, DEFAULT_BACKGROUND_TINT, type BackgroundTint, type BackgroundThemeKey } from '@/lib/backgroundThemes';
import { DEFAULT_ASCII_ART_BANNER } from '@/lib/siteDefaults';

export type UserRole = 'admin' | 'user';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  password: string;
  email: string;
  displayName: string;
  bio?: string;
  backgroundTheme?: BackgroundThemeKey;
  backgroundTint?: BackgroundTint;
  asciiArtBanner?: string;
  role: UserRole;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  pendingEmail?: string;
  pendingEmailCode?: string;
  pendingEmailExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'],
  },
  password: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  bio: {
    type: String,
    default: '',
    maxlength: 280,
  },
  backgroundTheme: {
    type: String,
    enum: Object.keys(BACKGROUND_THEMES),
    default: DEFAULT_BACKGROUND_THEME,
  },
  backgroundTint: {
    type: String,
    enum: BACKGROUND_TINTS,
    default: DEFAULT_BACKGROUND_TINT,
  },
  asciiArtBanner: {
    type: String,
    default: DEFAULT_ASCII_ART_BANNER,
    maxlength: 2000,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  resetPasswordToken: {
    type: String,
    default: undefined,
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: undefined,
  },
  pendingEmail: {
    type: String,
    default: undefined,
  },
  pendingEmailCode: {
    type: String,
    default: undefined,
  },
  pendingEmailExpires: {
    type: Date,
    default: undefined,
  },
}, {
  timestamps: true,
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
