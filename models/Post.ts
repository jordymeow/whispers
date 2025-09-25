import mongoose, { Document, Model, Schema } from 'mongoose';
import { DEFAULT_ICON_COLOR, ICON_COLORS } from '@/lib/whispers';

export interface IPost extends Document {
  content: string;
  date: Date;
  icon?: string | null;
  color: string;
  isDraft: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    icon: {
      type: String,
      default: null,
      trim: true,
    },
    color: {
      type: String,
      enum: ICON_COLORS.map(({ name }) => name),
      default: DEFAULT_ICON_COLOR,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
