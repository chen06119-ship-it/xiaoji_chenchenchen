import { useMemo, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { useCommunity } from "../hooks/useCommunity";
import { isSupabaseConfigured } from "../lib/supabase";
import type { CommunityPost, Profile } from "../types/community";

type CommunityPageProps = {
  profile: Profile | null;
  user: User | null;
};

export function CommunityPage({ profile, user }: CommunityPageProps) {
  const community = useCommunity(user);
  const userPostCount = useMemo(
    () => community.posts.filter((post) => post.authorId === user?.id).length,
    [community.posts, user?.id],
  );

  return (
    <main className="community-page">
      <section className="community-hero" aria-labelledby="community-title">
        <div>
          <p className="eyebrow">Community</p>
          <h1 id="community-title">小鸡朋友圈</h1>
          <p>
            大家可以在这里自由发帖，配图、写文案、留评论，也能点喜欢。第一版先把真实互动跑起来。
          </p>
        </div>
        <div className="community-stats" aria-label="社区统计">
          <span>{community.posts.length} 条帖子</span>
          <span>{userPostCount} 条来自你</span>
        </div>
      </section>

      {!isSupabaseConfigured ? (
        <div className="setup-callout community-callout">
          <strong>社区功能需要 Supabase</strong>
          <p>配置环境变量并运行 `supabase/schema.sql` 后，发帖、图片上传、评论和点赞才会连接到线上数据。</p>
        </div>
      ) : null}

      <PostComposer
        disabled={!user || community.isLoading}
        profile={profile}
        onCreatePost={community.createPost}
      />

      {community.error ? <p className="form-error community-error">{community.error}</p> : null}

      <section className="post-feed" aria-label="社区帖子">
        {community.isLoading ? <p className="empty-state">正在读取社区内容...</p> : null}
        {!community.isLoading && community.posts.length === 0 ? (
          <p className="empty-state">还没有帖子。等第一位朋友把小鸡近况发出来。</p>
        ) : null}
        {community.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            user={user}
            onCreateComment={community.createComment}
            onDeleteComment={community.deleteComment}
            onToggleLike={community.toggleLike}
          />
        ))}
      </section>
    </main>
  );
}

type PostComposerProps = {
  disabled: boolean;
  profile: Profile | null;
  onCreatePost: (draft: { body: string; emoji: string; images: File[] }) => Promise<void>;
};

function PostComposer({ disabled, profile, onCreatePost }: PostComposerProps) {
  const [body, setBody] = useState("");
  const [emoji, setEmoji] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      await onCreatePost({ body, emoji, images });
      setBody("");
      setEmoji("");
      setImages([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "帖子发布失败。");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleImagesChange(fileList: FileList | null) {
    setImages(Array.from(fileList ?? []).slice(0, 9));
  }

  return (
    <section className="composer-card" aria-labelledby="composer-title">
      <div className="composer-card__header">
        <Avatar profile={profile} />
        <div>
          <h2 id="composer-title">发布新帖子</h2>
          <p>{profile ? `以 ${profile.displayName} 的身份发布` : "登录后可以发布帖子、评论和点赞"}</p>
        </div>
      </div>

      <form className="composer-form" onSubmit={handleSubmit}>
        <label>
          文案
          <textarea
            disabled={disabled || isSubmitting}
            maxLength={1000}
            onChange={(event) => setBody(event.target.value)}
            placeholder="今天的小鸡发生了什么？最多 1000 字。"
            rows={5}
            value={body}
          />
        </label>

        <div className="composer-form__row">
          <label>
            心情 emoji
            <input
              disabled={disabled || isSubmitting}
              maxLength={12}
              onChange={(event) => setEmoji(event.target.value)}
              placeholder="🐣"
              type="text"
              value={emoji}
            />
          </label>

          <label>
            图片，最多 9 张
            <input
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={disabled || isSubmitting}
              multiple
              onChange={(event) => handleImagesChange(event.target.files)}
              type="file"
            />
          </label>
        </div>

        <div className="composer-form__meta">
          <span>{body.length}/1000 字</span>
          <span>{images.length}/9 张图片</span>
        </div>

        {message ? <p className="form-error">{message}</p> : null}

        <button type="submit" disabled={disabled || isSubmitting}>
          {profile ? (isSubmitting ? "发布中..." : "发布帖子") : "登录后发布"}
        </button>
      </form>
    </section>
  );
}

type PostCardProps = {
  post: CommunityPost;
  user: User | null;
  onCreateComment: (postId: string, body: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onToggleLike: (post: CommunityPost) => Promise<void>;
};

function PostCard({
  post,
  user,
  onCreateComment,
  onDeleteComment,
  onToggleLike,
}: PostCardProps) {
  const [commentBody, setCommentBody] = useState("");
  const [message, setMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsWorking(true);

    try {
      await onCreateComment(post.id, commentBody);
      setCommentBody("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "评论发布失败。");
    } finally {
      setIsWorking(false);
    }
  }

  async function handleLike() {
    setMessage("");
    setIsWorking(true);

    try {
      await onToggleLike(post);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "点赞失败。");
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    setMessage("");
    setIsWorking(true);

    try {
      await onDeleteComment(commentId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除评论失败。");
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <article className="post-card">
      <header className="post-card__header">
        <a className="profile-link" href={`/users/${post.authorId}`}>
          <Avatar profile={post.author} />
          <span>
            <strong>{post.author.displayName}</strong>
            <small>@{post.author.username}</small>
          </span>
        </a>
        <time>{new Date(post.createdAt).toLocaleString("zh-CN")}</time>
      </header>

      <p className="post-card__body">
        {post.emoji ? <span aria-hidden="true">{post.emoji} </span> : null}
        {post.body}
      </p>

      {post.imageUrls.length > 0 ? (
        <div className="image-grid" data-count={post.imageUrls.length}>
          {post.imageUrls.map((imageUrl) => (
            <img src={imageUrl} alt="帖子图片" key={imageUrl} />
          ))}
        </div>
      ) : null}

      <div className="post-actions">
        <button type="button" disabled={isWorking || !user} onClick={handleLike}>
          {post.likedByMe ? "已喜欢" : "喜欢"} · {post.likeCount}
        </button>
        <span>{post.comments.length} 条评论</span>
      </div>

      <section className="comments" aria-label="评论区">
        {post.comments.map((comment) => (
          <article className="comment" key={comment.id}>
            <Avatar profile={comment.author} />
            <div>
              <p>
                <strong>{comment.author.displayName}</strong>
                <span>{comment.body}</span>
              </p>
              <small>{new Date(comment.createdAt).toLocaleString("zh-CN")}</small>
            </div>
            {comment.authorId === user?.id ? (
              <button
                type="button"
                disabled={isWorking}
                onClick={() => handleDeleteComment(comment.id)}
              >
                删除
              </button>
            ) : null}
          </article>
        ))}

        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <input
            disabled={!user || isWorking}
            maxLength={500}
            onChange={(event) => setCommentBody(event.target.value)}
            placeholder={user ? "写一条评论..." : "登录后可以评论"}
            type="text"
            value={commentBody}
          />
          <button type="submit" disabled={!user || isWorking}>
            发送
          </button>
        </form>
      </section>

      {message ? <p className="form-error">{message}</p> : null}
    </article>
  );
}

function Avatar({ profile }: { profile: Profile | null }) {
  if (profile?.avatarUrl) {
    return <img className="avatar" src={profile.avatarUrl} alt="" />;
  }

  return <span className="avatar avatar--fallback">{profile?.displayName.slice(0, 1) || "小"}</span>;
}
