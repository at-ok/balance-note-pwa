# Balance Note PWA

個人用の残高メモ PWA です。iPhone のホーム画面に追加して、アプリ風に使う前提です。

## 機能

- 現在残高の表示
- テンキー入力
- 支出の減算
- 目立たない加算ボタン
- 直前1回の巻き戻し
- `localStorage` による端末内保存
- オフライン対応 PWA

## セットアップ

```bash
cd web
npm install
npm run dev
```

## GitHub Pages

```bash
cd web
npm run build
```

生成された `web/dist` を Pages に載せれば動きます。
