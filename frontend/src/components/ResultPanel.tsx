import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { ApiResponse } from '../types';

interface Props {
  data: ApiResponse;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button className="copy-btn" onClick={handleCopy} title="コピー">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'コピー済み' : 'コピー'}
    </button>
  );
}

function Collapsible({ title, badge, children, defaultOpen = true }: {
  title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="collapsible">
      <button className="collapsible-header" onClick={() => setOpen(!open)}>
        <span className="collapsible-title">
          {title}
          {badge && <span className="badge">{badge}</span>}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  );
}

export default function ResultPanel({ data }: Props) {
  const { result, mbtiProfile } = data;

  return (
    <div className="result-panel">
      <div className="result-header">
        <div className="profile-chip">
          <span className="profile-name">{mbtiProfile.name}</span>
        </div>
        <div className="profile-meta">
          <span className="meta-item"><strong>重視：</strong>{mbtiProfile.core}</span>
          <span className="meta-item meta-avoid"><strong>避ける：</strong>{mbtiProfile.avoid}</span>
        </div>
      </div>

      <Collapsible title="コミュニケーション戦略" badge="STRATEGY">
        <div className="strategy-box">
          <div className="strategy-order">
            <span className="order-icon">→</span>
            <p>{result.strategy.order}</p>
          </div>
          <div className="key-values">
            {result.strategy.keyValues.map((v, i) => (
              <span key={i} className="key-value-tag">{v}</span>
            ))}
          </div>
        </div>
        <div className="tone-row">
          <span className="tone-label">推奨トーン</span>
          <span className="tone-value">{result.tone}</span>
        </div>
      </Collapsible>

      <Collapsible title="推奨会話文" badge="EXAMPLES" defaultOpen={true}>
        <div className="examples-list">
          {result.examples.map((ex, i) => (
            <div key={i} className="example-card">
              <div className="example-header">
                <span className="example-label">{ex.label}</span>
                <CopyButton text={ex.text} />
              </div>
              <p className="example-text">{ex.text}</p>
            </div>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="NGアプローチ" badge="WARNING" defaultOpen={false}>
        <div className="ng-list">
          {result.ngApproaches.map((ng, i) => (
            <div key={i} className="ng-card">
              <div className="ng-text">
                <span className="ng-icon">✕</span>
                <span className="ng-example">「{ng.ng}」</span>
              </div>
              <p className="ng-reason">{ng.reason}</p>
            </div>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="NG例 → 改善例" badge="COMPARE" defaultOpen={false}>
        <div className="compare-list">
          {result.ngToGood.map((item, i) => (
            <div key={i} className="compare-card">
              <div className="compare-ng">
                <span className="compare-badge ng-badge">NG</span>
                <span>{item.ng}</span>
              </div>
              <div className="compare-arrow">↓</div>
              <div className="compare-good">
                <span className="compare-badge good-badge">OK</span>
                <span>{item.good}</span>
                <CopyButton text={item.good} />
              </div>
            </div>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="テンプレート文" badge="TEMPLATE" defaultOpen={false}>
        <div className="template-box">
          <div className="template-header">
            <CopyButton text={result.template} />
          </div>
          <p className="template-text">{result.template}</p>
        </div>
      </Collapsible>
    </div>
  );
}
