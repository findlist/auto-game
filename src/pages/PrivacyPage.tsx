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
        <div className="header-spacer" />
      </header>
      <main className="info-page">
        <h2>隐私政策</h2>
        <p>最后更新：2026年7月9日</p>

        <h3>1. 信息收集</h3>
        <p>本游戏是一款纯前端 H5 网页游戏，不收集任何个人身份信息。游戏进度、最高分、设置等数据仅存储在您浏览器的本地存储（localStorage）中，不会上传到任何服务器。清除浏览器数据将删除所有本地存储信息。</p>

        <h3>2. 第三方广告</h3>
        <p>本游戏可能展示来自第三方广告联盟（如 Google AdSense）的广告。广告商可能使用 Cookie 和类似技术来提供与您兴趣相关的广告。您可以访问 <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google 广告设置</a> 了解更多信息并管理您的广告偏好。</p>

        <h3>3. Cookie 使用</h3>
        <p>本游戏本身不使用 Cookie。如果接入了第三方广告服务，广告商可能设置 Cookie。您可以通过浏览器设置禁用 Cookie，但这可能影响广告展示效果。</p>

        <h3>4. 数据安全</h3>
        <p>所有游戏数据均存储在本地浏览器中，不通过网络传输。我们不拥有、不存储、不处理您的任何个人数据。</p>

        <h3>5. 未成年人保护</h3>
        <p>本游戏适合各年龄段的用户游玩。我们不收集未成年人的个人信息，广告展示不针对未成年人设置个性化偏好。如果您是未成年人的监护人，发现任何不适内容请及时联系我们。</p>

        <h3>6. 外部链接</h3>
        <p>本游戏可能包含指向第三方网站（如广告商、捐赠平台）的链接。我们对第三方网站的隐私政策不承担责任，请查阅相关网站的隐私政策。</p>

        <h3>7. 政策变更</h3>
        <p>本隐私政策可能会不时更新。更新后我们将在本页面发布最新版本，并更新"最后更新"日期。建议您定期查阅本页面了解最新信息。</p>

        <h3>8. 联系方式</h3>
        <p>如有任何关于隐私政策的疑问，可通过游戏内的反馈渠道与我们沟通。</p>
      </main>
    </div>
  );
};
