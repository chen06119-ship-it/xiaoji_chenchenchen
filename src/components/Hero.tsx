import { useEffect, useState } from "react";
import type { DuckEntry } from "../data/duckEntries";

type HeroProps = {
  siteTitle: string;
  duckName: string;
  rescueDate: string;
  status: string;
  intro: string;
  entries: DuckEntry[];
};

type SlidePosition = "active" | "previous" | "next" | "hidden";

export function Hero({
  siteTitle,
  duckName,
  rescueDate,
  status,
  intro,
  entries,
}: HeroProps) {
  const [activeIndex, setActiveIndex] = useState(Math.max(entries.length - 1, 0));
  const activeEntry = entries[activeIndex];

  useEffect(() => {
    if (entries.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % entries.length);
    }, 8200);

    return () => window.clearInterval(timer);
  }, [entries.length]);

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + entries.length) % entries.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % entries.length);
  }

  function getSlidePosition(index: number): SlidePosition {
    const previousIndex = (activeIndex - 1 + entries.length) % entries.length;
    const nextIndex = (activeIndex + 1) % entries.length;

    if (index === activeIndex) {
      return "active";
    }

    if (index === previousIndex) {
      return "previous";
    }

    if (index === nextIndex) {
      return "next";
    }

    return "hidden";
  }

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__copy">
        <p className="eyebrow">捡到日期 · {rescueDate}</p>
        <h1 id="hero-title">{siteTitle}</h1>
        <p className="hero__name">主角：{duckName}</p>
        <p className="hero__intro">{intro}</p>
        <div className="hero__status" aria-label="当前状态">
          <span>当前状态</span>
          <strong>{status}</strong>
        </div>
        <div className="hero__actions">
          <a href="/community">去社区看看</a>
          <a href="/records/new">新增成长记录</a>
        </div>
      </div>

      <div className="storybook" aria-label="小鸡成长图片轮播" aria-live="polite">
        <div className="storybook__track">
          {entries.map((entry, index) => {
            const position = getSlidePosition(index);

            return (
              <article
                className={`storybook__slide storybook__slide--${index + 1} storybook__slide--${position}`}
                key={entry.id}
                aria-hidden={position !== "active"}
              >
                {entry.image ? (
                  <img src={entry.image} alt={entry.imageAlt} />
                ) : (
                  <>
                    <div className="storybook__sun" />
                    <div className="storybook__cloud storybook__cloud--one" />
                    <div className="storybook__cloud storybook__cloud--two" />
                    <div className="storybook__pond">
                      <div className="storybook__duck">
                        <div className="storybook__wing" />
                        <div className="storybook__eye" />
                        <div className="storybook__beak" />
                      </div>
                    </div>
                  </>
                )}
              </article>
            );
          })}
        </div>

        {activeEntry ? (
          <div className="storybook__caption">
            <span>
              {activeEntry.date} · {activeEntry.stage}
            </span>
            <strong>{activeEntry.title}</strong>
          </div>
        ) : null}

        <div className="storybook__controls" aria-label="轮播控制">
          <button type="button" onClick={showPrevious} aria-label="上一张成长图片">
            ‹
          </button>
          <button type="button" onClick={showNext} aria-label="下一张成长图片">
            ›
          </button>
        </div>

        <div className="storybook__dots" aria-label="轮播分页">
          {entries.map((entry, index) => (
            <button
              type="button"
              className={activeIndex === index ? "is-active" : ""}
              key={entry.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`查看${entry.title}`}
              aria-current={activeIndex === index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
