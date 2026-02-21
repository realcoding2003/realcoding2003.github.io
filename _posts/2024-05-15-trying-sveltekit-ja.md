---
layout: post
title: "SvelteKitに挑戦してみる - またフレームワーク乗り換えか"
date: 2024-05-15 09:00:00 +0900
categories: [Development, Frontend]
tags: [SvelteKit, Svelte, フロントエンド, JavaScript, フレームワーク]
author: "Kevin Park"
lang: ja
excerpt: "Vue.jsを学んだばかりなのに、また新しいフレームワークが気になります。SvelteKitは仮想DOMなしで速いとのこと。試してみることにしました。"
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2024/05/15/trying-sveltekit-ja/
---

# SvelteKit、挑戦してみることにした

## また新しいフレームワーク？

[Vue.jsを学び始めた](/ja/2021/09/20/starting-vuejs-ja/)のがつい最近のようなのに、また新しいフレームワークに目が行ってしまいました。

今回はSvelteKitです。

正直、フロントエンドのフレームワーク戦争は少し疲れます。React、Vue、Angular、そして今度はSvelte。数年ごとに「これが最高だ」というものが変わるので、全部学んでいたらキリがありません。

でもSvelteはちょっと違って見えました。

## Svelteが違う点

ReactやVueは仮想DOMを使います。状態が変わると新しい仮想DOMを作り、前の仮想DOMと比較して実際に変わった部分だけ更新する方式。これが効率的だとされていましたが、Svelteはまったく異なるアプローチを取ります。

**コンパイル時にすべて処理する。**

Svelteはビルド時にコンポーネントを最適化されたvanilla JavaScriptに変換します。ランタイムで仮想DOMの比較のようなことはしません。その結果、バンドルサイズが小さく実行速度が速くなります。

この概念を初めて聞いた時「ああ、そういうことができるんだ」と思いました。シンプルでありながら合理的なアプローチです。

## SvelteKit = Svelte + フルスタック

SvelteKitはSvelteベースのフルスタックフレームワークです。Next.jsがReactのフレームワークであるように。

SSR（サーバーサイドレンダリング）、ルーティング、APIエンドポイントなどを標準で提供します。ファイルベースルーティングなので、ディレクトリ構造を見るだけでURLが分かります：

```
src/routes/
├── +page.svelte          → /
├── about/+page.svelte    → /about
└── blog/[slug]/+page.svelte → /blog/:slug
```

直感的で良いですね。

## コードがスッキリしている

Svelteのコードを初めて見た時に驚いたのは、コード量の少なさです。

Reactで状態管理するにはuseState、useEffectなどのフックが必要で、VueでもRef、reactive、computed等のAPIが必要です。Svelteは？

```svelte
<script>
  let count = 0;
  $: doubled = count * 2;
</script>

<button on:click={() => count++}>
  {count} (doubled: {doubled})
</button>
```

変数を宣言するだけで終わりです。`$:`一つでリアクティブ宣言ができます。ボイラープレートがほぼありません。

## 学ぶ価値はあるか

正直、悩みどころです。

Vueもまだ深く使いこなせていない状態で、また新しいものを学ぶと、あれこれ触るだけで何も身につかない状況になりかねません。「何でもできるけど何も極められない」状態。

でも[怠惰を克服する方法](/ja/2020/03/16/developer-laziness-burnout-ja/)で書いたように、新しい技術を学ぶとモチベーションが戻ります。コーディングが楽しくなるには、知らないことが必要なのです。

まずは簡単なサイドプロジェクトをSvelteKitで作ってみるつもりです。本業のプロジェクトにいきなり導入するのはリスクがあるので、サイドプロジェクトで先に検証します。

また新しいフレームワークにハマるのか、それとも「やっぱりVueが楽だ」となるかは、やってみないと分かりません。
