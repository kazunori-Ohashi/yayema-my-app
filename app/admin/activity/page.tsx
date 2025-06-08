'use client'
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Pencil } from "lucide-react";

const CATEGORY_OPTIONS = [
  { key: "beach", label: "ビーチ" },
  { key: "nature", label: "自然" },
  { key: "culture", label: "文化" },
  { key: "gourmet", label: "グルメ" },
];

type Content = {
  id: string;
  title: string;
  category: string;
  description: string;
  heroSectionComment?: string;
  image: string[] | string;
  isHero?: boolean;
  latitude?: number;
  longitude?: number;
};

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Content | null>(null);
  const [form, setForm] = useState<{ title: string; category: string; description: string; heroSectionComment: string; mainImage: { type: string; value: string }; subImages: { type: string; value: string }[]; isHero: boolean; latitude?: number; longitude?: number; }>(
    { title: "", category: "beach", description: "", heroSectionComment: "", mainImage: { type: "local", value: "" }, subImages: [{ type: "local", value: "" }], isHero: false, latitude: undefined, longitude: undefined }
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 一覧取得
  const fetchContents = () => {
    setLoading(true);
    fetch("http://localhost:4000/api/contents")
      .then((res) => {
        if (!res.ok) throw new Error("APIエラー");
        return res.json();
      })
      .then((data) => {
        setContents(data);
        setError("");
      })
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (mounted) fetchContents();
  }, [mounted]);

  // フォーム初期化
  const openNewDialog = () => {
    setEditTarget(null);
    setForm({ title: "", category: "beach", description: "", heroSectionComment: "", mainImage: { type: "local", value: "" }, subImages: [{ type: "local", value: "" }], isHero: false, latitude: undefined, longitude: undefined });
    setDialogOpen(true);
  };
  const openEditDialog = (item: Content) => {
    setEditTarget(item);
    // image: 配列 or 文字列
    let mainImage = { type: "local", value: "" };
    let subImages = [{ type: "local", value: "" }];
    if (Array.isArray(item.image)) {
      mainImage = { type: item.image[0]?.startsWith("http") ? "url" : "local", value: item.image[0] || "" };
      subImages = item.image.slice(1).map(img => ({
        type: img.startsWith("http") ? "url" : "local",
        value: img
      }));
      if (subImages.length === 0) subImages = [{ type: "local", value: "" }];
    } else if (typeof item.image === "string") {
      mainImage = { type: item.image.startsWith("http") ? "url" : "local", value: item.image };
      subImages = [{ type: "local", value: "" }];
    }
    const newForm = {
      title: item.title,
      category: item.category || "",
      description: item.description || "",
      heroSectionComment: item.heroSectionComment || "",
      mainImage,
      subImages,
      isHero: !!item.isHero,
      latitude: item.latitude ?? undefined,
      longitude: item.longitude ?? undefined,
    };
    setForm(newForm);
    setDialogOpen(true);
  };

  // 入力ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : name === "latitude" || name === "longitude" ? (value === "" ? undefined : parseFloat(value)) : value }));
  };
  const handleCategoryChange = (val: string) => {
    setForm((prev) => ({ ...prev, category: val }));
  };
  const handleHeroChange = (checked: boolean) => {
    setForm((prev) => ({ ...prev, isHero: !!checked }));
  };
  const handleMainImageTypeChange = (val: string) => setForm((prev) => ({ ...prev, mainImage: { ...prev.mainImage, type: val } }));
  const handleMainImageValueChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, mainImage: { ...prev.mainImage, value: e.target.value } }));
  const handleSubImageTypeChange = (idx: number, val: string) => setForm((prev) => ({ ...prev, subImages: prev.subImages.map((img, i) => i === idx ? { ...img, type: val } : img) }));
  const handleSubImageValueChange = (idx: number, val: string) => setForm((prev) => ({ ...prev, subImages: prev.subImages.map((img, i) => i === idx ? { ...img, value: val } : img) }));
  const addSubImage = () => setForm((prev) => ({ ...prev, subImages: [...prev.subImages, { type: "local", value: "" }] }));
  const removeSubImage = (idx: number) => setForm((prev) => ({ ...prev, subImages: prev.subImages.filter((_, i) => i !== idx) }));

  // 保存（新規・編集）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("タイトルは必須です");
    if (!form.category) return alert("カテゴリは必須です");
    if (!form.mainImage.value.trim()) return alert("代表画像は必須です");
    setSaving(true);
    try {
      const method = editTarget ? "PUT" : "POST";
      const url = editTarget
        ? `http://localhost:4000/api/contents/${editTarget.id}`
        : "http://localhost:4000/api/contents";
      const image = [
        form.mainImage.value,
        ...form.subImages.map((img) => img.value).filter((v) => v.trim())
      ].filter(Boolean);
      const { mainImage, subImages, ...rest } = form;
      const body = {
        ...rest,
        image,
      };
      console.log('API送信body', body);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      setDialogOpen(false);
      fetchContents();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  // 削除
  const handleDelete = async (id: string) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/contents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("削除に失敗しました");
      fetchContents();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="container mx-auto py-12 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-8 text-gray-900">CMS管理画面</h1>
      <div className="mb-6 flex justify-end">
        <Button onClick={openNewDialog}>新規作成</Button>
      </div>
      {loading ? (
        <div className="text-gray-700">読み込み中...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-700">タイトル</TableHead>
              <TableHead className="text-gray-700">カテゴリ</TableHead>
              <TableHead className="text-gray-700">ヒーロー表示</TableHead>
              <TableHead className="text-gray-700">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contents.map((item) => (
              <TableRow key={item.id} className="bg-white hover:bg-gray-50">
                <TableCell className="text-gray-900">
                  <a href={`/detail/${item.id}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-700">{item.title}</a>
                </TableCell>
                <TableCell className="text-gray-800">{CATEGORY_OPTIONS.find((c) => c.key === item.category)?.label || item.category}</TableCell>
                <TableCell className="text-gray-800">{item.isHero ? "○" : "-"}</TableCell>
                <TableCell>
                  <div className="flex flex-row gap-2">
                    <Button
                      size="sm"
                      style={{
                        backgroundColor: '#16a34a',
                        borderColor: '#16a34a',
                        color: '#fff',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        fontWeight: 600,
                      }}
                      className="flex items-center gap-1"
                      onClick={() => openEditDialog(item)}
                    >
                      <Pencil size={16} className="inline-block" />
                      <span>編集</span>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>削除</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ background: '#fff', color: '#222', maxHeight: '400px', overflowY: 'auto' }}>
          <DialogTitle>{editTarget ? "コンテンツ編集" : "新規作成"}</DialogTitle>
          <DialogDescription>
            タイトル・カテゴリ・説明・画像などを入力してください。
          </DialogDescription>
          <form onSubmit={handleSubmit} className="space-y-4" style={{ color: '#222' }}>
            <div>
              <label className="block mb-1 font-medium">タイトル</label>
              <Input name="title" value={form.title} onChange={handleChange} required style={{ color: '#222', background: '#fff' }} />
            </div>
            <div>
              <label className="block mb-1 font-medium">カテゴリ</label>
              <Select value={form.category} onValueChange={handleCategoryChange}>
                <SelectTrigger style={{ color: '#222', background: '#fff' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ color: '#222', background: '#fff' }}>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat.key} value={cat.key} style={{ color: '#222', background: '#fff' }}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-medium">説明</label>
              <Input name="description" value={form.description} onChange={handleChange} style={{ color: '#222', background: '#fff' }} />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">ヒーローセクション用短文コメント</label>
              <Input
                name="heroSectionComment"
                value={form.heroSectionComment}
                onChange={handleChange}
                placeholder="例: 石垣島随一の絶景スポット"
                style={{ color: '#222', background: '#fff' }}
                maxLength={32}
              />
              <div className="text-xs text-gray-500">※ヒーローセクションの写真上に短く表示されます（32文字以内推奨）</div>
            </div>
            <div>
              <label className="block mb-1 font-medium">代表画像</label>
              <RadioGroup value={form.mainImage.type} onValueChange={handleMainImageTypeChange} className="mb-2 flex flex-row gap-4">
                <RadioGroupItem value="local" id="main-local" />
                <label htmlFor="main-local">ローカルパス</label>
                <RadioGroupItem value="url" id="main-url" />
                <label htmlFor="main-url">外部URL</label>
              </RadioGroup>
              <Input
                name="mainImage"
                value={form.mainImage.value}
                onChange={handleMainImageValueChange}
                placeholder={form.mainImage.type === "local" ? "/images/xxx.jpg" : "https://..."}
                style={{ color: '#222', background: '#fff' }}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">サブ画像（複数可）</label>
              {form.subImages.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-1">
                  <RadioGroup value={img.type} onValueChange={(val) => handleSubImageTypeChange(idx, val)} className="flex flex-row gap-2">
                    <RadioGroupItem value="local" id={`sub-local-${idx}`} />
                    <label htmlFor={`sub-local-${idx}`}>ローカル</label>
                    <RadioGroupItem value="url" id={`sub-url-${idx}`} />
                    <label htmlFor={`sub-url-${idx}`}>URL</label>
                  </RadioGroup>
                  <Input
                    value={img.value}
                    onChange={(e) => handleSubImageValueChange(idx, e.target.value)}
                    placeholder={img.type === "local" ? "/images/xxx.jpg" : "https://..."}
                    style={{ color: '#222', background: '#fff' }}
                  />
                  <Button type="button" size="sm" variant="destructive" onClick={() => removeSubImage(idx)} disabled={form.subImages.length === 1}>削除</Button>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={addSubImage}>サブ画像を追加</Button>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="isHero" checked={!!form.isHero} onCheckedChange={handleHeroChange} />
              <label htmlFor="isHero" className="font-medium">ヒーローセクションに表示</label>
            </div>
            <div className="flex gap-4">
              <div>
                <label className="block mb-1 font-medium">緯度</label>
                <Input name="latitude" type="number" step="any" value={form.latitude ?? ""} onChange={handleChange} placeholder="例: 24.3405" style={{ color: '#222', background: '#fff' }} />
              </div>
              <div>
                <label className="block mb-1 font-medium">経度</label>
                <Input name="longitude" type="number" step="any" value={form.longitude ?? ""} onChange={handleChange} placeholder="例: 124.1550" style={{ color: '#222', background: '#fff' }} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>キャンセル</Button>
              <Button type="submit" disabled={saving}>{editTarget ? "更新" : "作成"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 