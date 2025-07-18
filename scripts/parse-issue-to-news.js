#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { v4: uuidv4 } = require('uuid');

// 設定
const NEWS_JSON_PATH = path.resolve(__dirname, '../public/news.json');
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.CLAUDE_CODE_OAUTH_TOKEN;

// イベントごとに翻訳する関数
async function translateEvent(event, eventIndex) {
  console.log(`イベント${eventIndex}の翻訳を開始...`);
  
  try {
    // タイトル翻訳
    if (event.title.ja) {
      const titlePrompt = `以下の日本語テキストを英語と中国語（繁体字）に翻訳してください。

**出力形式:**
英語: [英語翻訳]
中国語: [中国語翻訳]

**翻訳対象:**
${event.title.ja}`;
      
      const titleResult = execSync(`claude "${titlePrompt}"`, { encoding: 'utf-8', env: process.env });
      const titleTranslations = parseSimpleTranslation(titleResult);
      if (titleTranslations.en) event.title.en = titleTranslations.en;
      if (titleTranslations.zh) event.title.zh = titleTranslations.zh;
    }
    
    // 詳細翻訳
    if (event.detail.ja) {
      const detailPrompt = `以下の日本語テキストを英語と中国語（繁体字）に翻訳してください。

**出力形式:**
英語: [英語翻訳]
中国語: [中国語翻訳]

**翻訳対象:**
${event.detail.ja}`;
      
      const detailResult = execSync(`claude "${detailPrompt}"`, { encoding: 'utf-8', env: process.env });
      const detailTranslations = parseSimpleTranslation(detailResult);
      if (detailTranslations.en) event.detail.en = detailTranslations.en;
      if (detailTranslations.zh) event.detail.zh = detailTranslations.zh;
    }
    
    // 会場翻訳
    if (event.venue.ja) {
      const venuePrompt = `以下の日本語テキストを英語と中国語（繁体字）に翻訳してください。

**出力形式:**
英語: [英語翻訳]
中国語: [中国語翻訳]

**翻訳対象:**
${event.venue.ja}`;
      
      const venueResult = execSync(`claude "${venuePrompt}"`, { encoding: 'utf-8', env: process.env });
      const venueTranslations = parseSimpleTranslation(venueResult);
      if (venueTranslations.en) event.venue.en = venueTranslations.en;
      if (venueTranslations.zh) event.venue.zh = venueTranslations.zh;
    }
    
    // 料金翻訳
    if (event.fee.ja) {
      const feePrompt = `以下の日本語テキストを英語と中国語（繁体字）に翻訳してください。

**出力形式:**
英語: [英語翻訳]
中国語: [中国語翻訳]

**翻訳対象:**
${event.fee.ja}`;
      
      const feeResult = execSync(`claude "${feePrompt}"`, { encoding: 'utf-8', env: process.env });
      const feeTranslations = parseSimpleTranslation(feeResult);
      if (feeTranslations.en) event.fee.en = feeTranslations.en;
      if (feeTranslations.zh) event.fee.zh = feeTranslations.zh;
    }
    
    // 連絡先翻訳
    if (event.contact.ja) {
      const contactPrompt = `以下の日本語テキストを英語と中国語（繁体字）に翻訳してください。

**出力形式:**
英語: [英語翻訳]
中国語: [中国語翻訳]

**翻訳対象:**
${event.contact.ja}`;
      
      const contactResult = execSync(`claude "${contactPrompt}"`, { encoding: 'utf-8', env: process.env });
      const contactTranslations = parseSimpleTranslation(contactResult);
      if (contactTranslations.en) event.contact.en = contactTranslations.en;
      if (contactTranslations.zh) event.contact.zh = contactTranslations.zh;
    }
    
    // 出演者翻訳
    for (let i = 0; i < event.performers.length; i++) {
      if (event.performers[i].ja) {
        const performerPrompt = `以下の日本語テキストを英語と中国語（繁体字）に翻訳してください。

**出力形式:**
英語: [英語翻訳]
中国語: [中国語翻訳]

**翻訳対象:**
${event.performers[i].ja}`;
        
        const performerResult = execSync(`claude "${performerPrompt}"`, { encoding: 'utf-8', env: process.env });
        const performerTranslations = parseSimpleTranslation(performerResult);
        if (performerTranslations.en) event.performers[i].en = performerTranslations.en;
        if (performerTranslations.zh) event.performers[i].zh = performerTranslations.zh;
      }
    }
    
    console.log(`イベント${eventIndex}の翻訳が完了しました`);
  } catch (error) {
    console.error(`イベント${eventIndex}の翻訳エラー:`, error.message);
  }
}

