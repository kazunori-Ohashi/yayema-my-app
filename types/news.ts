// news.jsonの新スキーマに対応した型定義（多言語対応）

export type LocalizedString = {
  ja: string;
  en: string;
  [key: string]: string;
};

export type NewsEvent = {
  id: string; // 一意ID
  date: string; // YYYY-MM-DD
  title: LocalizedString;
  detail: LocalizedString;
  venue: LocalizedString;
  open_time: string; // 例: "18:00"
  start_time: string; // 例: "18:30"
  performers: LocalizedString;
  fee: LocalizedString;
  contact: LocalizedString;
  link: LocalizedString;
};

export type NewsJson = NewsEvent[]; 