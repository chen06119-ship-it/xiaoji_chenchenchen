import { duckProfile } from "./data/duckEntries";
import { AuthPage } from "./components/AuthPage";
import { EntryEditorPage } from "./components/EntryEditorPage";
import { Hero } from "./components/Hero";
import { MetricsPanel } from "./components/MetricsPanel";
import { RecordPage } from "./components/RecordPage";
import { StoryWall } from "./components/StoryWall";
import { Timeline } from "./components/Timeline";
import { useAuth, type AuthProfile } from "./hooks/useAuth";
import { useDuckEntries } from "./hooks/useDuckEntries";
import { supabase } from "./lib/supabase";

export function App() {
  const { entries, createEntry, updateEntry } = useDuckEntries();
  const { profile } = useAuth();
  const pathname = window.location.pathname;
  const authRoute = pathname === "/login";
  const newRecordRoute = pathname === "/records/new";
  const editMatch = pathname.match(/^\/records\/([^/]+)\/edit$/);
  const recordMatch = pathname.match(/^\/records\/([^/]+)$/);
  const selectedEntry = recordMatch
    ? entries.find((entry) => entry.id === recordMatch[1])
    : undefined;
  const editingEntry = editMatch
    ? entries.find((entry) => entry.id === editMatch[1])
    : undefined;

  if (authRoute) {
    return (
      <>
        <SiteHeader homeHref="/" profile={profile} />
        <AuthPage />
      </>
    );
  }

  if (newRecordRoute) {
    return (
      <>
        <SiteHeader homeHref="/" profile={profile} />
        <EntryEditorPage
          mode="create"
          onSave={(draft) => {
            const entry = createEntry(draft);
            window.location.href = `/records/${entry.id}`;
          }}
        />
      </>
    );
  }

  if (editMatch) {
    return (
      <>
        <SiteHeader homeHref="/" profile={profile} />
        <EntryEditorPage
          entry={editingEntry}
          mode="edit"
          onSave={(draft) => {
            updateEntry(editMatch[1], draft);
            window.location.href = `/records/${editMatch[1]}`;
          }}
        />
      </>
    );
  }

  if (recordMatch) {
    return (
      <>
        <SiteHeader homeHref="/" profile={profile} />
        <RecordPage entry={selectedEntry} />
      </>
    );
  }

  return (
    <>
      <SiteHeader homeHref="#top" profile={profile} />

      <main id="top">
        <Hero
          siteTitle={duckProfile.siteTitle}
          duckName={duckProfile.duckName}
          rescueDate={duckProfile.rescueDate}
          status={duckProfile.currentStatus}
          intro={duckProfile.intro}
          entries={entries}
        />
        <StoryWall entries={entries} />
        <Timeline entries={entries} />
        <MetricsPanel entries={entries} />
      </main>
    </>
  );
}

type SiteHeaderProps = {
  homeHref: string;
  profile: AuthProfile | null;
};

function SiteHeader({ homeHref, profile }: SiteHeaderProps) {
  async function handleSignOut() {
    await supabase?.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="site-header">
      <a className="site-header__brand" href={homeHref} aria-label="回到首页">
        {duckProfile.siteTitle}
      </a>
      <nav className="site-header__nav" aria-label="主要导航">
        <a href="/#story-wall-title">照片墙</a>
        <a href="/#timeline-title">时间线</a>
        <a href="/#metrics-title">成长指标</a>
      </nav>
      <div className="site-header__auth">
        {profile ? (
          <>
            <span className="user-chip">
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : null}
              {profile.username}
            </span>
            <button type="button" onClick={handleSignOut}>
              退出
            </button>
          </>
        ) : (
          <a href="/login">登录</a>
        )}
      </div>
    </header>
  );
}
