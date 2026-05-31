import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MBTI_PROFILES = {
  INTJ: { name: 'INTJ（建築家）', core: '論理・長期戦略・自律性', avoid: '感情論・無駄な手順・曖昧な指示' },
  INTP: { name: 'INTP（論理学者）', core: '理論・知的探求・正確さ', avoid: '権威主義・感情的訴え・表面的な評価' },
  ENTJ: { name: 'ENTJ（指揮官）', core: '効率・成果・リーダーシップ', avoid: '曖昧さ・無駄・感情的な慰め' },
  ENTP: { name: 'ENTP（討論者）', core: '革新・可能性・議論', avoid: '硬直したルール・細かすぎる管理・反論封じ' },
  INFJ: { name: 'INFJ（提唱者）', core: '意味・成長・信頼関係', avoid: '表面的な褒め・強制・価値観の否定' },
  INFP: { name: 'INFP（仲介者）', core: '価値観・真正性・個人の成長', avoid: '批判の押しつけ・競争強制・感情否定' },
  ENFJ: { name: 'ENFJ（主人公）', core: '人間関係・成長支援・調和', avoid: '冷淡な指示・批判だけ・孤立感' },
  ENFP: { name: 'ENFP（広報運動家）', core: '可能性・感情・自由', avoid: '細かすぎる管理・型にはめる・ネガティブ一辺倒' },
  ISTJ: { name: 'ISTJ（管理者）', core: '責任・安定・明確なルール', avoid: '曖昧な指示・突然の変更・感情的な訴え' },
  ISFJ: { name: 'ISFJ（擁護者）', core: '安心感・協調・貢献', avoid: '公の場での批判・突然の変更・孤立' },
  ESTJ: { name: 'ESTJ（幹部）', core: '結果・秩序・責任感', avoid: '曖昧さ・ルール無視・感情論' },
  ESFJ: { name: 'ESFJ（領事）', core: '調和・承認・具体的なサポート', avoid: '批判のみ・冷淡な態度・無視' },
  ISTP: { name: 'ISTP（巨匠）', core: '実用性・自律・効率', avoid: '感情的な圧・過干渉・抽象的な指示' },
  ISFP: { name: 'ISFP（冒険家）', core: '自分らしさ・共感・穏やかな環境', avoid: '強制・公開批判・感情否定' },
  ESTP: { name: 'ESTP（起業家）', core: '即時成果・行動・競争', avoid: '長すぎる理論・細かい管理・退屈' },
  ESFP: { name: 'ESFP（エンターテイナー）', core: '楽しさ・承認・人との繋がり', avoid: '重すぎる雰囲気・批判のみ・孤立感' },
};

const SCENE_LABELS = {
  daily_report: '日報返信',
  one_on_one: '1on1面談',
  chat: 'チャット',
  feedback: 'フィードバック',
  instruction: '指示出し',
};

const INTENSITY_LABELS = {
  gentle: '優しめ',
  standard: '標準',
  strong: '強め（行動促進）',
};

function buildSystemPrompt() {
  return `あなたはマネジメントコミュニケーションの専門家です。
リーダーがメンバーに対して、相手のMBTI特性に応じた最適な伝え方を設計するサポートをします。

以下のJSON形式で必ず回答してください。JSONのみ出力し、他のテキストは含めないでください：

{
  "strategy": {
    "order": "伝える順番の説明（例：共感→事実→改善提案）",
    "keyValues": ["重視する価値観1", "重視する価値観2", "重視する価値観3"]
  },
  "ngApproaches": [
    {"ng": "NGな伝え方の例", "reason": "なぜNGか"},
    {"ng": "NGな伝え方の例2", "reason": "なぜNGか2"}
  ],
  "tone": "推奨トーン（論理的 / 優しめ / フラット / ストレートなど）",
  "examples": [
    {
      "label": "パターンA",
      "text": "実際に使える会話文（日本語）"
    },
    {
      "label": "パターンB",
      "text": "実際に使える会話文（日本語）"
    },
    {
      "label": "パターンC",
      "text": "実際に使える会話文（日本語）"
    }
  ],
  "ngToGood": [
    {
      "ng": "ダメな言い方の例",
      "good": "改善後の言い方"
    },
    {
      "ng": "ダメな言い方の例2",
      "good": "改善後の言い方2"
    }
  ],
  "template": "シーンに最適化されたテンプレート文"
}`;
}

function buildUserPrompt(mbti, traits, content, scenes, intensity) {
  const profile = MBTI_PROFILES[mbti];
  const sceneLabels = scenes.map((s) => SCENE_LABELS[s] || s).join('・');
  const intensityLabel = INTENSITY_LABELS[intensity] || intensity;
  const traitsSection = traits?.trim()
    ? `\n【このメンバーの個人的な特徴・メモ】\n${traits}\n※ MBTIの特性に加え、上記の個人特徴も必ず会話設計に反映すること`
    : '';

  return `以下の条件で、マネージャーがメンバーに伝えるための会話設計を作成してください。

【メンバーのMBTI】${mbti}（${profile.name}）
- 重視するもの: ${profile.core}
- 避けるべき: ${profile.avoid}
${traitsSection}
【伝えたい内容】
${content}

【シーン】${sceneLabels}
【強度】${intensityLabel}

重要な前提：
- リーダーとメンバーはすでに良好な関係が築けている
- 堅苦しすぎず、普段の会話に近いナチュラルなトーンで
- 「ですます」調でも口語に近い自然な表現を使う
- 重すぎない・フランクだけど誠実な言い方を心がける
${traits?.trim() ? '- 個人の特徴を最優先で会話設計に織り込むこと' : ''}

このMBTIタイプの特性を深く理解した上で、実務でそのまま使えるレベルの会話設計を生成してください。
会話文は${sceneLabels}のシーンに適した長さ・形式にしてください。
強度は「${intensityLabel}」に合わせてください。`;
}

app.post('/api/generate', async (req, res) => {
  const { mbti, traits, content, scenes, intensity } = req.body;

  if (!mbti || !content || !scenes?.length || !intensity) {
    return res.status(400).json({ error: '必須項目が不足しています' });
  }

  if (!MBTI_PROFILES[mbti]) {
    return res.status(400).json({ error: '無効なMBTIタイプです' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: buildSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(mbti, traits, content, scenes, intensity),
        },
      ],
    });

    const rawText = message.content[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('JSONの解析に失敗しました');
    }

    const result = JSON.parse(jsonMatch[0]);
    res.json({ result, mbtiProfile: MBTI_PROFILES[mbti] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '生成に失敗しました: ' + err.message });
  }
});

app.get('/api/mbti-list', (req, res) => {
  res.json(MBTI_PROFILES);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
