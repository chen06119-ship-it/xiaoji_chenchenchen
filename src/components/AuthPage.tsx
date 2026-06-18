import { useState, type FormEvent } from "react";
import { ensureProfile } from "../hooks/useAuth";
import { isSupabaseConfigured, supabase, usernameToEmail } from "../lib/supabase";

type AuthMode = "login" | "signup";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const trimmedUsername = username.trim();
    const trimmedAvatarUrl = avatarUrl.trim();
    const trimmedBio = bio.trim();

    if (!supabase) {
      setMessage("还没有配置 Supabase。请先设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。");
      return;
    }

    if (!trimmedUsername || password.length < 6) {
      setMessage("用户名不能为空，密码至少 6 位。");
      return;
    }

    setIsSubmitting(true);

    try {
      const email = usernameToEmail(trimmedUsername);
      const result = isSignup
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                avatar_url: trimmedAvatarUrl,
                bio: trimmedBio,
                display_name: trimmedUsername,
                username: trimmedUsername,
              },
            },
          })
        : await supabase.auth.signInWithPassword({
            email,
            password,
          });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      if (result.data.user) {
        await ensureProfile(result.data.user, {
          avatarUrl: trimmedAvatarUrl,
          bio: trimmedBio,
          displayName: trimmedUsername,
          username: trimmedUsername,
        });
      }

      window.location.href = "/community";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "登录处理失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleModeChange() {
    setMode(isSignup ? "login" : "signup");
    setMessage("");
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <p className="eyebrow">{isSignup ? "Create Account" : "Welcome Back"}</p>
        <h1 id="auth-title">{isSignup ? "创建小鸡用户" : "登录小鸡小屋"}</h1>
        <p className="auth-panel__lead">
          使用用户名和密码登录。注册时会同步创建个人资料，后续可以在资料页修改头像、昵称和简介。
        </p>

        {!isSupabaseConfigured ? (
          <div className="setup-callout">
            <strong>还差一步配置</strong>
            <p>
              复制 `.env.example` 为 `.env.local`，填入 Supabase Project URL 和 anon key，然后重启本地服务。
            </p>
          </div>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            用户名 / ID
            <input
              autoComplete="username"
              disabled={isSubmitting}
              maxLength={32}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="xiaoji"
              type="text"
              value={username}
            />
          </label>

          <label>
            密码
            <input
              autoComplete={isSignup ? "new-password" : "current-password"}
              disabled={isSubmitting}
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 6 位"
              type="password"
              value={password}
            />
          </label>

          {isSignup ? (
            <>
              <label>
                头像链接
                <input
                  disabled={isSubmitting}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="/images/chick-pick.jpg 或 https://..."
                  type="text"
                  value={avatarUrl}
                />
              </label>

              <label>
                简介
                <input
                  disabled={isSubmitting}
                  maxLength={120}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="写一句给大家看的介绍"
                  type="text"
                  value={bio}
                />
              </label>
            </>
          ) : null}

          {message ? <p className="form-error">{message}</p> : null}

          <button type="submit" disabled={isSubmitting || !isSupabaseConfigured}>
            {isSubmitting ? "处理中..." : isSignup ? "创建用户" : "登录"}
          </button>
        </form>

        <button className="auth-switch" type="button" onClick={handleModeChange}>
          {isSignup ? "已有账号？去登录" : "没有账号？创建一个"}
        </button>
      </section>
    </main>
  );
}
