import type { DuckEntry } from "../data/duckEntries";

type StoryWallProps = {
  entries: DuckEntry[];
};

export function StoryWall({ entries }: StoryWallProps) {
  return (
    <section className="section story-wall-section" aria-labelledby="story-wall-title">
      <div className="section__heading section__heading--with-action">
        <div>
          <p className="eyebrow">Photo Notes</p>
          <h2 id="story-wall-title">照片故事墙</h2>
          <p className="section__lead">
            新增记录会继续追加在这里，不会把原来的 4 条顶掉。点开任意卡片，可以进入单独的文字记录页。
          </p>
        </div>
        <a
          className="icon-action"
          href="/records/new"
          title="新建小鸭现状"
          aria-label="新建小鸭现状"
        >
          +
        </a>
      </div>

      <div className="story-grid">
        {entries.map((entry, index) => (
          <a
            className="story-card"
            href={`/records/${entry.id}`}
            key={entry.id}
            aria-label={`打开${entry.title}的文字记录`}
          >
            <div
              className={`story-card__image story-card__image--${(index % 4) + 1}`}
              role="img"
              aria-label={entry.imageAlt}
            >
              {entry.image ? (
                <img src={entry.image} alt={entry.imageAlt} />
              ) : (
                <span>照片占位</span>
              )}
            </div>
            <div className="story-card__body">
              <p>{entry.date}</p>
              <h3>{entry.title}</h3>
              <span>{entry.stage}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
