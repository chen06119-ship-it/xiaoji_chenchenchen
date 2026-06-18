import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { User } from "@supabase/supabase-js";
import { useCommunity } from "../hooks/useCommunity";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types/community";

type ProfilePageProps = {
  currentProfile: Profile | null;
  onProfileSaved: () => Promise<Profile | null>;
  profileId?: string;
  user: User | null;
};

export function ProfilePage({
  currentProfile,
  onProfileSaved,
  profileId,
  user,
}: ProfilePageProps) {
  const [viewedProfile, setViewedProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState(currentProfile?.username ?? "");
  const [displayName, setDisplayName] = useState(currentProfile?.displayName ?? "");
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatarUrl ?? "");
  const [bio, setBio] = useState(currentProfile?.bio ?? "");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const community = useCommunity(user);
  const targetProfile = profileId ? viewedProfile : currentProfile;
  const isOwnProfile = !profileId || profileId === user?.id;

  const profilePosts = useMemo(
    () => community.posts.filter((post) => post.authorId === targetProfile?.id),
    [community.posts, targetProfile?.id],
  );

  useEffect(() => {
    setUsername(currentProfile?.username ?? "");
    setDisplayName(currentProfile?.displayName ?? "");
    setAvatarUrl(currentProfile?.avatarUrl ?? "");
    setBio(currentProfile?.bio ?? "");
  }, [currentProfile]);

  useEffect(() => {
    if (!profileId || !supabase) {
      setViewedProfile(null);
      return;
    }

    supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setViewedProfile(null);
          return;
        }

        const row = data as {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
        };
        const fallbackUsername = row.username || "xiaoji-user";
        setViewedProfile({
          id: row.id,
          username: fallbackUsername,
          displayName: row.display_name || fallbackUsername,
          avatarUrl: row.avatar_url || "",
          bio: row.bio || "",
        });
      });
  }, [profileId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase || !user) {
      setMessage("请先登录后再编辑资料。");
      return;
    }

    if (!username.trim()) {
      setMessage("用户名不能为空。");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.from("profiles").upsert({
        avatar_url: avatarUrl.trim(),
        bio: bio.trim(),
        display_name: displayName.trim() || username.trim(),
        id: user.id,
        updated_at: new Date().toISOString(),
        username: username.trim(),
      });

      if (error) {
        throw error;
      }

      await onProfileSaved();
      setMessage("资料已保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "资料保存失败。");
    } finally {
      setIsSaving(false);
    }
  }

  if (!targetProfile && profileId) {
    return (
      <main className="profile-page">
        <a className="back-link" href="/community">
          返回社区
        </a>
        <section className="profile-panel">
          <p className="eyebrow">Profile</p>
          <h1>没有找到这位用户</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <a className="back-link" href="/community">
        返回社区
      </a>

      <section className="profile-panel" aria-labelledby="profile-title">
        <div className="profile-summary">
          {targetProfile?.avatarUrl ? (
            <img src={targetProfile.avatarUrl} alt="" />
          ) : (
            <span>{targetProfile?.displayName.slice(0, 1) || "小"}</span>
          )}
          <div>
            <p className="eyebrow">Profile</p>
            <h1 id="profile-title">{targetProfile?.displayName || "我的资料"}</h1>
            <p>@{targetProfile?.username || "xiaoji-user"}</p>
            {targetProfile?.bio ? <p>{targetProfile.bio}</p> : null}
          </div>
        </div>

        {isOwnProfile ? (
          <form className="profile-form" onSubmit={handleSubmit}>
            <label>
              用户 ID
              <input
                maxLength={32}
                onChange={(event) => setUsername(event.target.value)}
                type="text"
                value={username}
              />
            </label>
            <label>
              昵称
              <input
                maxLength={40}
                onChange={(event) => setDisplayName(event.target.value)}
                type="text"
                value={displayName}
              />
            </label>
            <label>
              头像链接
              <input
                onChange={(event) => setAvatarUrl(event.target.value)}
                type="text"
                value={avatarUrl}
              />
            </label>
            <label>
              简介
              <textarea
                maxLength={160}
                onChange={(event) => setBio(event.target.value)}
                rows={4}
                value={bio}
              />
            </label>
            {message ? <p className="form-error">{message}</p> : null}
            <button type="submit" disabled={isSaving || !user}>
              {isSaving ? "保存中..." : "保存资料"}
            </button>
          </form>
        ) : null}
      </section>

      <section className="profile-posts" aria-labelledby="profile-posts-title">
        <h2 id="profile-posts-title">发布过的帖子</h2>
        {profilePosts.length === 0 ? (
          <p className="empty-state">这里还没有公开帖子。</p>
        ) : (
          profilePosts.map((post) => (
            <article className="profile-post" key={post.id}>
              <p>{post.body}</p>
              <small>{new Date(post.createdAt).toLocaleString("zh-CN")}</small>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
