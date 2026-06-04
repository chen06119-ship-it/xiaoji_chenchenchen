import type { DuckEntry } from "../data/duckEntries";

type RecordPageProps = {
  entry?: DuckEntry;
};

export function RecordPage({ entry }: RecordPageProps) {
  if (!entry) {
    return (
      <main className="record-page">
        <a className="back-link" href="/">
          返回成长首页
        </a>
        <section className="record-article">
          <p className="eyebrow">Record Not Found</p>
          <h1>没有找到这篇记录</h1>
          <p>这条成长记录可能还没有创建。你可以回到首页，从照片故事墙重新进入。</p>
        </section>
      </main>
    );
  }

  return (
    <main className="record-page">
      <div className="record-page__top">
        <a className="back-link" href="/">
          返回成长首页
        </a>
        <a
          className="edit-link"
          href={`/records/${entry.id}/edit`}
          aria-label={`编辑${entry.title}`}
        >
          编辑
        </a>
      </div>

      <article className="record-article" aria-labelledby="record-title">
        <p className="eyebrow">
          {entry.date} · {entry.stage}
        </p>
        <h1 id="record-title">{entry.title}</h1>
        <p className="record-article__summary">{entry.summary}</p>

        <div
          className={`record-article__image ${entry.image ? "record-article__image--photo" : ""}`}
          role="img"
          aria-label={entry.imageAlt}
        >
          {entry.image ? (
            <img src={entry.image} alt={entry.imageAlt} />
          ) : (
            <span>这里以后可以换成真实照片</span>
          )}
        </div>

        <section className="record-article__notes" aria-labelledby="notes-title">
          <h2 id="notes-title">文字记录</h2>
          {entry.notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </section>

        <section className="record-article__meta" aria-label="成长指标和标签">
          <dl className="metrics-list">
            {entry.metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
          <div className="tags">
            {entry.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </section>

        <aside className="comment-placeholder" aria-labelledby="comments-title">
          <h2 id="comments-title">评论区预留</h2>
          <p>
            后续加入登录功能后，这里会变成这篇记录的独立评论区。现在先保留位置，不展示不可用的输入框。
          </p>
        </aside>
      </article>
    </main>
  );
}
