/**
 * 生成插件注入的 CSS
 * 设计原则：克制、优雅，不抢视觉焦点，但让结构一目了然
 */
export const ENLEARN_STYLES = `
/* 分块容器 — 替换原文展示 */
.enlearn-chunked {
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  padding: 0;
  margin: 1px 0;
  background: transparent;
  border-radius: 0;
  position: relative;
  transition: background 0.2s;
}

.enlearn-chunked:hover {
  background: rgba(37, 99, 235, 0.03);
}

/* 段落间距 */
.enlearn-para-break { display: block; height: 0.8em; }

/* 缩进层级 */
.enlearn-line { display: block; }
.enlearn-indent-0 { padding-left: 0; }
.enlearn-indent-1 { padding-left: 1.0em; }
.enlearn-indent-2 { padding-left: 2.0em; }
.enlearn-indent-3 { padding-left: 3.0em; }
.enlearn-indent-4 { padding-left: 4.0em; }
.enlearn-indent-5 { padding-left: 5.0em; }

/* 颜色层级 — 主句正常色，从句逐级变淡 */
.enlearn-depth-0 { opacity: 1; }
.enlearn-depth-1 { opacity: 0.75; }
.enlearn-depth-2 { opacity: 0.55; }
.enlearn-depth-3 { opacity: 0.45; }
.enlearn-depth-4 { opacity: 0.38; }
.enlearn-depth-5 { opacity: 0.32; }

/* L2/L1：inline 模式容器 */
.enlearn-chunked-inline .enlearn-inline-content {
  display: inline;
}

/* L2：行内分隔符 */
.enlearn-separator {
  margin: 0 0.3em;
  color: rgba(37, 99, 235, 0.35);
  user-select: none;
  font-weight: 400;
}

/* L1：从句变淡 */
.enlearn-dim {
  opacity: 0.5;
}

/* 生词轻标记 */
.enlearn-word {
  border-bottom: 1px dotted rgba(37, 99, 235, 0.45);
  cursor: pointer;
  transition: border-color 0.15s;
}

.enlearn-word:hover {
  border-bottom-color: #2563eb;
}

/* 全局浮窗 — position:fixed 挂在 body，永远不被容器裁剪 */
.enlearn-tooltip {
  position: fixed;
  display: none;
  background: #1a1a2e;
  color: #e2e8f0;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  white-space: nowrap;
  z-index: 2147483647;
  pointer-events: auto;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: none;
  align-items: center;
  gap: 8px;
}

.enlearn-tooltip-def {
  display: inline;
}

.enlearn-tooltip-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  margin-left: 2px;
  background: transparent;
  border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: 50%;
  color: rgba(255,255,255,0.25);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
  line-height: 1;
  flex-shrink: 0;
}

.enlearn-tooltip-btn:hover {
  background: rgba(34,197,94,0.15);
  border-color: rgba(34,197,94,0.5);
  color: #4ade80;
}

/* 手动触发按钮 — inline 显示，不会被 overflow:hidden 裁剪 */
.enlearn-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  width: 18px;
  height: 18px;
  margin-left: 6px;
  border-radius: 4px;
  background: transparent;
  border: none;
  color: rgba(37, 99, 235, 0.35);
  cursor: pointer;
  opacity: 0.2;
  transition: all 0.2s;
  user-select: none;
  padding: 0;
  line-height: 1;
  pointer-events: auto !important;
}

.enlearn-trigger svg {
  width: 14px;
  height: 14px;
}

.enlearn-trigger.enlearn-trigger-visible {
  opacity: 0.6;
}

.enlearn-trigger:hover {
  opacity: 1 !important;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
}

.enlearn-trigger.enlearn-trigger-loading {
  opacity: 1;
  pointer-events: none;
  animation: enlearn-pulse 1s ease-in-out infinite;
}

@keyframes enlearn-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

/* 加载中状态 — shimmer 效果 */
.enlearn-loading {
  position: relative;
  overflow: hidden;
}

.enlearn-loading::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(37, 99, 235, 0.06) 50%,
    transparent 100%
  );
  animation: enlearn-shimmer 1.5s ease-in-out infinite;
}

@keyframes enlearn-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* 原文隐藏（信息流模式） */
.enlearn-original-hidden {
  display: none !important;
}

/* 暂停状态 — 隐藏分块和触发按钮，保留 DOM 不销毁 */
body.enlearn-paused .enlearn-chunked { display: none !important; }
body.enlearn-paused .enlearn-trigger { display: none !important; }

/* =================== Vocab Panel — 气泡 =================== */
.enlearn-vp-bubble {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 2147483640;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px 10px 14px;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  opacity: 0;
  transform: translateY(20px) scale(0.9);
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
}
.enlearn-vp-bubble--visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}
.enlearn-vp-bubble:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  border-color: #2563eb;
}
.enlearn-vp-bubble:active {
  transform: translateY(0) scale(0.98);
}
.enlearn-vp-bubble--hidden {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
  pointer-events: none;
}

.enlearn-vp-bubble-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50px;
  border: 2px solid #2563eb;
  opacity: 0;
  pointer-events: none;
}
@keyframes enlearn-vp-ring-pulse {
  0% { opacity: 0.6; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.15); }
}
.enlearn-vp-ring--pulse {
  animation: enlearn-vp-ring-pulse 0.6s ease-out;
}

.enlearn-vp-bubble-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(37, 99, 235, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.enlearn-vp-bubble-icon svg {
  width: 14px;
  height: 14px;
  color: #2563eb;
}

.enlearn-vp-bubble-count {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.enlearn-vp-bubble-num {
  font-variant-numeric: tabular-nums;
  display: inline-block;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.enlearn-vp-num--bump {
  transform: scale(1.3);
}
.enlearn-vp-bubble-label {
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
}

/* =================== Vocab Panel — 面板 =================== */
.enlearn-vp-panel {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 2147483641;
  width: 300px;
  max-height: 50vh;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  pointer-events: none;
  transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
}
.enlearn-vp-panel--visible {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.enlearn-vp-panel-header {
  padding: 12px 16px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.enlearn-vp-panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.enlearn-vp-panel-title-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}
.enlearn-vp-panel-title-icon svg {
  width: 16px;
  height: 16px;
  color: #2563eb;
}
.enlearn-vp-panel-title-text {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}
.enlearn-vp-panel-title-count {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
  margin-left: 2px;
}

.enlearn-vp-panel-close {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.enlearn-vp-panel-close:hover {
  background: rgba(37, 99, 235, 0.08);
  color: #1a1a2e;
}

.enlearn-vp-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.enlearn-vp-panel-body::-webkit-scrollbar { width: 4px; }
.enlearn-vp-panel-body::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.enlearn-vp-word-item {
  padding: 8px 16px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  transition: background 0.15s;
  cursor: default;
  opacity: 0;
  transform: translateY(8px);
  animation: enlearn-vp-word-enter 0.35s ease forwards;
}
@keyframes enlearn-vp-word-enter {
  to { opacity: 1; transform: translateY(0); }
}
.enlearn-vp-word-item:hover {
  background: rgba(37, 99, 235, 0.06);
}
.enlearn-vp-word-item + .enlearn-vp-word-item {
  border-top: 1px solid #e5e7eb;
}

.enlearn-vp-word-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #2563eb;
  margin-top: 8px;
  flex-shrink: 0;
  opacity: 0.5;
}
.enlearn-vp-word-content {
  flex: 1;
  min-width: 0;
}
.enlearn-vp-word-en {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 1px;
}
.enlearn-vp-word-def {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}
.enlearn-vp-word-context {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 3px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.enlearn-vp-word-context em {
  font-style: normal;
  color: #2563eb;
  font-weight: 500;
}

.enlearn-vp-panel-footer {
  padding: 8px 16px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.enlearn-vp-panel-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #9ca3af;
}
.enlearn-vp-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
}
.enlearn-vp-status-dot--scanning {
  animation: enlearn-vp-pulse-dot 1.5s ease-in-out infinite;
}
@keyframes enlearn-vp-pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.enlearn-vp-empty {
  padding: 24px 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .enlearn-chunked:hover {
    background: rgba(96, 165, 250, 0.05);
  }

  .enlearn-word {
    border-bottom-color: rgba(96, 165, 250, 0.45);
  }

  .enlearn-word:hover {
    border-bottom-color: #60a5fa;
  }

  .enlearn-tooltip {
    background: #0f0f1a;
    color: #e2e8f0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  }

  .enlearn-tooltip-btn {
    border-color: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.2);
  }

  .enlearn-trigger {
    color: rgba(96, 165, 250, 0.35);
  }

  .enlearn-trigger:hover {
    opacity: 1 !important;
    background: rgba(96, 165, 250, 0.12);
    color: #60a5fa;
  }

  .enlearn-separator {
    color: rgba(96, 165, 250, 0.35);
  }

  .enlearn-loading::after {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(96, 165, 250, 0.08) 50%,
      transparent 100%
    );
  }

  .enlearn-vp-bubble {
    background: #1e293b;
    border-color: #334155;
  }
  .enlearn-vp-bubble:hover {
    border-color: #60a5fa;
  }
  .enlearn-vp-bubble-ring {
    border-color: #60a5fa;
  }
  .enlearn-vp-bubble-icon {
    background: rgba(96, 165, 250, 0.1);
  }
  .enlearn-vp-bubble-icon svg {
    color: #60a5fa;
  }
  .enlearn-vp-bubble-count {
    color: #e2e8f0;
  }
  .enlearn-vp-bubble-label {
    color: #94a3b8;
  }

  .enlearn-vp-panel {
    background: #1e293b;
    border-color: #334155;
  }
  .enlearn-vp-panel-header {
    border-bottom-color: #334155;
  }
  .enlearn-vp-panel-title-icon {
    background: rgba(96, 165, 250, 0.1);
  }
  .enlearn-vp-panel-title-icon svg {
    color: #60a5fa;
  }
  .enlearn-vp-panel-title-text {
    color: #e2e8f0;
  }
  .enlearn-vp-panel-title-count {
    color: #64748b;
  }
  .enlearn-vp-panel-close {
    color: #64748b;
  }
  .enlearn-vp-panel-close:hover {
    background: rgba(96, 165, 250, 0.1);
    color: #e2e8f0;
  }
  .enlearn-vp-panel-body::-webkit-scrollbar-thumb {
    background: #334155;
  }

  .enlearn-vp-word-item:hover {
    background: rgba(96, 165, 250, 0.08);
  }
  .enlearn-vp-word-item + .enlearn-vp-word-item {
    border-top-color: #334155;
  }
  .enlearn-vp-word-dot {
    background: #60a5fa;
  }
  .enlearn-vp-word-en {
    color: #e2e8f0;
  }
  .enlearn-vp-word-def {
    color: #94a3b8;
  }
  .enlearn-vp-word-context {
    color: #64748b;
  }
  .enlearn-vp-word-context em {
    color: #60a5fa;
  }

  .enlearn-vp-panel-footer {
    border-top-color: #334155;
  }
  .enlearn-vp-panel-status {
    color: #64748b;
  }
  .enlearn-vp-empty {
    color: #64748b;
  }
}
`;
