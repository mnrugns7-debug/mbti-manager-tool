import { useState, useEffect } from 'react';

export interface Member {
  id: string;
  name: string;
  mbti: string;
}

const STORAGE_KEY = 'mbti-members';

export function useMembers() {
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [members]);

  const addMember = (name: string, mbti: string) => {
    setMembers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, mbti },
    ]);
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return { members, addMember, deleteMember };
}
