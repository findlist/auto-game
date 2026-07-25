// 玩法帮助弹窗组件
// 从 GameBoard 拆分：展示基本玩法、快捷键、移动端操作、星级评价、小技巧
// 纯展示组件，不依赖外部状态
import React from 'react';

interface HelpModalProps {
  /** 关闭弹窗的回调 */
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h3>📖 玩法帮助</h3>
          <button className="help-close-btn" onClick={onClose} aria-label="关闭帮助">✕</button>
        </div>
        <div className="help-modal-body">
          <div className="help-section">
            <h4>🎮 基本玩法</h4>
            <div className="help-visual-steps">
              <div className="help-visual-step">
                <div className="help-visual-demo">
                  <svg viewBox="0 0 120 70" preserveAspectRatio="xMidYMid meet">
                    <rect x="10" y="15" width="22" height="50" rx="4" fill="rgba(255,255,255,0.15)" stroke="#FF6B6B" strokeWidth="2.5"/>
                    <rect x="12" y="25" width="18" height="12" fill="#FF6B6B"/>
                    <rect x="12" y="37" width="18" height="12" fill="#4ECDC4"/>
                    <rect x="12" y="49" width="18" height="12" fill="#4ECDC4"/>
                    <text x="21" y="12" fontSize="9" fill="#FF6B6B" textAnchor="middle">1</text>
                    <path d="M38 35 L52 35" stroke="#667eea" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                    <defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill="#667eea"/></marker></defs>
                    <rect x="55" y="15" width="22" height="50" rx="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
                    <text x="66" y="12" fontSize="9" fill="#999" textAnchor="middle">2</text>
                    <text x="95" y="40" fontSize="20">👆</text>
                  </svg>
                </div>
                <p><strong>第1步：</strong>点击有颜色的试管选中它</p>
              </div>
              <div className="help-visual-step">
                <div className="help-visual-demo">
                  <svg viewBox="0 0 120 70" preserveAspectRatio="xMidYMid meet">
                    <rect x="10" y="15" width="22" height="50" rx="4" fill="rgba(255,255,255,0.15)" stroke="#FF6B6B" strokeWidth="2.5"/>
                    <rect x="12" y="25" width="18" height="12" fill="#FF6B6B"/>
                    <rect x="12" y="37" width="18" height="24" fill="#4ECDC4"/>
                    <text x="21" y="12" fontSize="9" fill="#FF6B6B" textAnchor="middle">1</text>
                    <path d="M38 30 Q45 20 52 30" stroke="#4ECDC4" strokeWidth="2" fill="none" markerEnd="url(#arrowhead2)"/>
                    <defs><marker id="arrowhead2" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill="#4ECDC4"/></marker></defs>
                    <rect x="55" y="15" width="22" height="50" rx="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
                    <rect x="57" y="49" width="18" height="12" fill="#4ECDC4"/>
                    <text x="66" y="12" fontSize="9" fill="#999" textAnchor="middle">2</text>
                    <text x="95" y="40" fontSize="20">👆</text>
                  </svg>
                </div>
                <p><strong>第2步：</strong>再点击目标试管倒过去</p>
              </div>
              <div className="help-visual-step">
                <div className="help-visual-demo">
                  <svg viewBox="0 0 120 70" preserveAspectRatio="xMidYMid meet">
                    <rect x="10" y="15" width="22" height="50" rx="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
                    <text x="21" y="12" fontSize="9" fill="#999" textAnchor="middle">1</text>
                    <rect x="55" y="15" width="22" height="50" rx="4" fill="rgba(255,255,255,0.15)" stroke="#4ECDC4" strokeWidth="2.5"/>
                    <rect x="57" y="19" width="18" height="12" fill="#4ECDC4"/>
                    <rect x="57" y="31" width="18" height="12" fill="#4ECDC4"/>
                    <rect x="57" y="43" width="18" height="12" fill="#4ECDC4"/>
                    <rect x="57" y="51" width="18" height="10" fill="#4ECDC4"/>
                    <text x="66" y="12" fontSize="9" fill="#4ECDC4" textAnchor="middle">2</text>
                    <text x="88" y="45" fontSize="18">✅</text>
                  </svg>
                </div>
                <p><strong>目标：</strong>每种颜色归到一个试管</p>
              </div>
            </div>
            <ul className="help-rules-list">
              <li>只能倒入<strong>空试管</strong>或<strong>顶部颜色相同</strong>的试管</li>
              <li>把每种颜色全部归到同一个试管即获胜！</li>
            </ul>
          </div>
          <div className="help-section">
            <h4>⌨️ 快捷键</h4>
            <ul>
              <li><kbd>1-9</kbd> 选择对应编号的试管</li>
              <li><kbd>Z</kbd> 撤销上一步操作</li>
              <li><kbd>R</kbd> 重新开始当前关卡</li>
              <li><kbd>H</kbd> 使用提示道具（需消耗道具）</li>
              <li><kbd>PageUp</kbd> 上一关（通关后可用）</li>
              <li><kbd>PageDown</kbd> 下一关（通关后可用）</li>
            </ul>
          </div>
          <div className="help-section">
            <h4>📱 移动端操作</h4>
            <ul>
              <li>点击试管选中/倾倒</li>
              <li><strong>长按试管 0.5 秒</strong>可撤销上一步</li>
              <li><strong>滑动手指</strong>从源试管拖到目标试管可直接倾倒</li>
            </ul>
          </div>
          <div className="help-section">
            <h4>⭐ 星级评价</h4>
            <ul>
              <li>⭐⭐⭐ 达到或超过最优步数</li>
              <li>⭐⭐ 步数不超过最优的 1.5 倍</li>
              <li>⭐ 超过 1.5 倍但通关</li>
            </ul>
          </div>
          <div className="help-section">
            <h4>💡 小技巧</h4>
            <ul>
              <li>优先处理只剩少量颜色的试管</li>
              <li>保持至少一个空试管作为缓冲</li>
              <li>遇到死局时可以撤销或重置</li>
              <li>连续高效倾倒可触发连击音效</li>
            </ul>
          </div>
        </div>
        <div className="help-modal-footer">
          <button className="btn btn-primary" onClick={onClose}>知道了</button>
        </div>
      </div>
    </div>
  );
};
