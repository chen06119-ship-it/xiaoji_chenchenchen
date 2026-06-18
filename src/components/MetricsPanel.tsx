import type { DuckEntry } from "../data/duckEntries";

type MetricsPanelProps = {
  entries: DuckEntry[];
};

export function MetricsPanel({ entries }: MetricsPanelProps) {
  const latest = entries[entries.length - 1];

  if (!latest) {
    return null;
  }

  return (
    <section className="section metrics-section" aria-labelledby="metrics-title">
      <div className="section__heading">
        <p className="eyebrow">Care Notes</p>
        <h2 id="metrics-title">成长指标</h2>
      </div>

      <div className="metrics-layout">
        <article className="metrics-card">
          <p className="metrics-card__label">最新记录</p>
          <h3>{latest.title}</h3>
          <p>{latest.summary}</p>
          <dl className="metrics-list">
            {latest.metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="future-card" aria-labelledby="future-title">
          <p className="metrics-card__label">社区扩展</p>
          <h3 id="future-title">登录、发帖和评论已经接入</h3>
          <p>
            现在可以进入社区页，用 Supabase 保存大家发布的帖子、图片、评论和喜欢。成长记录仍保留在首页，社区负责多人互动。
          </p>
          <ul>
            <li>帖子支持 1000 字以内文案和最多 9 张图片</li>
            <li>评论、点赞会和登录用户关联</li>
            <li>个人资料统一从 Supabase profiles 表读取</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
