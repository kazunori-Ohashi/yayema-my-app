This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

# 八重山観光ガイド プロジェクト仕様・進捗まとめ（2024/06時点）

## プロジェクト方針
- APIサーバー廃止、`public/`配下のjsonファイル（islands.json, contents.json, news.json等）を直接編集・管理
- 管理画面（admin/）もローカルjson直接編集型に統一
- 全体を多言語化（日本語・英語・中国語）
- UI/UX・レスポンシブ・自動テスト重視

## データ管理・多言語化状況
- `public/islands.json`：全項目が `{ja, en, zh}` 構造で多言語化済み
- `public/contents.json`：全項目が `{ja, en, zh}` 構造で多言語化済み
- `public/news.json`：全項目が `{ja, en, zh}` 構造で多言語化済み
- いずれも日本語が主データ、en/zhはAI翻訳初期値

## フロント実装・主要コンポーネント
- `components/hero-section.tsx`：ヒーロースライダー。多言語化・レスポンシブ・自動切替対応
- `components/news-section.tsx`：新着情報。多言語化・日付降順表示
- `components/card-gallery.tsx`：観光スポット一覧。多言語化・画像・抜粋表示
- `components/photo-gallery.tsx`：写真ギャラリー。多言語化・タグ・フィルタ対応
- いずれも`useLanguage`でグローバル言語状態を参照

## グローバル言語管理
- `context/language-context.tsx`：Context APIで言語状態を管理。全ページ・全コンポーネントで即時切替
- 言語切替UIは国旗＋言語名で右上に設置

## 管理画面（admin/）
- `app/admin/news/page.tsx`：news.json編集UI。現状は単言語入力、今後多言語入力UIに拡張予定
- `app/admin/island/page.tsx`：islands.json編集UI。現状は単言語入力、今後多言語入力UIに拡張予定
- `app/admin/activity/page.tsx`：contents.json編集UI。現状は単言語入力、今後多言語入力UIに拡張予定

## 進捗・TODO（2024/06/10時点）
- [x] islands.json, contents.json, news.jsonの多言語化
- [x] HeroSection, NewsSection, CardGallery, PhotoGalleryの多言語対応
- [x] トップページ・ニュースページのエラー解消
- [x] UI自動テスト・エラー検知ループ導入
- [ ] 管理画面の多言語入力UI対応（**今後対応予定**）
- [ ] UI/UX・国旗UI・ナビゲーション等の強化（**今後対応予定**）

---

## ファイル単位の現状まとめ

### public/
- islands.json：全項目多言語化済み
- contents.json：全項目多言語化済み
- news.json：全項目多言語化済み

### components/
- hero-section.tsx：多言語化・UI/UX対応済み
- news-section.tsx：多言語化・UI/UX対応済み
- card-gallery.tsx：多言語化・UI/UX対応済み
- photo-gallery.tsx：多言語化・UI/UX対応済み

### context/
- language-context.tsx：グローバル言語状態管理。全体で利用

### app/admin/
- news/page.tsx：news.json編集UI。多言語入力UIは未対応
- island/page.tsx：islands.json編集UI。多言語入力UIは未対応
- activity/page.tsx：contents.json編集UI。多言語入力UIは未対応

---

## 今後の予定
- 管理画面の多言語入力UI対応
- UI/UX・国旗UI・ナビゲーション等の強化
- 自動テスト・エラー検知ループの継続

---

## プロジェクト運用ルール（必読）

### 作業前・作業後の記録ルール
- **必ず以下3点をREADMEまたはPR/Issue等に記載してください：**
  1. **何をしようとしているか**（目的・作業内容の要約）
  2. **どこまで出来ているか**（進捗・現状・未完了点）
  3. **どのファイルがどの役割・進捗か**（ファイル単位での役割・対応状況）
- これを怠ると、進捗の可視化・引き継ぎ・レビューが困難になります。
- **PRやIssue、READMEの追記欄などに必ず記載してください。**

---
