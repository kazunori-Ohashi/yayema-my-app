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
    link: { type: 'string' }
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
const issueBody = event.issue && event.issue.body;
if (!issueBody) {
  console.error('Issue本文が取得できません');
  process.exit(1);
}

// 2. Claude CLIでプロンプトを投げてJSON出力を得る
const prompt = `以下のイベント情報をnews.json形式（多言語・新スキーマ）で厳密なJSON配列として出力してください。\n${issueBody}`;
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