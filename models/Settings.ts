import mongoose, { Document, Model, Schema } from 'mongoose';
import { DEFAULT_ASCII_ART_BANNER } from '@/lib/siteDefaults';

export interface ISettings extends Document {
  title: string;
  backgroundTheme?: string;
  backgroundTint?: string;
  asciiArt?: string;
  trackingSnippet: string;
  owner?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    title: {
      type: String,
      required: true,
      default: 'My Whispers',
    },
    backgroundTheme: {
      type: String,
      required: false,
      default: 'cosmic_dust',
    },
    backgroundTint: {
      type: String,
      required: false,
      default: 'none',
      enum: ['none', 'purple', 'blue', 'cyan', 'green', 'amber', 'red', 'pink', 'indigo'],
    },
    asciiArt: {
      type: String,
      required: false,
      default: DEFAULT_ASCII_ART_BANNER,
      maxlength: 2000, // ~20 rows with average width
    },
    trackingSnippet: {
      type: String,
      default: '',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    timestamps: true,
    strict: false,  // Allow fields not in schema to be saved
  }
);

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
