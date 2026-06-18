export type DuckMetric = {
  label: string;
  value: string;
};

export type DuckEntry = {
  id: string;
  date: string;
  title: string;
  summary: string;
  stage: string;
  image?: string;
  imageAlt: string;
  metrics: DuckMetric[];
  tags: string[];
  notes: string[];
};

export type DuckEntryDraft = Omit<DuckEntry, "id">;

export const duckProfile = {
  siteTitle: "小鸡 In'da House!!",
  duckName: "小鸡",
  rescueDate: "2026-06-03",
  currentStatus: "正在适应 303，精神越来越亮堂。",
  intro:
    "这是一只在路边被捡到的黄毛小鸡的成长记录。每一次进食、休息、换羽和学会新本领，都会在这里被轻轻收好。",
};

export const duckEntries: DuckEntry[] = [
  {
    id: "first-meet-road",
    date: "2026-06-03",
    title: "路边第一次看见它",
    summary:
      "夜里的路边，小小一团黄色突然出现在地面上。它看起来很弱小，却也很努力地站在那里。",
    stage: "初遇",
    image: "/images/first-meet.jpg",
    imageAlt: "夜晚路边第一次看见小鸡的照片",
    metrics: [
      { label: "体重", value: "待记录" },
      { label: "饮食", value: "先补水观察" },
      { label: "状态", value: "紧张，需要看护" },
    ],
    tags: ["路边", "初遇", "救助"],
    notes: [
      "这是第一次看到它的时刻。路面很大，小鸡很小，那一瞬间几乎像是故事自己开了头。",
      "之后可以继续补充当时在哪里、天气怎么样、你们是怎么决定把它带回来的。",
    ],
  },
  {
    id: "picked-up",
    date: "2026-06-03",
    title: "被小心捧起来",
    summary:
      "把它抱在手心里，才发现它真的很小。它安静地窝着，像一颗刚从雨夜里捡回来的小太阳。",
    stage: "带回家",
    image: "/images/chick-pick.jpg",
    imageAlt: "小鸡被小心捧在手心里的照片",
    metrics: [
      { label: "体重", value: "待记录" },
      { label: "饮食", value: "先补水观察" },
      { label: "状态", value: "安静，需要保暖" },
    ],
    tags: ["捧起", "保暖", "回家"],
    notes: [
      "这张照片很适合作为救助过程的记录：从路边到手心，它终于暂时安全了一点。",
      "后面可以写下它刚到 303 的反应、有没有叫、有没有害怕。",
    ],
  },
  {
    id: "day-two",
    date: "2026-06-04",
    title: "第二天的小黄团",
    summary:
      "第二天的小鸡看起来更精神了一些，开始适应新的环境，也开始被大家认真惦记着。",
    stage: "适应 303",
    image: "/images/chick-day-2.jpg",
    imageAlt: "小鸡第二天的照片",
    metrics: [
      { label: "体重", value: "待记录" },
      { label: "饮食", value: "少量饮水" },
      { label: "状态", value: "开始放松" },
    ],
    tags: ["第二天", "适应", "观察"],
    notes: [
      "这里可以记录第二天它的变化：精神、走路、叫声、睡觉位置，任何一点细节都很珍贵。",
      "如果之后要做成长对比，这一页会是很好的早期基准。",
    ],
  },
  {
    id: "first-meal",
    date: "2026-06-05",
    title: "第一次安心吃东西",
    summary:
      "它开始靠近食物，虽然吃得还不多，但眼神已经没有最开始那么慌了。",
    stage: "开始进食",
    image: "/images/chick-portrait.jpg",
    imageAlt: "小鸡靠近镜头的照片",
    metrics: [
      { label: "体重", value: "待记录" },
      { label: "饮食", value: "开始进食" },
      { label: "状态", value: "好奇，警觉" },
    ],
    tags: ["进食", "好奇", "安定"],
    notes: [
      "这一页可以写它第一次主动吃东西的细节：吃了什么、吃了多久、有没有明显放松下来。",
      "之后评论区也可以围绕这一天留下朋友们的观察和建议。",
    ],
  },
  {
    id: "food-closeup",
    date: "2026-06-06",
    title: "认真吃饭的小鸡",
    summary:
      "它站在小碗前，盯着食物和镜头，像是在认真确认：今天也有被好好照顾。",
    stage: "胃口稳定",
    image: "/images/chickchick.jpg",
    imageAlt: "小鸡站在食物旁边的照片",
    metrics: [
      { label: "体重", value: "待记录" },
      { label: "饮食", value: "胃口稳定" },
      { label: "状态", value: "活泼许多" },
    ],
    tags: ["吃饭", "稳定", "成长"],
    notes: [
      "这张照片能看出它已经更有精神，也更像在认真探索自己的小世界。",
      "之后可以继续补充它每天喜欢吃什么、什么时候最活跃、有没有新的小习惯。",
    ],
  },
];
