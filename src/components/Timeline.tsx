import type { DuckEntry } from "../data/duckEntries";

type TimelineProps = {
  entries: DuckEntry[];
};

export function Timeline({ entries }: TimelineProps) {
  return (
    <section className="section timeline-section" aria-labelledby="timeline-title">
      <div className="section__heading">
        <p className="eyebrow">Growth Timeline</p>
        <h2 id="timeline-title">成长时间线</h2>
      </div>

      <ol className="timeline">
        {entries.map((entry) => (
          <li className="timeline__item" key={entry.id}>
            <article className="timeline__card">
              <div className="timeline__date">{entry.date}</div>
              <p className="timeline__stage">{entry.stage}</p>
              <h3>{entry.title}</h3>
              <p>{entry.summary}</p>
              <div className="tags" aria-label={`${entry.title} 标签`}>
                {entry.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
