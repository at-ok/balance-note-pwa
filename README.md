# Balance Note

iPhone 向けの個人用残高メモ PWA です。ホーム画面に追加して、アプリ風に使う前提です。

## 実装場所

- PWA 本体: `web/`

## 主要機能

- 現在残高の表示
- テンキー入力
- 支出の減算
- 補助操作としての加算
- 直前1回の巻き戻し
- `localStorage` による端末内保存
- オフライン対応 PWA

## セットアップ

```bash
cd web
npm install
npm run dev
```

## ビルド

```bash
cd web
npm run build
```

`web/dist` を GitHub Pages に配置すれば動きます。
