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

// 翻訳結果をパースする関数
function parseTranslations(translationOutput, originalTexts) {
  const translations = {};
  const blocks = translationOutput.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);
  
  for (let i = 0; i < blocks.length && i < originalTexts.length; i++) {
    const block = blocks[i];
    const originalText = originalTexts[i];
    
    const enMatch = block.match(/英語[:：]\s*(.+)/);
    const zhMatch = block.match(/中国語[:：]\s*(.+)/);
    
    if (enMatch || zhMatch) {
      translations[originalText] = {
        en: enMatch ? enMatch[1].trim() : '',
        zh: zhMatch ? zhMatch[1].trim() : ''
      };
    }
  }
  
  return translations;
}

// 翻訳をイベントデータに適用する関数
function applyTranslations(event, translations) {
  // タイトル翻訳
  if (translations[event.title.ja]) {
    event.title.en = translations[event.title.ja].en;
    event.title.zh = translations[event.title.ja].zh;
  }
  
  // 会場翻訳
  if (event.venue.ja && translations[event.venue.ja]) {
    event.venue.en = translations[event.venue.ja].en;
    event.venue.zh = translations[event.venue.ja].zh;
  }
  
  // 料金翻訳
  if (event.fee.ja && translations[event.fee.ja]) {
    event.fee.en = translations[event.fee.ja].en;
    event.fee.zh = translations[event.fee.ja].zh;
  }
  
  // 連絡先翻訳
  if (event.contact.ja && translations[event.contact.ja]) {
    event.contact.en = translations[event.contact.ja].en;
    event.contact.zh = translations[event.contact.ja].zh;
  }
  
  // 出演者翻訳
  event.performers.forEach(performer => {
    if (performer.ja && translations[performer.ja]) {
      performer.en = translations[performer.ja].en;
      performer.zh = translations[performer.ja].zh;
    }
  });
}

// デバッグ情報
console.log('現在のディレクトリ:', __dirname);
console.log('news.jsonのパス:', NEWS_JSON_PATH);
console.log('news.jsonの存在確認:', fs.existsSync(NEWS_JSON_PATH));
console.log('ANTHROPIC_API_KEY設定確認:', !!ANTHROPIC_API_KEY);
console.log('環境変数CLAUDE_CODE_OAUTH_TOKEN:', !!process.env.CLAUDE_CODE_OAUTH_TOKEN);

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
const prompt = `あなたはデータ分類のエキスパートです。以下の日本語イベント情報を解析し、各イベントについて以下の形式で出力してください。

**出力形式:**
日付: [YYYY-MM-DD形式]
タイトル: [イベントタイトル]
出演者: [出演者名（複数の場合は/で区切る）]
会場: [会場名]
開場時間: [HH:MM形式]
開演時間: [HH:MM形式]
入場料: [料金情報]
連絡先: [電話番号やURLなど]

**重要:**
- 各項目は「項目名: 内容」の形式で出力
- 複数のイベントがある場合は、イベント間に空行を入れる
- 不明な項目は空欄にする
- 余計な説明は不要

【解析対象のイベント情報】
${issueBody}`;

async function main() {
  let llmOutput = '';
  try {
    console.log('Claude Code SDK呼び出し開始...');
    console.log('プロンプト:', prompt);
    
    for await (const message of query({
      prompt: prompt,
      options: {
        maxTurns: 1
      },
    })) {
      console.log('メッセージタイプ:', message.type, 'サブタイプ:', message.subtype);
      if (message.type === 'result' && message.subtype === 'success') {
        llmOutput = message.result;
        console.log('結果を取得:', llmOutput);
      }
    }
  } catch (e) {
    console.error('Claude Code SDK呼び出しエラー:', e.message);
    process.exit(1);
  }

  console.log('Claude出力（デバッグ用）:', llmOutput);

  // 箇条書きテキストをパース
  // 例：
  // 日付: 2024-07-01\nタイトル: 夏祭りコンサート\n出演者: DJ AAA/BBB\n会場: CITY JACK\n開場時間: 19:00\n開演時間: 20:00\n入場料: 2,000円（別途ドリンク）\n連絡先: 090-xxxx-xxxx\n
  const eventBlocks = llmOutput.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);
  const parsedEvents = [];
  for (const block of eventBlocks) {
    const dateMatch = block.match(/日付[:：]\s*(.+)/);
    const titleMatch = block.match(/タイトル[:：]\s*(.+)/);
    const performersMatch = block.match(/出演者[:：]\s*(.+)/);
    const venueMatch = block.match(/会場[:：]\s*(.+)/);
    const openTimeMatch = block.match(/開場時間[:：]\s*(.+)/);
    const startTimeMatch = block.match(/開演時間[:：]\s*(.+)/);
    const feeMatch = block.match(/入場料[:：]\s*(.+)/);
    const contactMatch = block.match(/連絡先[:：]\s*(.+)/);
    
    if (dateMatch && titleMatch && contactMatch) {
      parsedEvents.push({
        id: uuidv4(),
        date: dateMatch[1].trim(),
        title: { ja: titleMatch[1].trim(), en: '', zh: '' },
        detail: { ja: '', en: '', zh: '' },
        venue: { ja: venueMatch ? venueMatch[1].trim() : '', en: '', zh: '' },
        open_time: openTimeMatch ? openTimeMatch[1].trim() : '',
        start_time: startTimeMatch ? startTimeMatch[1].trim() : '',
        performers: performersMatch ? performersMatch[1].split(/[／/、,・&\s]+/).filter(Boolean).map(p => ({ ja: p.trim(), en: '', zh: '' })) : [],
        fee: { ja: feeMatch ? feeMatch[1].trim() : '', en: '', zh: '' },
        contact: { ja: contactMatch[1].trim(), en: '', zh: '' },
        link: { ja: '', en: '', zh: '' }
      });
    }
  }

  if (parsedEvents.length === 0) {
    console.error('有効なイベントが抽出できませんでした。Claude出力:', llmOutput);
    process.exit(1);
  }

  // 翻訳処理（完全に無効化）
  console.log('翻訳処理は完全に無効化されています');
  console.log('解析されたイベント数:', parsedEvents.length);

  // 3. バリデーション
  const ajv = new Ajv({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile(newsEventSchema);
  const validEvents = [];
  for (const ev of parsedEvents) {
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
  console.log('保存後のファイルサイズ:', fs.statSync(NEWS_JSON_PATH).size, 'bytes');
  console.log('保存後のイベント数:', news.length);
}

main();
