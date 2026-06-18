import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type {
  CommunityComment,
  CommunityPost,
  NewPostDraft,
  Profile,
} from "../types/community";

const POST_IMAGE_BUCKET = "post-images";
const MAX_POST_IMAGES = 9;
const MAX_POST_BODY_LENGTH = 1000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

type PostRow = {
  id: string;
  author_id: string;
  body: string;
  emoji: string | null;
  image_urls: string[] | null;
  created_at: string;
  updated_at: string;
  profiles?: ProfileRow | null;
};

type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  profiles?: ProfileRow | null;
};

type LikeRow = {
  post_id: string;
  user_id: string;
};

function mapProfile(row?: ProfileRow | null): Profile {
  const username = row?.username || "xiaoji-user";

  return {
    id: row?.id || "",
    username,
    displayName: row?.display_name || username,
    avatarUrl: row?.avatar_url || "",
    bio: row?.bio || "",
  };
}

function validatePostDraft(draft: NewPostDraft) {
  const body = draft.body.trim();

  if (!body) {
    return "文案不能为空。";
  }

  if (body.length > MAX_POST_BODY_LENGTH) {
    return "文案最多 1000 字。";
  }

  if (draft.images.length > MAX_POST_IMAGES) {
    return "每条帖子最多上传 9 张图片。";
  }

  const invalidImage = draft.images.find(
    (image) => image.size > MAX_IMAGE_SIZE || !ALLOWED_IMAGE_TYPES.includes(image.type),
  );

  if (invalidImage) {
    return "图片只支持 JPG、PNG、WebP 或 GIF，单张不能超过 5MB。";
  }

  return "";
}

async function uploadImages(images: File[], userId: string) {
  if (!supabase || images.length === 0) {
    return [];
  }

  const urls: string[] = [];

  for (const image of images) {
    const extension = image.name.split(".").pop() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(POST_IMAGE_BUCKET)
      .upload(path, image, {
        cacheControl: "3600",
        contentType: image.type,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(POST_IMAGE_BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}

export function useCommunity(user: User | null) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    if (!supabase) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [{ data: postRows, error: postError }, { data: commentRows, error: commentError }, { data: likeRows, error: likeError }] =
        await Promise.all([
          supabase
            .from("posts")
            .select("*, profiles:author_id(*)")
            .order("created_at", { ascending: false }),
          supabase
            .from("comments")
            .select("*, profiles:author_id(*)")
            .order("created_at", { ascending: true }),
          supabase.from("post_likes").select("post_id,user_id"),
        ]);

      if (postError) {
        throw postError;
      }

      if (commentError) {
        throw commentError;
      }

      if (likeError) {
        throw likeError;
      }

      const commentsByPost = new Map<string, CommunityComment[]>();

      for (const comment of (commentRows ?? []) as CommentRow[]) {
        const mappedComment: CommunityComment = {
          id: comment.id,
          postId: comment.post_id,
          authorId: comment.author_id,
          body: comment.body,
          createdAt: comment.created_at,
          author: mapProfile(comment.profiles),
        };

        const existing = commentsByPost.get(comment.post_id) ?? [];
        existing.push(mappedComment);
        commentsByPost.set(comment.post_id, existing);
      }

      const likes = ((likeRows ?? []) as LikeRow[]).reduce(
        (accumulator, like) => {
          const current = accumulator.get(like.post_id) ?? {
            count: 0,
            likedByMe: false,
          };

          current.count += 1;
          current.likedByMe = current.likedByMe || like.user_id === user?.id;
          accumulator.set(like.post_id, current);
          return accumulator;
        },
        new Map<string, { count: number; likedByMe: boolean }>(),
      );

      setPosts(
        ((postRows ?? []) as PostRow[]).map((post) => {
          const likeState = likes.get(post.id) ?? { count: 0, likedByMe: false };

          return {
            id: post.id,
            authorId: post.author_id,
            body: post.body,
            emoji: post.emoji || "",
            imageUrls: post.image_urls ?? [],
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            author: mapProfile(post.profiles),
            comments: commentsByPost.get(post.id) ?? [],
            likeCount: likeState.count,
            likedByMe: likeState.likedByMe,
          };
        }),
      );
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "社区内容读取失败。");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const createPost = useCallback(
    async (draft: NewPostDraft) => {
      if (!supabase || !user) {
        throw new Error("请先登录后再发布。");
      }

      const validationError = validatePostDraft(draft);
      if (validationError) {
        throw new Error(validationError);
      }

      const imageUrls = await uploadImages(draft.images, user.id);
      const { error: insertError } = await supabase.from("posts").insert({
        author_id: user.id,
        body: draft.body.trim(),
        emoji: draft.emoji.trim(),
        image_urls: imageUrls,
      });

      if (insertError) {
        throw insertError;
      }

      await loadPosts();
    },
    [loadPosts, user],
  );

  const createComment = useCallback(
    async (postId: string, body: string) => {
      if (!supabase || !user) {
        throw new Error("请先登录后再评论。");
      }

      const trimmedBody = body.trim();
      if (!trimmedBody) {
        throw new Error("评论不能为空。");
      }

      if (trimmedBody.length > 500) {
        throw new Error("评论最多 500 字。");
      }

      const { error: insertError } = await supabase.from("comments").insert({
        author_id: user.id,
        post_id: postId,
        body: trimmedBody,
      });

      if (insertError) {
        throw insertError;
      }

      await loadPosts();
    },
    [loadPosts, user],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (!supabase || !user) {
        throw new Error("请先登录。");
      }

      const { error: deleteError } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("author_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      await loadPosts();
    },
    [loadPosts, user],
  );

  const toggleLike = useCallback(
    async (post: CommunityPost) => {
      if (!supabase || !user) {
        throw new Error("请先登录后再点赞。");
      }

      if (post.likedByMe) {
        const { error: deleteError } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);

        if (deleteError) {
          throw deleteError;
        }
      } else {
        const { error: insertError } = await supabase.from("post_likes").insert({
          post_id: post.id,
          user_id: user.id,
        });

        if (insertError) {
          throw insertError;
        }
      }

      await loadPosts();
    },
    [loadPosts, user],
  );

  return useMemo(
    () => ({
      createComment,
      createPost,
      deleteComment,
      error,
      isLoading,
      posts,
      refresh: loadPosts,
      toggleLike,
    }),
    [createComment, createPost, deleteComment, error, isLoading, loadPosts, posts, toggleLike],
  );
}
