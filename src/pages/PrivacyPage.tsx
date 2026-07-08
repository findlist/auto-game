import React from 'react';

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  return (
    <div className="app">
      <header className="game-header">
        <button className="btn-back" onClick={onBack}>← 返回</button>
        <h1 className="game-title">隐私政策</h1>
        <div style={{ width: '40px' }} />
      </header>
      <main className="info-page">
        <h2>隐私政策</h2>
        <p>最后更新：2026年7月2日</p>

        <h3>1. 信息收集</h3>
        <p>本游戏不收集任何个人身份信息。游戏进度和成绩存储在本地浏览器（localStorage），不会上传到服务器。</p>

        <h3>2. 广告</h3>
        <p>本游戏使用展示第三方广告（如 Google AdSense）的广告。广告商可能使用 Cookie 和类似技术提供相关广告。请参阅广告商的隐私政策了解详情。</p>

        <h3>3. Cookie</h3>
        <p>本游戏本身不使用 Cookie。广告商可能使用 Cookie，你可以通过浏览器设置禁用 Cookie。</p>

        <h3>4. 未成年人保护</h3>
        <p>本游戏适合各年龄段的用户。我们不收集未成年人的个人信息，广告展示不针对其设置个性化偏好。</p>

        <h3>5. 联系方式</h3>
        <p>如有任何问题，可通过本站点相关的联系方式与我们沟通。</p>
      </main>
    </div>
  );
};
