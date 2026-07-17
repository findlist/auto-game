import React from 'react';

interface AboutPageProps {
  onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="app">
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <h1 className="game-title">关于</h1>
        <div className="header-spacer" />
      </header>
      <main className="info-page">
        <h2>🎨 色彩排序</h2>
        <p>一款经典好玩的颜色排序益智游戏。通过逻辑推理将混乱的颜色归类到试管中，挑战你的思维与耐心。</p>

        <h3>玩法说明</h3>
        <ul>
          <li>点击试管选中，再点击其他试管倒入颜色</li>
          <li>只能将颜色倒入空管或顶部颜色相同的试管</li>
          <li>试管容量有限，不能超出上限</li>
          <li>将所有颜色在试管中分类整理即获胜</li>
        </ul>

        <h3>游戏特色</h3>
        <div className="feature-section">
          <h4>🎯 游戏模式</h4>
          <ul>
            <li>100关闯关模式，难度循序渐进（入门→大师）</li>
            <li>📅 每日挑战，全球同一关卡，本地排行榜</li>
            <li>∞ 无尽模式，连续过关难度递增</li>
            <li>⏱ 限时挑战，120秒极限通关</li>
            <li>🔧 关卡编辑器，自创关卡并分享给好友</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>🏆 成就系统</h4>
          <ul>
            <li>61个成就，记录玩家的不断进步</li>
            <li>星级评价（1-3星），追求三星通关</li>
            <li>连胜系统，不使用提示/撤销连续通关</li>
            <li>每日签到，连续签到奖励递增</li>
            <li>提示道具系统，签到可领取</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>🌈 视觉与音效</h4>
          <ul>
            <li>6套精美配色主题可切换</li>
            <li>倒色动画与通关粒子特效</li>
            <li>Web Audio API 合成音效，无需音频文件</li>
            <li>可开关的背景音乐循环</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>📊 数据与统计</h4>
          <ul>
            <li>游戏统计仪表盘，全面记录数据</li>
            <li>步数分布图、通关时间趋势图</li>
            <li>星级分布图、通关进度热力图</li>
            <li>智能关卡推荐，根据表现推荐合适难度</li>
            <li>自适应难度调整，根据玩家表现动态微调关卡参数</li>
            <li>每日策略小贴士，30天轮播分享游戏技巧</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>⚙️ 功能与优化</h4>
          <ul>
            <li>PWA 离线可用，安装到桌面随时游玩</li>
            <li>响应式布局，完美适配手机/平板/桌面</li>
            <li>键盘快捷键（数字键选管、Z撤销、R重置、H提示）</li>
            <li>移动端长按试管可撤销操作</li>
            <li>自动保存进度，刷新不丢失</li>
            <li>存档导出/导入功能</li>
          </ul>
        </div>
        <div className="feature-section">
          <h4>📣 社交与分享</h4>
          <ul>
            <li>战绩图生成，分享你的高分成绩</li>
            <li>回放分享与导入，好友可查看操作过程</li>
            <li>回放视频导出（WebM格式）</li>
            <li>社交分享支持 OG 封面图</li>
          </ul>
        </div>

        <h3>技术栈</h3>
        <p>React 18 + Vite 5 + TypeScript，纯前端实现，无后端依赖。所有美术资源使用 CSS/SVG/Emoji 生成，音效使用 Web Audio API 合成，零外部素材依赖。</p>

        <p className="version">版本: v1.37.0 | 2026</p>
        {/* SEO 友好的详细问答内容 */}
        <div className="faq-section">
          <h3>❓ 常见问题</h3>
          <div className="faq-item">
            <h4>色彩排序是什么类型的游戏？</h4>
            <p>色彩排序是一款经典的液体排序解谜益智游戏（Water Sort Puzzle），玩家需要将不同颜色的液体在试管之间倒来倒去，最终使每种颜色归到同一个试管中。游戏考验逻辑思维和规划能力，适合所有年龄段的玩家。</p>
          </div>
          <div className="faq-item">
            <h4>色彩排序怎么玩？</h4>
            <p>玩法很简单：点击一个有颜色的试管选中它，再点击另一个试管将颜色倒过去。注意：只能倒入空试管或顶部颜色相同的试管。把所有颜色分类好就赢了！游戏还支持键盘快捷键（数字键选管、Z撤销、R重置）和移动端长按撤销。</p>
          </div>
          <div className="faq-item">
            <h4>色彩排序有多少关卡？</h4>
            <p>主线闯关模式共 100 关，从入门到大师难度递增。此外还有每日挑战（每天一题）、周挑战（每周一题高难度）、无尽模式（难度无限递增）和限时挑战（120秒极限）等多种模式，玩法丰富不枯燥。</p>
          </div>
          <div className="faq-item">
            <h4>色彩排序免费吗？需要注册吗？</h4>
            <p>完全免费，无需注册、无需登录，打开网页即可游玩。所有关卡和模式均免费开放，游戏进度自动保存在本地浏览器中，刷新不丢失。</p>
          </div>
          <div className="faq-item">
            <h4>色彩排序支持手机游玩吗？</h4>
            <p>支持！色彩排序完美适配手机、平板和桌面端。移动端支持触摸操作，点选试管进行倾倒，长按试管可撤销上一步操作。游戏还支持 PWA，可以添加到手机桌面像 App 一样使用，支持离线游玩。</p>
          </div>
          <div className="faq-item">
            <h4>如何获得三星评价？</h4>
            <p>星级评价基于通关步数与理论最优步数的比率：用最少步数完成可获三星，稍微多几步两星，步数较多则一星。不使用提示和撤销通关可以获得连胜加成。挑战自己，争取三星通关吧！</p>
          </div>
          <div className="faq-item">
            <h4>提示道具怎么获取？</h4>
            <p>提示道具通过每日签到获取，连续签到奖励递增。签到里程碑还会额外赠送提示道具。使用提示会消耗一个道具，但不会影响通关，只影响连胜计数。</p>
          </div>
          <div className="faq-item">
            <h4>游戏数据安全吗？</h4>
            <p>所有游戏数据（进度、成绩、设置）均存储在浏览器本地 localStorage 中，不上传任何服务器，不收集任何个人信息。清除浏览器数据会清除游戏进度，建议定期使用设置页面的「导出存档」功能备份。</p>
          </div>
          <div className="faq-item">
            <h4>关卡编辑器怎么用？</h4>
            <p>关卡编辑器允许你自创关卡：设置试管数量、颜色种类、容量，然后自定义每根试管中的颜色排列。创建完成后可以自己游玩，也可以生成关卡码分享给好友。好友通过导入关卡码即可游玩你创建的关卡。</p>
          </div>
        </div>
      </main>
    </div>
  );
};
