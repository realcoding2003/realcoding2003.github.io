---
layout: post
title: "git bisectでバグの原因コミットを特定する - 二分探索デバッグ"
date: 2026-03-15 09:00:00 +0900
categories: [Development, Tips]
tags: [Git, git bisect, Debugging, Binary Search]
author: "Kevin Park"
lang: ja
excerpt: "git bisectを使って、バグを導入したコミットを二分探索で素早く特定する方法をご紹介します。"
---

## 問題

ある時点からバグが発生しましたが、コミットが数百件あり、一つずつ確認するのは不可能でした。「先週までは動いていたのに...」と繰り返すばかりでした。

## 解決方法

`git bisect`は二分探索でバグを導入したコミットを見つけてくれます。1024個のコミットでも10回の確認で済みます。

```bash
# bisectを開始
git bisect start

# 現在の状態（バグあり）をbadとしてマーク
git bisect bad

# バグがなかった時点をgoodとしてマーク
git bisect good abc1234
```

gitが中間のコミットにチェックアウトしてくれます。テストして結果を報告します。

```bash
# このコミットにバグがある場合
git bisect bad

# このコミットにバグがない場合
git bisect good

# 繰り返すと原因コミットを特定してくれます
# "abc5678 is the first bad commit"
```

テストスクリプトがあれば完全自動化も可能です。

```bash
# スクリプトの終了コード0ならgood、それ以外ならbad
git bisect run npm test

# または特定のスクリプトを指定
git bisect run ./check-bug.sh
```

終了したら元のブランチに戻ります。

```bash
git bisect reset
```

## ポイント

- コミット数がN個なら最大log2(N)回の確認で済みます。1000コミットでも10回で十分です
- `git bisect run`でテストを自動化すれば、完全に手放しで原因を特定できます
- bisect中にビルドできないコミットに当たった場合は`git bisect skip`でスキップできます
