import type { GenerateRequest } from '../types';
import MemberManager from './MemberManager';
import { useMembers } from '../hooks/useMembers';

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

const MBTI_LABELS: Record<string, string> = {
  INTJ: '建築家', INTP: '論理学者', ENTJ: '指揮官', ENTP: '討論者',
  INFJ: '提唱者', INFP: '仲介者', ENFJ: '主人公', ENFP: '広報運動家',
  ISTJ: '管理者', ISFJ: '擁護者', ESTJ: '幹部', ESFJ: '領事',
  ISTP: '巨匠', ISFP: '冒険家', ESTP: '起業家', ESFP: 'エンターテイナー',
};

const SCENES = [
  { value: 'daily_report', label: '日報返信' },
  { value: 'one_on_one', label: '1on1面談' },
  { value: 'chat', label: 'チャット' },
  { value: 'feedback', label: 'フィードバック' },
  { value: 'instruction', label: '指示出し' },
];

const INTENSITIES = [
  { value: 'gentle', label: '優しめ', desc: '関係構築・モチベーション配慮' },
  { value: 'standard', label: '標準', desc: '通常のフィードバック・指示' },
  { value: 'strong', label: '強め', desc: '行動促進・改善必須の場面' },
];

interface Props {
  form: GenerateRequest;
  onChange: (form: GenerateRequest) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function InputForm({ form, onChange, onSubmit, loading }: Props) {
  const set = (key: keyof GenerateRequest, value: string) =>
    onChange({ ...form, [key]: value });

  const toggleScene = (value: string) => {
    const current = form.scenes ?? [];
    const next = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value];
    onChange({ ...form, scenes: next });
  };

  const { members, addMember, deleteMember } = useMembers();
  const [selectedMemberId, setSelectedMemberId] = [
    form.selectedMemberId ?? '',
    (id: string) => onChange({ ...form, selectedMemberId: id }),
  ];

  return (
    <div className="input-form">
      <div className="form-section">
        <label className="form-label">
          <span className="label-num">01</span>
          メンバーのMBTIタイプ
        </label>

        <MemberManager
          members={members}
          selectedId={selectedMemberId}
          onSelect={(m) => {
            set('mbti', m.mbti);
            setSelectedMemberId(m.id);
          }}
          onAdd={addMember}
          onDelete={(id) => {
            deleteMember(id);
            if (selectedMemberId === id) setSelectedMemberId('');
          }}
        />

        <div className="mbti-grid-label">または直接選択</div>
        <div className="mbti-grid">
          {MBTI_TYPES.map((type) => (
            <button
              key={type}
              className={`mbti-btn ${form.mbti === type ? 'active' : ''}`}
              onClick={() => set('mbti', type)}
            >
              <span className="mbti-type">{type}</span>
              <span className="mbti-sub">{MBTI_LABELS[type]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label className="form-label">
          <span className="label-num">02</span>
          このメンバーの特徴・メモ
          <span className="label-hint">任意</span>
        </label>
        <textarea
          className="content-input traits-input"
          placeholder={`例：\n・褒められると伸びるタイプ\n・急な変更に弱い\n・最近モチベが下がり気味\n・論理より感情で動く傾向がある`}
          value={form.traits}
          onChange={(e) => set('traits', e.target.value)}
          rows={4}
        />
      </div>

      <div className="form-section">
        <label className="form-label">
          <span className="label-num">03</span>
          伝えたい内容
        </label>
        <textarea
          className="content-input"
          placeholder="例：先週の報告書で事実確認が不足していた。改善してほしい。"
          value={form.content}
          onChange={(e) => set('content', e.target.value)}
          rows={4}
        />
      </div>

      <div className="form-section">
        <label className="form-label">
          <span className="label-num">04</span>
          シーン
          <span className="label-hint">複数選択OK</span>
        </label>
        <div className="scene-grid">
          {SCENES.map((s) => (
            <button
              key={s.value}
              className={`scene-btn ${(form.scenes ?? []).includes(s.value) ? 'active' : ''}`}
              onClick={() => toggleScene(s.value)}
            >
              {(form.scenes ?? []).includes(s.value) && <span className="scene-check">✓ </span>}
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-section">
        <label className="form-label">
          <span className="label-num">05</span>
          強度
        </label>
        <div className="intensity-grid">
          {INTENSITIES.map((i) => (
            <button
              key={i.value}
              className={`intensity-btn ${form.intensity === i.value ? 'active' : ''}`}
              onClick={() => set('intensity', i.value)}
            >
              <span className="intensity-label">{i.label}</span>
              <span className="intensity-desc">{i.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        className={`generate-btn ${loading ? 'loading' : ''}`}
        onClick={onSubmit}
        disabled={loading || !form.mbti || !form.content || !(form.scenes ?? []).length || !form.intensity}
      >
        {loading ? (
          <>
            <span className="spinner" />
            生成中...
          </>
        ) : (
          '会話設計を生成する'
        )}
      </button>
    </div>
  );
}
