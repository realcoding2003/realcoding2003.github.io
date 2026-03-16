---
layout: post
title: "JavaScript数値のゼロパディング - padStart()とカスタム関数完全ガイド"
date: 2023-07-10 10:00:00 +0900
categories: [Development, Tips]
tags: [javascript, string-manipulation, formatting, utility, beginner]
author: "Kevin Park"
lang: ja
slug: javascript-number-padding
excerpt: "JavaScript数値の前にゼロを付ける全ての方法！padStart()メソッドからカスタム関数まで、すぐに使えるコードと実践例を提供します。"
permalink: /ja/:year/:month/:day/:title/
redirect_from:
  - /2023/07/10/javascript-number-padding-ja/
  - /ja/2023/07/10/javascript-number-padding-ja/

---

# JavaScript数値のゼロパディング - 完全ガイド

## 🎯 核心解決策（すぐに使用可能）

### 最も多く使用されるパターン

```javascript
// 1. 最新の方法 - padStart()を使用（ES2017+）
const number = 5;
const paddedNumber = number.toString().padStart(2, '0');
console.log(paddedNumber); // "05"

// 2. 再利用のための関数型アプローチ
function pad(num, size = 2) {
    return num.toString().padStart(size, '0');
}

pad(1);   // "01"
pad(9);   // "09" 
pad(10);  // "10"
pad(5, 3); // "005"
```

```javascript
// 3. レガシー環境用カスタム関数
function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

pad(1);  // "01"
pad(9);  // "09"
pad(10); // "10"
```

```javascript
// 4. 様々な桁数をサポートする汎用関数
function zeroPad(num, places) {
    const zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

zeroPad(5, 2);   // "05"
zeroPad(123, 5); // "00123"
```

---

## 📚 詳細説明

### 背景と必要性

数値の前にゼロを付けることは、次のような状況でよく必要になります：

- **時刻表示**: 09:05、01:30
- **日付フォーマット**: 2023-07-01
- **ファイルソート**: file001.txt、file002.txt
- **固定桁数表示**: 商品コード、ID等

### 方法別詳細分析

#### 1. padStart()メソッド（推奨）

```javascript
// 基本的な使用法
const num = 7;
const result = num.toString().padStart(3, '0');
console.log(result); // "007"

// 様々なパディング文字
const text = "5";
console.log(text.padStart(4, '0'));  // "0005"
console.log(text.padStart(4, '*'));  // "***5"
console.log(text.padStart(4));       // "   5"（デフォルト：スペース）
```

**利点：**
- ES2017標準メソッド
- 様々なパディング文字をサポート
- 可読性が良い

**欠点：**
- 古いブラウザで未対応（IE等）

#### 2. カスタム関数（互換性）

```javascript
// シンプルな2桁パディング
function pad(d) {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

// 拡張版
function pad(num, size = 2, char = '0') {
    let s = num.toString();
    while (s.length < size) {
        s = char + s;
    }
    return s;
}

// 使用例
console.log(pad(5));     // "05"
console.log(pad(42, 4)); // "0042"
console.log(pad(3, 3, '*')); // "**3"
```

#### 3. ArrayとjoinWの活用

```javascript
function zeroPad(num, places) {
    const zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

// またはより簡単に
function pad(num, size) {
    return Array(size).join('0').slice((size || 2) * -1) + num;
}
```

### 実際の活用事例

#### 時刻フォーマッティング

```javascript
function formatTime(hours, minutes, seconds) {
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

console.log(formatTime(9, 5, 30)); // "09:05:30"
console.log(formatTime(14, 0, 7)); // "14:00:07"
```

#### 日付フォーマッティング

```javascript
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const today = new Date();
console.log(formatDate(today)); // "2023-07-10"
```

#### 連番生成

```javascript
function generateSequence(start, end, digits = 3) {
    const sequence = [];
    for (let i = start; i <= end; i++) {
        sequence.push(i.toString().padStart(digits, '0'));
    }
    return sequence;
}

console.log(generateSequence(1, 5, 3));
// ["001", "002", "003", "004", "005"]
```

### パフォーマンス比較

```javascript
// パフォーマンステスト（1,000,000回実行）
const numbers = Array.from({length: 1000000}, (_, i) => i);

console.time('padStart');
numbers.forEach(n => n.toString().padStart(2, '0'));
console.timeEnd('padStart'); // 約150ms

console.time('custom function');
numbers.forEach(n => (n < 10) ? '0' + n : n.toString());
console.timeEnd('custom function'); // 約100ms
```

**結論**：カスタム関数が若干高速ですが、実際の使用では差はわずかです

### エラー処理

```javascript
function safePad(value, length = 2, char = '0') {
    // 入力値検証
    if (value === null || value === undefined) {
        return char.repeat(length);
    }
    
    // 数値でない場合の処理
    if (isNaN(value)) {
        return value.toString().padStart(length, char);
    }
    
    return value.toString().padStart(length, char);
}

console.log(safePad(null));      // "00"
console.log(safePad(undefined)); // "00"
console.log(safePad("abc"));     // "0abc"
```

### ブラウザ互換性代替案

```javascript
// padStartがサポートされていない環境でのポリフィル
if (!String.prototype.padStart) {
    String.prototype.padStart = function(targetLength, padString) {
        targetLength = Math.floor(targetLength) || 0;
        if (targetLength < this.length) return this;
        
        padString = String(padString || ' ');
        let pad = '';
        let len = targetLength - this.length;
        
        while (pad.length < len) {
            pad += padString;
        }
        
        return pad.slice(0, len) + this;
    };
}
```

## 結論

JavaScriptで数値の前にゼロを付ける方法はいくつかあります：

1. **最新環境**：`padStart()`メソッドを使用（最も推奨）
2. **レガシー環境**：カスタム関数で簡単実装
3. **高性能が必要**：条件文ベースのカスタム関数

実務ではブラウザサポート範囲を確認した後、`padStart()`を優先使用し、必要に応じてポリフィルやカスタム関数で代替するのが良いでしょう。

### 次のステップ

- [JavaScript文字列操作完全ガイド](リンク)
- [日付フォーマッティングライブラリ比較](リンク)
- [JavaScriptパフォーマンス最適化ティップス](リンク)