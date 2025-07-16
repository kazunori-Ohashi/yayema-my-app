#!/usr/bin/env node
// GitHub Issue本文をLLMで解析しnews.jsonにappendするNode.jsスクリプト本実装
// - Claude Code SDK CLI (claude -p) をchild_processで呼び出し
// - LLM出力を厳密バリデーション
// - news.jsonにappendし、date降順でソートして保存
// - 必須情報不足や不正データはエラー

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { v4: uuidv4 } = require('uuid');

// 設定: ファイルパス
const NEWS_JSON_PATH = path.resolve(__dirname, '../public/news.json');

// JSON Schema（TypeScript型 news.tsに準拠）
const newsEventSchema = {
  type: 'object',
  required: ['date', 'title', 'detail', 'venue', 'open_time', 'start_time', 'performers', 'fee', 'contact', 'link'],
  properties: {
    id: { type: 'string' },
    date: { type: 'string' },
    title: { type: 'object' },
    detail: { type: 'object' },
    venue: { type: 'object' },
    open_time: { type: 'string' },
    start_time: { type: 'string' },
    performers: { type: 'array' },
    fee: { type: 'object' },
    contact: { type: 'object' },
    link: { type: 'object' }
  },
  additionalProperties: false
};

// 1. GitHub ActionsからGITHUB_EVENT_PATHでIssue本文を取得
const eventPath = process.argv[2] || process.env.GITHUB_EVENT_PATH;
if (!eventPath || !fs.existsSync(eventPath)) {
  console.error('GITHUB_EVENT_PATHが指定されていません');
  process.exit(1);
}
const event = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
let issueBody = event.issue && event.issue.body;
if (!issueBody) {
  console.error('Issue本文が取得できません');
  process.exit(1);
}

// トリガー文字（例: #NEWS_EVENT）を除外
const TRIGGER = '#NEWS_EVENT';
if (issueBody.trim().startsWith(TRIGGER)) {
  issueBody = issueBody.trim().slice(TRIGGER.length).trim();
}

// Claude用最適化プロンプト
const prompt = `以下の日本語イベント情報の塊を、news.jsonのスキーマ（下記）に従い、各イベントごとに
- 日付、タイトル、詳細、会場、開場時間、開演時間、出演者、料金、問い合わせ先、リンク
を正確に抽出し、必要に応じて空欄補完してください。

さらに、各項目は
- 日本語（ja）は元の日本語から
- 英語（en）は日本語から正確に英訳
- 中国語（zh）は日本語から正確に繁体字で中訳
してください。

出力は厳密なJSON配列（news.jsonの例に準拠）で返してください。

【news.jsonスキーマ例】
[
  {
    "id": "自動生成でOK",
    "date": "YYYY-MM-DD または範囲",
    "title": { "ja": "...", "en": "...", "zh": "..." },
    "detail": { "ja": "...", "en": "...", "zh": "..." },
    "venue": { "ja": "...", "en": "...", "zh": "..." },
    "open_time": "18:00",
    "start_time": "18:30",
    "performers": [ { "ja": "...", "en": "...", "zh": "..." }, ... ],
    "fee": { "ja": "...", "en": "...", "zh": "..." },
    "contact": { "ja": "...", "en": "...", "zh": "..." },
    "link": { "ja": "...", "en": "...", "zh": "..." }
  }
]

【注意】
- 英語（en）と中国語（zh）は、必ず日本語（ja）から自動翻訳してください。
- 中国語（zh）は繁体字で出力してください。
- performers（出演者）は個別に分割し、各言語で表記してください（固有名詞はカタカナやローマ字のままでOK）。
- 日付や時間、金額なども適切に抽出してください。
- 出力は厳密なJSON配列のみで、余計な説明やコメントは不要です。

【日本語イベント情報】
${issueBody}`;

let llmOutput;
try {
  llmOutput = execSync(`claude -p ${JSON.stringify(prompt)} --output-format json`, { encoding: 'utf-8', env: process.env });
} catch (e) {
  console.error('Claude CLI呼び出しエラー:', e.message);
  process.exit(1);
}
let parsedEvents;
try {
  parsedEvents = JSON.parse(llmOutput);
  if (!Array.isArray(parsedEvents)) parsedEvents = [parsedEvents];
} catch (e) {
  console.error('Claude出力のJSONパースエラー:', e.message);
  process.exit(1);
}

// 3. 厳密バリデーション
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(newsEventSchema);
const validEvents = [];
for (const ev of parsedEvents) {
  if (!ev.id) ev.id = uuidv4();
  if (validate(ev)) {
    validEvents.push(ev);
  } else {
    console.error('バリデーションエラー:', validate.errors, ev);
  }
}
if (validEvents.length === 0) {
  console.error('有効なイベントがありません');
  process.exit(1);
}

// 4. 既存news.jsonを読み込み、append、date降順でソート
let news = [];
try {
  news = JSON.parse(fs.readFileSync(NEWS_JSON_PATH, 'utf-8'));
} catch (e) {
  // news.jsonが空の場合は空配列
}
news.push(...validEvents);
news.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
fs.writeFileSync(NEWS_JSON_PATH, JSON.stringify(news, null, 2));

console.log(`news.jsonに${validEvents.length}件追加・保存しました`); 