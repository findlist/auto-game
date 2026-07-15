import React from 'react';

/**
 * FAQ 常见问题列表组件
 * 独立拆分以降低首屏 bundle 体积
 * 仅在用户展开 FAQ 时懒加载
 */
const FaqList: React.FC = () => {
  return (
    <div className="faq-list">
      <div className="faq-item">
        <div className="faq-question">🎨 色彩排序是什么游戏？</div>
        <div className="faq-answer">色彩排序是一款经典的液体排序解谜游戏，玩家需要将不同颜色的液体倒入试管中，使每种颜色归到同一个试管即可过关。游戏包含100关、每日挑战、周挑战、无尽模式和限时挑战。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">💰 色彩排序游戏免费吗？</div>
        <div className="faq-answer">完全免费！无需注册、无需登录，打开网页即可游玩。所有关卡和模式均免费开放。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📱 支持手机游玩吗？</div>
        <div className="faq-answer">支持！色彩排序完美适配手机、平板和桌面端，移动端支持触摸操作，长按试管可撤销上一步。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📡 可以离线游玩吗？</div>
        <div className="faq-answer">可以！色彩排序是PWA应用，支持离线游玩。游戏进度和成绩保存在本地，刷新不丢失。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">⭐ 星级评价怎么计算？</div>
        <div className="faq-answer">三星：达到或超过最优步数；二星：步数不超过最优的1.5倍；一星：超过1.5倍但通关。追求三星通关吧！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">💡 提示道具怎么获取？</div>
        <div className="faq-answer">每日登录自动领取1个提示道具，每日签到也可获得。提示道具上限为5个，合理使用哦！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎮 色彩排序有哪些游戏模式？</div>
        <div className="faq-answer">色彩排序包含五种模式：100关闯关模式、每天一题的每日挑战、每周一题的周挑战、难度无限递增的无尽模式、120秒极限的限时挑战模式。每种模式都有独特的乐趣！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🏆 成就系统怎么玩？</div>
        <div className="faq-answer">色彩排序拥有丰富的成就系统，包含通关进度、技巧挑战、速度成就、每日签到、收集成就等多个分类。在首页点击🏆成就按钮查看所有成就和进度。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🔧 有关卡编辑器吗？</div>
        <div className="faq-answer">有！色彩排序内置关卡编辑器，玩家可以自创关卡、导入和导出关卡码、验证关卡合法性。在首页点击🔧编辑器按钮即可使用。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🏆 什么是周挑战？</div>
        <div className="faq-answer">周挑战是每周更新一次的高难度关卡，使用7色+3空管配置。完成周挑战可累积连胜记录，连续完成多周可解锁专属成就。每周一更新新关卡！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎁 周末奖励怎么领？</div>
        <div className="faq-answer">周六和周日登录游戏，首页会出现「周末免费提示道具」横幅，点击即可免费领取1个提示道具。每个周末只能领取一次哦！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🧠 色彩记忆配对怎么玩？</div>
        <div className="faq-answer">在色彩百科页面可以找到色彩记忆配对小游戏，翻开卡片找到相同颜色的配对，用最少步数完成所有配对即可获胜，锻炼你的记忆力和色彩辨识能力！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎵 色彩序列记忆怎么玩？</div>
        <div className="faq-answer">在色彩百科页面可以找到色彩序列记忆游戏，类似 Simon Says 玩法。观察颜色亮起的顺序，然后按相同顺序点击，每过一关序列增加一个颜色，到达第5关和第10关可解锁专属成就！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">⚡ 色彩反应力测试怎么玩？</div>
        <div className="faq-answer">在色彩百科页面可以找到色彩反应力测试，屏幕显示颜色名称后快速点击对应色块，共8轮挑战，测试你的反应速度和色彩辨识力！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">⏱️ 配对游戏有计时模式吗？</div>
        <div className="faq-answer">有！色彩记忆配对游戏新增计时模式，简单60秒、普通90秒、困难120秒内完成所有配对，挑战你的记忆力和速度极限！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">👶 适合儿童游玩吗？</div>
        <div className="faq-answer">非常适合！色彩排序操作简单直观，能锻炼儿童的逻辑思维能力和颜色辨识能力。游戏无暴力内容、无内购，是儿童益智教育的理想选择。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎭 颜色混合器有什么用？</div>
        <div className="faq-answer">在色彩百科页面可以体验交互式颜色混合器，选择1-3种颜色实时查看混合结果，了解色彩混合原理。使用10次以上可解锁「混合大师」成就！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🔍 百科页怎么搜索内容？</div>
        <div className="faq-answer">色彩百科页面顶部新增搜索框，输入关键词即可快速查找颜色知识、色彩理论和趣味问答，还提供分类导航标签一键跳转到对应板块。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📤 每日问答可以分享吗？</div>
        <div className="faq-answer">可以！答题完成后点击分享按钮，可将答题结果和累计成绩生成分享文案，支持复制到剪贴板或原生分享，方便分享给朋友！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">👁 百科页有浏览记录吗？</div>
        <div className="faq-answer">有！色彩百科页面会自动记录你点击查看过的颜色，在颜色详解区域顶部显示「最近浏览」色块，方便快速回看。浏览5种以上颜色可解锁「百科探索者」成就！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📚 每日问答题库有多少题？</div>
        <div className="faq-answer">每日色彩问答现已扩充至50题，涵盖颜色科学、色彩心理学、自然现象、历史文化等丰富知识，50天循环不重复，每天一题涨知识！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🔥 连续答题有什么奖励？</div>
        <div className="faq-answer">每日问答连续答题会显示天数徽章！连续3天获得⭐，7天获得🔥，14天获得💎，30天获得🏆。坚持每天答题，解锁更高等级徽章！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">⏱️ 配对游戏怎么记录最佳用时？</div>
        <div className="faq-answer">色彩记忆配对游戏在非计时模式下会自动记录最佳用时！完成游戏后结算页显示用时和最快记录对比，不同难度分别记录，挑战自己的速度极限！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🧭 首页快捷导航怎么用？</div>
        <div className="faq-answer">首页底部「探索更多」区域提供6个功能入口卡片，包括色彩百科、成就大厅、游戏统计、关卡编辑器、每日挑战和玩法教程，一键直达想要的功能页面！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📊 每日问答有难度统计吗？</div>
        <div className="faq-answer">有！答题后结算页展示简单、中等、困难三个难度的分别正确率，帮助你了解薄弱环节。问答历史保存最近90天记录。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">💡 小贴士可以手动切换吗？</div>
        <div className="faq-answer">可以！首页小贴士卡片右侧有上/下箭头按钮，点击可手动浏览全部30条策略小贴士，不再只限于每天看一条。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🏆 色彩辨识测试有最佳记录吗？</div>
        <div className="faq-answer">有！色彩辨识测试会自动记录历史最佳分数，结算页展示新纪录提示或历史最佳对比，激励不断提升色觉辨识能力。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📈 每日问答可以看到答题趋势吗？</div>
        <div className="faq-answer">可以！答题后结算页展示最近7天的答题趋势图，每个日期显示正确或错误状态，并用颜色区分难度，直观了解近期表现。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎉 序列记忆游戏有关卡奖励吗？</div>
        <div className="faq-answer">有！序列记忆游戏在第5关、第10关、第15关达成时触发彩带庆祝动画和音效，为你的记忆里程碑喝彩！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🔊 音效可以快捷开关吗？</div>
        <div className="faq-answer">可以！首页右上角有悬浮音效切换按钮，点击即可快速开启或关闭音效，无需进入设置页面。关闭音效时会同时停止背景音乐。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">💾 序列记忆进度可以保存吗？</div>
        <div className="faq-answer">可以！序列记忆游戏会自动保存当前进度，中途中断后下次进入时会提示恢复，从中断的关卡继续挑战。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📋 颜色混合配方可以分享吗？</div>
        <div className="faq-answer">可以！在色彩混合器中选择2-3种颜色后，点击"保存配方"按钮，配方会保存到本地并自动复制分享文案到剪贴板。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🏆 连续答题有什么特殊成就？</div>
        <div className="faq-answer">每日色彩问答连续答题30天可解锁「色彩智者」成就，连续100天可解锁「色彩圣贤」成就！坚持每天答题，成为色彩知识达人！</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📂 保存的配方在哪里查看？</div>
        <div className="faq-answer">保存混合配方后，首页会自动显示「我的混合配方」入口卡片，点击即可弹窗查看所有已保存的配色配方，包括颜色组合、结果名称和RGB值。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📊 色彩能力档案是什么？</div>
        <div className="faq-answer">色彩百科页面新增色彩能力档案卡片，展示辨识测试、反应测试、序列记忆和配对游戏四项最佳成绩的对比进度条，帮助你了解色彩能力的强弱项。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎨 成就可以按百科游戏筛选吗？</div>
        <div className="faq-answer">可以！成就页面新增「百科游戏」分类筛选标签，包含色彩辨识、序列记忆、配对、反应力、混合器、问答等相关成就，每个分类显示独立解锁进度条。</div>
      </div>
    </div>
  );
};

export default FaqList;
