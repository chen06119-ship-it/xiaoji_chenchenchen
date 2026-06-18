export type Profile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CommunityComment = {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author: Profile;
};

export type CommunityPost = {
  id: string;
  authorId: string;
  body: string;
  emoji: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  author: Profile;
  comments: CommunityComment[];
  likeCount: number;
  likedByMe: boolean;
};

export type NewPostDraft = {
  body: string;
  emoji: string;
  images: File[];
};

export type ProfileDraft = {
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
};
