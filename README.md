# Telegram 記帳機器人

這是一個用 Python 製作的 Telegram 記帳機器人，支援收入/支出記錄、最近紀錄查詢與月報統計（SQLite）。

## 功能

- `/income 金額 分類 [備註]`：記錄收入
- `/expense 金額 分類 [備註]`：記錄支出
- `/add income|expense 金額 分類 [備註]`：通用新增
- `/list [筆數]`：查看最近記錄（預設 10 筆）
- `/summary [YYYY-MM]`：查看該月收入、支出、結餘（預設本月）

## 快速開始

1. 建立並啟用虛擬環境

```bash
python -m venv .venv
source .venv/bin/activate
```

2. 安裝依賴

```bash
pip install -r requirements.txt
```

3. 設定環境變數

```bash
cp .env.example .env
# 編輯 .env，填入 TELEGRAM_BOT_TOKEN
```

4. 啟動機器人

```bash
python bot.py
```

## 資料儲存

- 預設資料庫：`ledger.db`（可透過 `DB_PATH` 覆蓋）
- 時區：`TIMEZONE`（預設 `Asia/Taipei`）

## 開發測試

```bash
pytest
```
