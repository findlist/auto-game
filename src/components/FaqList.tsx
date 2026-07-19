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
        <div className="faq-question">🎨 色彩排序是什么游戏?</div>
        <div className="faq-answer">色彩排序是一款经典的液体排序解谜游戏,玩家需要将不同颜色的液体倒入试管中,使每种颜色归到同一个试管即可过关。游戏包含100关、每日挑战、周挑战、无尽模式和限时挑战。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">💰 色彩排序游戏免费吗?</div>
        <div className="faq-answer">完全免费!无需注册、无需登录,打开网页即可游玩。所有关卡和模式均免费开放。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📱 支持手机游玩吗?</div>
        <div className="faq-answer">支持!色彩排序完美适配手机、平板和桌面端,移动端支持触摸操作,长按试管可撤销上一步。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📡 可以离线游玩吗?</div>
        <div className="faq-answer">可以!色彩排序是PWA应用,支持离线游玩。游戏进度和成绩保存在本地,刷新不丢失。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">⭐ 星级评价怎么计算?</div>
        <div className="faq-answer">三星:达到或超过最优步数;二星:步数不超过最优的1.5倍;一星:超过1.5倍但通关。追求三星通关吧!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">💡 提示道具怎么获取?</div>
        <div className="faq-answer">每日登录自动领取1个提示道具,每日签到也可获得。提示道具上限为5个,合理使用哦!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎮 色彩排序有哪些游戏模式?</div>
        <div className="faq-answer">色彩排序包含五种模式:100关闯关模式、每天一题的每日挑战、每周一题的周挑战、难度无限递增的无尽模式(每过5关奖励提示道具)、120秒极限的限时挑战模式(同样每过5关奖励提示道具)。每种模式都有独特的乐趣!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🏆 成就系统怎么玩?</div>
        <div className="faq-answer">色彩排序拥有丰富的成就系统,包含通关进度、技巧挑战、速度成就、每日签到、收集成就等多个分类。在首页点击🏆成就按钮查看所有成就和进度。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🔧 有关卡编辑器吗?</div>
        <div className="faq-answer">有!色彩排序内置关卡编辑器,玩家可以自创关卡、导入和导出关卡码、验证关卡合法性。在首页点击🔧编辑器按钮即可使用。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🏆 什么是周挑战?</div>
        <div className="faq-answer">周挑战是每周更新一次的高难度关卡,使用7色+3空管配置。完成周挑战可累积连胜记录,连续完成多周可解锁专属成就。每周一更新新关卡!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎁 周末奖励怎么领?</div>
        <div className="faq-answer">周六和周日登录游戏,首页会出现「周末免费提示道具」横幅,点击即可免费领取1个提示道具。每个周末只能领取一次哦!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🧠 色彩记忆配对怎么玩?</div>
        <div className="faq-answer">在色彩百科页面可以找到色彩记忆配对小游戏,翻开卡片找到相同颜色的配对,用最少步数完成所有配对即可获胜,锻炼你的记忆力和色彩辨识能力!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎵 色彩序列记忆怎么玩?</div>
        <div className="faq-answer">在色彩百科页面可以找到色彩序列记忆游戏,类似 Simon Says 玩法。观察颜色亮起的顺序,然后按相同顺序点击,每过一关序列增加一个颜色,到达第5关和第10关可解锁专属成就!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">⚡ 色彩反应力测试怎么玩?</div>
        <div className="faq-answer">在色彩百科页面可以找到色彩反应力测试,屏幕显示颜色名称后快速点击对应色块,共8轮挑战,测试你的反应速度和色彩辨识力!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">⏱️ 配对游戏有计时模式吗?</div>
        <div className="faq-answer">有!色彩记忆配对游戏新增计时模式,简单60秒、普通90秒、困难120秒内完成所有配对,挑战你的记忆力和速度极限!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">👶 适合儿童游玩吗?</div>
        <div className="faq-answer">非常适合!色彩排序操作简单直观,能锻炼儿童的逻辑思维能力和颜色辨识能力。游戏无暴力内容、无内购,是儿童益智教育的理想选择。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎭 颜色混合器有什么用?</div>
        <div className="faq-answer">在色彩百科页面可以体验交互式颜色混合器,选择1-3种颜色实时查看混合结果,了解色彩混合原理。使用10次以上可解锁「混合大师」成就!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🔍 百科页怎么搜索内容?</div>
        <div className="faq-answer">色彩百科页面顶部新增搜索框,输入关键词即可快速查找颜色知识、色彩理论和趣味问答,还提供分类导航标签一键跳转到对应板块。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📤 每日问答可以分享吗?</div>
        <div className="faq-answer">可以!答题完成后点击分享按钮,可将答题结果和累计成绩生成分享文案,支持复制到剪贴板或原生分享,方便分享给朋友!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">👁 百科页有浏览记录吗?</div>
        <div className="faq-answer">有!色彩百科页面会自动记录你点击查看过的颜色,在颜色详解区域顶部显示「最近浏览」色块,方便快速回看。浏览5种以上颜色可解锁「百科探索者」成就!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📚 每日问答题库有多少题?</div>
        <div className="faq-answer">每日色彩问答现已扩充至50题,涵盖颜色科学、色彩心理学、自然现象、历史文化等丰富知识,50天循环不重复,每天一题涨知识!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🔥 连续答题有什么奖励?</div>
        <div className="faq-answer">每日问答连续答题会显示天数徽章!连续3天获得⭐,7天获得🔥,14天获得💎,30天获得🏆。坚持每天答题,解锁更高等级徽章!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">⏱️ 配对游戏怎么记录最佳用时?</div>
        <div className="faq-answer">色彩记忆配对游戏在非计时模式下会自动记录最佳用时!完成游戏后结算页显示用时和最快记录对比,不同难度分别记录,挑战自己的速度极限!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🧭 首页快捷导航怎么用?</div>
        <div className="faq-answer">首页底部「探索更多」区域提供6个功能入口卡片,包括色彩百科、成就大厅、游戏统计、关卡编辑器、每日挑战和玩法教程,一键直达想要的功能页面!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📊 每日问答有难度统计吗?</div>
        <div className="faq-answer">有!答题后结算页展示简单、中等、困难三个难度的分别正确率,帮助你了解薄弱环节。问答历史保存最近90天记录。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">💡 小贴士可以手动切换吗?</div>
        <div className="faq-answer">可以!首页小贴士卡片右侧有上/下箭头按钮,点击可手动浏览全部30条策略小贴士,不再只限于每天看一条。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🏆 色彩辨识测试有最佳记录吗?</div>
        <div className="faq-answer">有!色彩辨识测试会自动记录历史最佳分数,结算页展示新纪录提示或历史最佳对比,激励不断提升色觉辨识能力。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📈 每日问答可以看到答题趋势吗?</div>
        <div className="faq-answer">可以!答题后结算页展示最近7天的答题趋势图,每个日期显示正确或错误状态,并用颜色区分难度,直观了解近期表现。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎉 序列记忆游戏有关卡奖励吗?</div>
        <div className="faq-answer">有!序列记忆游戏在第5关、第10关、第15关达成时触发彩带庆祝动画和音效,为你的记忆里程碑喝彩!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🔊 音效可以快捷开关吗?</div>
        <div className="faq-answer">可以!首页右上角有悬浮音效切换按钮,点击即可快速开启或关闭音效,无需进入设置页面。关闭音效时会同时停止背景音乐。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">💾 序列记忆进度可以保存吗?</div>
        <div className="faq-answer">可以!序列记忆游戏会自动保存当前进度,中途中断后下次进入时会提示恢复,从中断的关卡继续挑战。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📋 颜色混合配方可以分享吗?</div>
        <div className="faq-answer">可以!在色彩混合器中选择2-3种颜色后,点击"保存配方"按钮,配方会保存到本地并自动复制分享文案到剪贴板。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🏆 连续答题有什么特殊成就?</div>
        <div className="faq-answer">每日色彩问答连续答题30天可解锁「色彩智者」成就,连续100天可解锁「色彩圣贤」成就!坚持每天答题,成为色彩知识达人!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📂 保存的配方在哪里查看?</div>
        <div className="faq-answer">保存混合配方后,首页会自动显示「我的混合配方」入口卡片,点击即可弹窗查看所有已保存的配色配方,包括颜色组合、结果名称和RGB值。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📊 色彩能力档案是什么?</div>
        <div className="faq-answer">色彩百科页面新增色彩能力档案卡片,展示辨识测试、反应测试、序列记忆和配对游戏四项最佳成绩的对比进度条,帮助你了解色彩能力的强弱项。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎨 成就可以按百科游戏筛选吗?</div>
        <div className="faq-answer">可以!成就页面新增「百科游戏」分类筛选标签,包含色彩辨识、序列记忆、配对、反应力、混合器、问答等相关成就,每个分类显示独立解锁进度条。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📖 每日问答有错题本吗?</div>
        <div className="faq-answer">有!每日问答答错后会自动记录到错题本,点击「查看错题本」按钮可以回顾所有答错的题目、正确答案和详细解析,帮助你学习色彩知识,避免再犯同样错误。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎚️ 配对游戏可以自定义难度吗?</div>
        <div className="faq-answer">可以!色彩记忆配对游戏除了简单、普通、困难三档预设难度外,还新增自定义难度,通过滑块选择4到12对卡牌,自由调节挑战强度。自定义难度也会独立记录最佳成绩。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">⚡ 网站加载速度快吗?</div>
        <div className="faq-answer">色彩排序网站经过性能优化,首屏加载不到3秒,单页JS体积控制在300KB以内。更新日志和FAQ等非首屏内容采用懒加载技术,确保快速加载体验。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🔍 色彩辨识测试有错题本吗?</div>
        <div className="faq-answer">有!色彩辨识测试答错后会自动记录到错题本,结算页点击查看错题本可以回顾所有答错的颜色对比,包括正确颜色和你选择的颜色,支持清空记录重新开始。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🕒 成就页面有时间线视图吗?</div>
        <div className="faq-answer">有!成就页面新增时间线视图,按日期分组展示最近解锁的20个成就,包括解锁时间,方便回顾你的成就解锁历程。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📅 色彩百科有季节推荐吗?</div>
        <div className="faq-answer">有!色彩百科页面根据当前季节和节日动态推荐应景色彩专题,如春季推荐嫩绿花色、夏季推荐阳光海洋色、秋季推荐丰收落叶色、冬季推荐白雪红绿色,春节和情人节也有专属推荐。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📊 每日问答有答题日历吗?</div>
        <div className="faq-answer">有!每日问答结算页面新增30天答题日历热力图,按难度颜色区分正确(绿/橙/红)、错误和未答题日期,直观展示你的答题坚持情况和正确率趋势。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎵 可以在首页快速开关背景音乐吗?</div>
        <div className="faq-answer">可以!首页右上角新增BGM快捷切换按钮,独立于音效开关,方便随时开启或关闭背景音乐,无需进入设置页面。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🔥 统计页面有活跃热力图吗?</div>
        <div className="faq-answer">有!统计页面新增30天访问活跃热力图,类似GitHub贡献图,用颜色深浅展示每天的访问频次,帮助你直观了解自己的游玩活跃度。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🏆 成就页面有目标提示吗?</div>
        <div className="faq-answer">有!成就页面新增"最近解锁"和"下一个目标"提示卡片,展示你最近获得的成就和下一个待解锁的成就目标,激励持续挑战。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">⏸️ 游戏可以暂停吗?</div>
        <div className="faq-answer">可以!点击暂停按钮或按空格/P键即可暂停游戏,暂停时计时冻结、操作锁定,恢复后继续游戏,方便随时休息。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">⭐ 3星通关有特殊效果吗?</div>
        <div className="faq-answer">有!3星通关时结算卡片会显示旋转光芒庆祝特效,星星弹出时还有光晕扩散动画,为你的完美表现喝彩!</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">⬆️ 百科页面有返回顶部按钮吗?</div>
        <div className="faq-answer">有!色彩百科页面内容较多,滚动超过300px时右下角会出现返回顶部浮动按钮,点击平滑滚动回页面顶部。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🔄 首页可以快速重玩上一关吗?</div>
        <div className="faq-answer">可以!首页新增快速重玩上一关入口卡片,显示最近通关的关卡号和星级评价,点击即可快速重玩。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎯 什么是每日目标系统?</div>
        <div className="faq-answer">每日目标系统提供4个小目标:完成3关、获得6颗星、完成每日挑战、不使用提示通关1关。完成后可领取提示道具奖励,每天自动重置。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🔥 连续通关连击怎么计算?</div>
        <div className="faq-answer">普通模式连续通关会累积连击数,在游戏页面显示连击徽章。返回首页会重置连击,但撤销操作不影响连击。连击数越多越能展示您的实力。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📊 首页今日概览卡片展示什么?</div>
        <div className="faq-answer">今日概览卡片展示您当天的通关数、获得星数和连击数,帮助您直观了解每日游玩进度,当有数据时才显示。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎉 连击里程碑有什么庆祝效果?</div>
        <div className="faq-answer">连续通关达到3、5、7、10、15、20连击时会弹出庆祝弹窗,配合动画和音效,每个里程碑有不同颜色和文案,20连击将获得"色彩排序之王"称号。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🏆 连击和每日目标有成就吗?</div>
        <div className="faq-answer">有!连击方面新增单次5/10/20连击和累计50/100/200连击共6个成就,每日目标方面新增首个目标完成、全目标完成、连续7天全目标完成3个成就,合计9个新成就等你解锁。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📊 每日目标进度条有什么用?</div>
        <div className="faq-answer">每日目标卡片新增整体进度条和单目标进度条,进度条带平滑动画,完成时颜色从橙色变为绿色,直观展示目标完成进度。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">⏱ 限时模式有里程碑奖励吗?</div>
        <div className="faq-answer">有!限时模式和无尽模式一样,每过5关奖励1个提示道具,鼓励玩家在120秒内挑战更多关卡。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">👆 新手玩家有什么引导？</div>
        <div className="faq-answer">第1关未操作时显示动画箭头引导点击试管，首次倒水成功后显示"做得好！"鼓励提示；第2关显示操作提示"点击试管选择，再点目标试管倒水"；第3关显示策略提示"优先把一种颜色全部倒进一根试管"；第4关显示多色提示"颜色变多了！先从最上面的颜色开始整理"；第5关显示规划提示"倒水前先想好顺序，避免堵住出口"。前5关渐进式引导，帮助新手逐步掌握技巧。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🏆 成就有稀有度等级吗？</div>
        <div className="faq-answer">有！成就分为普通、稀有、史诗、传说四个稀有度等级。不同稀有度解锁时播放差异化音效（普通清脆两音、稀有上行琶音、史诗华彩四音、传说宏大五音），成就页面显示对应颜色徽章和边框光效。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🎯 每日目标完成有动画效果吗？</div>
        <div className="faq-answer">有！目标完成时播放打钩弹跳动画、进度条充能光效和领取按钮脉冲提示。全部目标完成时，进度条变为彩虹渐变色并触发粒子飘落庆祝动画，增强成就感。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">🔍 成就可以按稀有度筛选吗？</div>
        <div className="faq-answer">可以！成就页面支持按稀有度（普通/稀有/史诗/传说）筛选，还提供稀有度统计面板，直观展示各稀有度的解锁进度和完成率。</div>
      </div>
      <div className="faq-item">
        <div className="faq-question">📊 关卡选择区有进度概览吗？</div>
        <div className="faq-answer">有！关卡选择区域顶部新增总体进度概览条，展示通关数（如35/100）、总星数和当前最高关卡，以及可视化进度条，让你一目了然地了解整体进度。</div>
      </div>
    </div>
  );
};

export default FaqList;
