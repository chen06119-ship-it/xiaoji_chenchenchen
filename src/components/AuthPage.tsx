import { useState, type FormEvent } from "react";
import { isSupabaseConfigured, supabase, usernameToEmail } from "../lib/supabase";

type AuthMode = "login" | "signup";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("还没有配置 Supabase。请先添加 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。");
      return;
    }

    if (!username.trim() || password.length < 6) {
      setMessage("用户名不能为空，密码至少 6 位。");
      return;
    }

    setIsSubmitting(true);

    const email = usernameToEmail(username);
    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                avatar_url: avatarUrl.trim(),
                username: username.trim(),
              },
            },
          })
        : await supabase.auth.signInWithPassword({
            email,
            password,
          });

    setIsSubmitting(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <p className="eyebrow">{mode === "login" ? "Welcome Back" : "Create User"}</p>
        <h1 id="auth-title">{mode === "login" ? "登录小鸡小屋" : "创建小鸡用户"}</h1>
        <p className="auth-panel__lead">
          这里只需要用户名、密码和头像。底层会用 Supabase 安全保存账号，不在前端保存密码。
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
            用户名
            <input
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="xiaoji"
              type="text"
              value={username}
            />
          </label>

          <label>
            密码
            <input
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 6 位"
              type="password"
              value={password}
            />
          </label>

          {mode === "signup" ? (
            <label>
              头像链接
              <input
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="/images/chick-pick.jpg 或 https://..."
                type="text"
                value={avatarUrl}
              />
            </label>
          ) : null}

          {message ? <p className="form-error">{message}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "处理中..." : mode === "login" ? "登录" : "创建用户"}
          </button>
        </form>

        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setMessage("");
          }}
        >
          {mode === "login" ? "没有账号？创建一个" : "已有账号？去登录"}
        </button>
      </section>
    </main>
  );
}
