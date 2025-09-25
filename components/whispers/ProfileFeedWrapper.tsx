import Post from '@/models/Post';
import User from '@/models/User';
import { ProfileFeed } from './ProfileFeed';
import { connectToDatabase } from '@/lib/mongodb';

interface ProfileFeedWrapperProps {
  nickname: string;
  displayName: string;
}

export default async function ProfileFeedWrapper({ nickname, displayName }: ProfileFeedWrapperProps) {
  await connectToDatabase();

  // First get the user to get their userId
  const user = await User.findOne({ nickname }).select('_id');
  if (!user) {
    return null;
  }

  // Fetch posts for this user
  const posts = await Post.find({ userId: user._id })
    .sort({ date: -1 })
    .lean();

  const formattedPosts = posts.map(post => ({
    id: post._id.toString(),
    content: post.content,
    date: post.date,
    icon: post.icon,
    color: post.color,
  }));

  return (
    <ProfileFeed
      posts={formattedPosts}
      ownerName={displayName}
      siteName="Whispers"
      ownerNickname={nickname}
      canCompose={false}
    />
  );
}