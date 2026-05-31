import { useState } from 'react';
import { Trash2, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import type { Member } from '../hooks/useMembers';

const MBTI_TYPES = [
  'INTJ','INTP','ENTJ','ENTP',
  'INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ',
  'ISTP','ISFP','ESTP','ESFP',
];

interface Props {
  members: Member[];
  selectedId: string;
  onSelect: (member: Member) => void;
  onAdd: (name: string, mbti: string) => void;
  onDelete: (id: string) => void;
}

export default function MemberManager({ members, selectedId, onSelect, onAdd, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [mbti, setMbti] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name.trim() || !mbti) return;
    onAdd(name.trim(), mbti);
    setName('');
    setMbti('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      onDelete(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const selected = members.find((m) => m.id === selectedId);

  return (
    <div className="member-manager">
      <button className="member-toggle" onClick={() => setOpen(!open)}>
        <span className="member-toggle-left">
          <span className="member-icon">👥</span>
          {selected ? (
            <span className="member-selected-name">
              {selected.name}
              <span className="member-selected-mbti">{selected.mbti}</span>
            </span>
          ) : (
            <span className="member-placeholder">メンバーから選ぶ</span>
          )}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="member-dropdown">
          {members.length === 0 && !showForm && (
            <p className="member-empty">まだメンバーが登録されていません</p>
          )}

          {members.map((m) => (
            <div
              key={m.id}
              className={`member-item ${selectedId === m.id ? 'active' : ''}`}
            >
              <button className="member-item-select" onClick={() => { onSelect(m); setOpen(false); }}>
                <span className="member-item-name">{m.name}</span>
                <span className="member-item-mbti">{m.mbti}</span>
              </button>
              <button
                className={`member-delete-btn ${confirmDelete === m.id ? 'confirm' : ''}`}
                onClick={() => handleDelete(m.id)}
                title={confirmDelete === m.id ? 'もう一度押すと削除' : '削除'}
              >
                <Trash2 size={13} />
                {confirmDelete === m.id && <span>確認</span>}
              </button>
            </div>
          ))}

          {showForm ? (
            <div className="member-form">
              <input
                className="member-input"
                placeholder="名前（例：田中さん）"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <select
                className="member-select"
                value={mbti}
                onChange={(e) => setMbti(e.target.value)}
              >
                <option value="">MBTIを選択</option>
                {MBTI_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <div className="member-form-actions">
                <button className="member-save-btn" onClick={handleAdd} disabled={!name.trim() || !mbti}>
                  保存
                </button>
                <button className="member-cancel-btn" onClick={() => setShowForm(false)}>
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <button className="member-add-btn" onClick={() => setShowForm(true)}>
              <UserPlus size={14} />
              メンバーを登録する
            </button>
          )}
        </div>
      )}
    </div>
  );
}
