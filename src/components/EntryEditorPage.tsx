import { useState, type FormEvent } from "react";
import type { DuckEntry, DuckEntryDraft } from "../data/duckEntries";

type EntryEditorPageProps = {
  entry?: DuckEntry;
  mode: "create" | "edit";
  onSave: (draft: DuckEntryDraft) => void;
};

type EntryFormState = {
  date: string;
  title: string;
  stage: string;
  summary: string;
  notes: string;
  tags: string;
  weight: string;
  diet: string;
  status: string;
  image: string;
  imageAlt: string;
};

const today = new Date().toISOString().slice(0, 10);

function getInitialState(entry?: DuckEntry): EntryFormState {
  return {
    date: entry?.date ?? today,
    title: entry?.title ?? "",
    stage: entry?.stage ?? "新的现状",
    summary: entry?.summary ?? "",
    notes: entry?.notes.join("\n\n") ?? "",
    tags: entry?.tags.join("，") ?? "",
    weight: entry?.metrics.find((metric) => metric.label === "体重")?.value ?? "待记录",
    diet: entry?.metrics.find((metric) => metric.label === "饮食")?.value ?? "待记录",
    status: entry?.metrics.find((metric) => metric.label === "状态")?.value ?? "待记录",
    image: entry?.image ?? "",
    imageAlt: entry?.imageAlt ?? "小鸡成长记录的照片占位",
  };
}

function splitList(value: string) {
  return value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitNotes(value: string) {
  return value
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function EntryEditorPage({ entry, mode, onSave }: EntryEditorPageProps) {
  const [form, setForm] = useState(() => getInitialState(entry));
  const [error, setError] = useState("");
  const isEditingMissingEntry = mode === "edit" && !entry;

  function updateField(field: keyof EntryFormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.date || !form.title.trim() || !form.summary.trim()) {
      setError("日期、标题和摘要是必填项。");
      return;
    }

    const notes = splitNotes(form.notes);
    const draft: DuckEntryDraft = {
      date: form.date,
      title: form.title.trim(),
      stage: form.stage.trim() || "新的现状",
      summary: form.summary.trim(),
      imageAlt: form.imageAlt.trim() || "小鸡成长记录的照片占位",
      image: form.image.trim() || undefined,
      metrics: [
        { label: "体重", value: form.weight.trim() || "待记录" },
        { label: "饮食", value: form.diet.trim() || "待记录" },
        { label: "状态", value: form.status.trim() || "待记录" },
      ],
      tags: splitList(form.tags),
      notes: notes.length > 0 ? notes : [form.summary.trim()],
    };

    onSave(draft);
  }

  if (isEditingMissingEntry) {
    return (
      <main className="editor-page">
        <a className="back-link" href="/">
          返回成长首页
        </a>
        <section className="editor-panel">
          <p className="eyebrow">Edit Record</p>
          <h1>没有找到要编辑的记录</h1>
          <p>这条记录可能已经不存在。你可以回到照片故事墙重新选择。</p>
        </section>
      </main>
    );
  }

  return (
    <main className="editor-page">
      <a className="back-link" href={entry ? `/records/${entry.id}` : "/"}>
        {entry ? "返回这篇记录" : "返回成长首页"}
      </a>

      <section className="editor-panel" aria-labelledby="editor-title">
        <p className="eyebrow">{mode === "create" ? "New Record" : "Edit Record"}</p>
        <h1 id="editor-title">{mode === "create" ? "新建小鸡现状" : "编辑小鸡记录"}</h1>
        <p className="editor-panel__lead">
          这里保存的是首页成长档案，会先写入当前浏览器。多人互动内容请使用社区页发帖。
        </p>

        <form className="entry-form" onSubmit={handleSubmit}>
          {error ? <p className="form-error">{error}</p> : null}

          <label>
            日期
            <input
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              required
            />
          </label>

          <label>
            标题
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="比如：今天学会追着人跑"
              required
            />
          </label>

          <label>
            阶段
            <input
              type="text"
              value={form.stage}
              onChange={(event) => updateField("stage", event.target.value)}
              placeholder="比如：学走路、长羽毛、游水练习"
            />
          </label>

          <label className="entry-form__wide">
            摘要
            <textarea
              value={form.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              placeholder="用一两句话概括今天的小鸡现状"
              required
            />
          </label>

          <label className="entry-form__wide">
            文字记录
            <textarea
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="这里可以写更长的日记。空一行会分成新的段落。"
              rows={7}
            />
          </label>

          <label>
            体重
            <input
              type="text"
              value={form.weight}
              onChange={(event) => updateField("weight", event.target.value)}
            />
          </label>

          <label>
            饮食
            <input
              type="text"
              value={form.diet}
              onChange={(event) => updateField("diet", event.target.value)}
            />
          </label>

          <label>
            状态
            <input
              type="text"
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
            />
          </label>

          <label>
            标签
            <input
              type="text"
              value={form.tags}
              onChange={(event) => updateField("tags", event.target.value)}
              placeholder="用逗号分隔，比如：游水，好奇"
            />
          </label>

          <label className="entry-form__wide">
            图片路径
            <input
              type="text"
              value={form.image}
              onChange={(event) => updateField("image", event.target.value)}
              placeholder="/images/first-swim.jpg"
            />
          </label>

          <label className="entry-form__wide">
            图片描述
            <input
              type="text"
              value={form.imageAlt}
              onChange={(event) => updateField("imageAlt", event.target.value)}
            />
          </label>

          <div className="entry-form__actions">
            <button type="submit">{mode === "create" ? "保存新记录" : "保存修改"}</button>
            <a href={entry ? `/records/${entry.id}` : "/"}>取消</a>
          </div>
        </form>
      </section>
    </main>
  );
}