// シンプルな翻訳結果をパースする関数
function parseSimpleTranslation(output) {
  const translations = { en: '', zh: '' };
  const lines = output.split('\n').map(line => line.trim());
  
  for (const line of lines) {
    const enMatch = line.match(/^英語[:：]\s*(.*)/);
    if (enMatch) {
      translations.en = enMatch[1].trim();
      continue;
    }
    const zhMatch = line.match(/^中国語[:：]\s*(.*)/);
    if (zhMatch) {
      translations.zh = zhMatch[1].trim();
      continue;
    }
  }
  
  return translations;
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
const prompt = `以下の日本語イベント情報を解析し、各イベントについて以下の形式で出力してください。

**出力形式:**
日付: [YYYY-MM-DD形式]
タイトル: [イベントタイトル]
詳細: [イベントの詳細説明]
出演者: [出演者名（複数の場合は/で区切る）]
会場: [会場名]
開場時間: [HH:MM形式]
開演時間: [HH:MM形式]
入場料: [料金情報]無修正スト期待
連絡先: [電話番号やURLなど]

**重要:**
- 各項目は「項目名: 内容」の形式で出力
- 複数のイベントがある場合は、イベント間に空行を入れる
- 不明な項目は空欄にする
- 余計な説明は不要
- 出演者は「出演者: 名前1/名前2」の形式で出力
- 詳細はイベントの説明文のみを出力（出演者情報は含めない）
- 会場は「会場: 会場名」の形式で出力
- 入場料は「入場料: 料金情報」の形式で出力
- 連絡先は「連絡先: 電話番号やURL」の形式で出力
- 期間表記（例：7月1日〜27日）は開始日-終了日の形式で出力（例：2025-07-01-2025-07-27）
- 複数日表記（例：7月19日・20日）はカンマ区切りで出力（例：2025-07-19, 2025-07-20）

【解析対象のイベント情報】
${issueBody}`;

async function main() {
  let llmOutput = '';
  try {
    console.log('Claude Code SDK呼び出し開始...');
    console.log('プロンプト:', prompt);
    
    llmOutput = execSync(`claude "${prompt}"`, { encoding: 'utf-8', env: process.env });
  } catch (e) {
    console.error('Claude CLI呼び出しエラー:', e.message);
    process.exit(1);
  }

  console.log('Claude出力（デバッグ用）:', llmOutput);

  // 箇条書きテキストをパース
  const eventBlocks = llmOutput.split(/\n{2,}/).map(block => block.trim()).filter(Boolean);
  const parsedEvents = [];
  
  for (const block of eventBlocks) {
    // 各行を「フィールド名: 内容」の形式で抽出
    const lines = block.split('\n').map(line => line.trim()).filter(Boolean);
    const eventData = {};
    
    for (const line of lines) {
      // 「フィールド名: 内容」の形式でマッチ
      const match = line.match(/^([^:：]+)[:：]\s*(.+)$/);
      if (match) {
        const fieldName = match[1].trim();
        const content = match[2].trim();
        
        // フィールド名を正規化
        const normalizedField = fieldName.replace(/\s+/g, '');
        
        // 既存の内容がある場合は追加（複数行の場合）
        if (eventData[normalizedField]) {
          eventData[normalizedField] += ' ' + content;
        } else {
          eventData[normalizedField] = content;
        }
      }
    }
    
    // デバッグ用：抽出されたデータを出力
    console.log('パース結果:', eventData);
    
    // 必須フィールドの確認
    if (eventData['日付'] && eventData['タイトル']) {
      // 日付の処理（期間表記と複数日表記の対応）
      let date = eventData['日付'];
      
      // 期間表記（YYYY-MM-DD-YYYY-MM-DD）の場合は範囲表記に変換
      if (date.includes('-') && date.split('-').length === 6) {
        const parts = date.split('-');
        const startDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const endDate = `${parts[3]}-${parts[4]}-${parts[5]}`;
        date = `${startDate}〜${endDate}`;
      }
      // 複数日表記（YYYY-MM-DD, YYYY-MM-DD）の場合はそのまま保持
      else if (date.includes(',') && date.split(',').length === 2) {
        // カンマ区切りの複数日はそのまま使用
        date = date.trim();
      }
      
      // 連絡先がない場合は空文字列で初期化
      const contact = eventData['連絡先'] || '';
      // 開場時間と開演時間の処理を改善
      let openTime = eventData['開場時間'] || '';
      let startTime = eventData['開演時間'] || '';
      
      // 他のフィールドのラベルが混入している場合は除去
      openTime = openTime.replace(/^(開演時間|入場料|連絡先)[:：]\s*/, '');
      startTime = startTime.replace(/^(開場時間|入場料|連絡先)[:：]\s*/, '');
      
      // 詳細フィールドから出演者情報を除去
      let detail = eventData['詳細'] || '';
      detail = detail.replace(/^出演者[:：]\s*/, '');
      
      // 出演者フィールドから会場情報を除去
      let performers = eventData['出演者'] || '';
      performers = performers.replace(/^会場[:：]\s*/, '');
      
      // 料金フィールドから連絡先情報を除去
      let fee = eventData['入場料'] || '';
      fee = fee.replace(/^連絡先[:：]\s*/, '');
      
              parsedEvents.push({
          id: uuidv4(),
          date: date,
          title: { ja: eventData['タイトル'], en: '', zh: '' },
          detail: { ja: detail, en: '', zh: '' },
          venue: { ja: eventData['会場'] || '', en: '', zh: '' },
          open_time: openTime,
          start_time: startTime,
          performers: performers ? performers.split(/[／/、,・&\s]+/).filter(Boolean).map(p => ({ ja: p.trim(), en: '', zh: '' })) : [],
          fee: { ja: fee, en: '', zh: '' },
          contact: { ja: contact, en: '', zh: '' },
          link: { ja: '', en: '', zh: '' }
        });
    }
  }

  if (parsedEvents.length === 0) {
    console.error('有効なイベントが抽出できませんでした。Claude出力:', llmOutput);
    process.exit(1);
  }

  // 同じタイトルのイベントを統合
  console.log('イベント統合処理を開始...');
  const mergedEvents = [];
  const titleMap = new Map();
  
  for (const event of parsedEvents) {
    const title = event.title.ja;
    if (titleMap.has(title)) {
      // 既存のイベントに統合
      const existingEvent = titleMap.get(title);
      console.log(`イベント統合: "${title}" - ${existingEvent.date} + ${event.date}`);
      
      // 日付を統合（複数日の場合）
      if (existingEvent.date !== event.date) {
        // 日付の範囲をチェック
        const existingDates = existingEvent.date.split(',').map(d => d.trim());
        const newDate = event.date.trim();
        
        if (!existingDates.includes(newDate)) {
          existingDates.push(newDate);
          // 日付をソートして範囲を判定
          existingDates.sort();
          
          // 連続した日付の場合は範囲表記に変更
          const firstDate = existingDates[0];
          const lastDate = existingDates[existingDates.length - 1];
          
          if (existingDates.length > 2) {
            // 3日以上の場合は範囲表記
            existingEvent.date = `${firstDate}〜${lastDate}`;
          } else {
            // 2日のみの場合はカンマ区切り
            existingEvent.date = existingDates.join(', ');
          }
        }
      }
      
      // 開演時間を統合
      if (event.start_time && existingEvent.start_time !== event.start_time) {
        existingEvent.start_time = `${existingEvent.start_time}, ${event.start_time}`;
      }
      
      // 開場時間を統合
      if (event.open_time && existingEvent.open_time !== event.open_time) {
        existingEvent.open_time = `${existingEvent.open_time}, ${event.open_time}`;
      }
    } else {
      // 新しいイベントとして追加
      titleMap.set(title, event);
      mergedEvents.push(event);
    }
  }
  
  console.log(`統合前: ${parsedEvents.length}件, 統合後: ${mergedEvents.length}件`);
  parsedEvents.length = 0;
  parsedEvents.push(...mergedEvents);

  // 翻訳処理
  console.log('翻訳処理を開始します...');
  for (let i = 0; i < parsedEvents.length; i++) {
    await translateEvent(parsedEvents[i], i);
  }
  console.log('全イベントの翻訳が完了しました');
  
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
    const newsContent = fs.readFileSync(NEWS_JSON_PATH, 'utf-8');
    // 空のファイルの場合は初期化
    if (newsContent.trim() === '') {
      news = [];
    } else {
      news = JSON.parse(newsContent);
    }
  } catch (e) {
    // ファイルが存在しない場合やJSONパースエラーの場合は空配列で初期化
    news = [];
  }
  news.push(...validEvents);
  news.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  fs.writeFileSync(NEWS_JSON_PATH, JSON.stringify(news, null, 2));

  console.log(`news.jsonに${validEvents.length}件追加・保存しました`);
  console.log('保存後のファイルサイズ:', fs.statSync(NEWS_JSON_PATH).size, 'bytes');
  console.log('保存後のイベント数:', news.length);
}

main();
