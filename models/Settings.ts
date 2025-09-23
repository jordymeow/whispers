import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISettings extends Document {
  title: string;
  backgroundTheme?: string;
  backgroundTint?: string;
  asciiArt?: string;
  trackingSnippet: string;
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
      default: '',
      maxlength: 2000, // ~20 rows with average width
    },
    trackingSnippet: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    strict: false,  // Allow fields not in schema to be saved
  }
);

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
