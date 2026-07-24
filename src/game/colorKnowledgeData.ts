// 每日色彩知识库（10条轮播）
// 独立数据文件，便于后续扩展色彩知识内容

export interface ColorKnowledge {
  emoji: string;
  name: string;
  text: string;
}

// 每日色彩知识库（10条按日期循环）
export const COLOR_KNOWLEDGE_DAILY: ColorKnowledge[] = [
  { emoji: '🔴', name: '红色', text: '红色是可见光谱中波长最长的颜色，代表热情与活力。' },
  { emoji: '🔵', name: '蓝色', text: '蓝色是天空和海洋的颜色，代表平静与信任。' },
  { emoji: '🟡', name: '黄色', text: '黄色是最亮的颜色，代表阳光与快乐。' },
  { emoji: '🟢', name: '绿色', text: '绿色位于可见光谱中央，人眼最敏感的颜色。' },
  { emoji: '🟣', name: '紫色', text: '紫色波长最短，历史上象征高贵与神秘。' },
  { emoji: '🟠', name: '橙色', text: '橙色结合红色的热情和黄色的快乐，代表温暖。' },
  { emoji: '🌸', name: '粉色', text: '粉色是红色与白色的混合，代表温柔与浪漫。' },
  { emoji: '🔷', name: '青色', text: '青色介于蓝色和绿色之间，代表清新与科技。' },
  { emoji: '🟤', name: '棕色', text: '棕色代表大地与稳重，是咖啡和巧克力的颜色。' },
  { emoji: '⚫', name: '灰色', text: '灰色是黑色和白色的混合，代表中性与平衡。' },
];
