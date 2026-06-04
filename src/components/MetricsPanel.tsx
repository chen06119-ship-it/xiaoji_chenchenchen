import type { DuckEntry } from "../data/duckEntries";

type MetricsPanelProps = {
  entries: DuckEntry[];
};

export function MetricsPanel({ entries }: MetricsPanelProps) {
  const latest = entries[entries.length - 1];

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
          <p className="metrics-card__label">后续扩展</p>
          <h3 id="future-title">登录与评论预留</h3>
          <p>
            未来每条成长记录都可以拥有独立评论区。登录用户发表评论，未登录访客安静浏览。
          </p>
          <ul>
            <li>评论会关联到成长记录 ID</li>
            <li>支持审核、删除和简单防刷</li>
            <li>隐藏精确地点，保护救助隐私</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
