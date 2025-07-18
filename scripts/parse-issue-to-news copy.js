#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { query } = require('@anthropic-ai/claude-code');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { v4: uuidv4 } = require('uuid');

// 設定
const NEWS_JSON_PATH = path.resolve(__dirname, '../public/news.json');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.CLAUDE_CODE_OAUTH_TOKEN;

if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEYが設定されていません');
  process.exit(1);
}

// JSON Schema
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

// 1. Issue本文を取得
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

const TRIGGER = '#NEWS_EVENT';
if (issueBody.trim().startsWith(TRIGGER)) {
  issueBody = issueBody.trim().slice(TRIGGER.length).trim();
}

// プロンプト
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

async function main() {
  let llmOutput = '';
  try {
    for await (const message of query({
      prompt: prompt,
      options: {
        maxTurns: 1, // Single turn for this use case
        outputFormat: 'json',
      },
    })) {
      if (message.type === 'result' && message.subtype === 'success') {
        llmOutput = message.result;
      }
    }
  } catch (e) {
    console.error('Claude Code SDK呼び出しエラー:', e.message);
    process.exit(1);
  }

  let parsedEvents;
  try {
    // Extract JSON part from the response
    const jsonMatch = llmOutput.match(/(\[|\{).*(\n|\})/s);
    if (!jsonMatch) {
        throw new Error("レスポンスにJSONが見つかりません。");
    }
    const jsonString = jsonMatch[0];
    parsedEvents = JSON.parse(jsonString);
    if (!Array.isArray(parsedEvents)) parsedEvents = [parsedEvents];
  } catch (e) {
    console.error('Claude出力のJSONパースエラー:', e.message, 'Raw output:', llmOutput);
    process.exit(1);
  }

  // 3. バリデーション
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

  // 4. news.jsonに追記
  let news = [];
  try {
    news = JSON.parse(fs.readFileSync(NEWS_JSON_PATH, 'utf-8'));
  } catch (e) {
    // ignore
  }
  news.push(...validEvents);
  news.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  fs.writeFileSync(NEWS_JSON_PATH, JSON.stringify(news, null, 2));

  console.log(`news.jsonに${validEvents.length}件追加・保存しました`);
}

main();
