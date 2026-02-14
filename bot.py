from __future__ import annotations
import logging
import os
import sqlite3
from contextlib import closing
from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo

from typing import Any

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:
    load_dotenv = None

try:
    from telegram import Update
    from telegram.ext import Application, CommandHandler, ContextTypes
except ModuleNotFoundError:
    Update = Any
    Application = None
    CommandHandler = None
    ContextTypes = Any


logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)


@dataclass
class Record:
    user_id: int
    kind: str
    amount: float
    category: str
    note: str
    created_at: str


class LedgerDB:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    def _init_db(self) -> None:
        with closing(self._get_conn()) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    kind TEXT NOT NULL CHECK(kind IN ('income', 'expense')),
                    amount REAL NOT NULL CHECK(amount > 0),
                    category TEXT NOT NULL,
                    note TEXT,
                    created_at TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def add_record(self, record: Record) -> None:
        with closing(self._get_conn()) as conn:
            conn.execute(
                """
                INSERT INTO records (user_id, kind, amount, category, note, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    record.user_id,
                    record.kind,
                    record.amount,
                    record.category,
                    record.note,
                    record.created_at,
                ),
            )
            conn.commit()

    def latest_records(self, user_id: int, limit: int = 10):
        with closing(self._get_conn()) as conn:
            cur = conn.execute(
                """
                SELECT kind, amount, category, note, created_at
                FROM records
                WHERE user_id = ?
                ORDER BY id DESC
                LIMIT ?
                """,
                (user_id, limit),
            )
            return cur.fetchall()

    def summary_by_month(self, user_id: int, ym: str):
        with closing(self._get_conn()) as conn:
            cur = conn.execute(
                """
                SELECT
                    SUM(CASE WHEN kind='income' THEN amount ELSE 0 END) AS income,
                    SUM(CASE WHEN kind='expense' THEN amount ELSE 0 END) AS expense
                FROM records
                WHERE user_id = ? AND substr(created_at, 1, 7) = ?
                """,
                (user_id, ym),
            )
            row = cur.fetchone()
            income = float(row[0] or 0)
            expense = float(row[1] or 0)
            return income, expense, income - expense


def parse_add_args(args: list[str], fallback_kind: str | None = None):
    """Parses args to (kind, amount, category, note)."""
    if fallback_kind:
        if len(args) < 2:
            raise ValueError("格式錯誤：需要金額與分類")
        kind = fallback_kind
        amount_str = args[0]
        category = args[1]
        note = " ".join(args[2:]) if len(args) > 2 else ""
    else:
        if len(args) < 3:
            raise ValueError("格式錯誤：/add 類型 金額 分類 [備註]")
        kind = args[0].lower()
        amount_str = args[1]
        category = args[2]
        note = " ".join(args[3:]) if len(args) > 3 else ""

    if kind not in {"income", "expense"}:
        raise ValueError("類型需為 income 或 expense")

    try:
        amount = float(amount_str)
    except ValueError as exc:
        raise ValueError("金額需為數字") from exc

    if amount <= 0:
        raise ValueError("金額需大於 0")

    return kind, amount, category, note


def now_iso(tz_name: str) -> str:
    return datetime.now(ZoneInfo(tz_name)).strftime("%Y-%m-%d %H:%M:%S")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    msg = (
        "👋 歡迎使用記帳機器人\n\n"
        "可用指令：\n"
        "/income 金額 分類 [備註]\n"
        "/expense 金額 分類 [備註]\n"
        "/add income|expense 金額 分類 [備註]\n"
        "/list [筆數]\n"
        "/summary [YYYY-MM]"
    )
    await update.message.reply_text(msg)


async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await start(update, context)


async def add(update: Update, context: ContextTypes.DEFAULT_TYPE, fallback_kind: str | None = None) -> None:
    db: LedgerDB = context.bot_data["db"]
    tz_name: str = context.bot_data["timezone"]

    try:
        kind, amount, category, note = parse_add_args(context.args, fallback_kind=fallback_kind)
    except ValueError as err:
        await update.message.reply_text(f"❌ {err}")
        return

    record = Record(
        user_id=update.effective_user.id,
        kind=kind,
        amount=amount,
        category=category,
        note=note,
        created_at=now_iso(tz_name),
    )
    db.add_record(record)
    emoji = "💰" if kind == "income" else "🧾"
    await update.message.reply_text(
        f"{emoji} 已記錄：{kind} {amount:.2f} / {category}" + (f" / {note}" if note else "")
    )


async def income(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await add(update, context, fallback_kind="income")


async def expense(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await add(update, context, fallback_kind="expense")


async def add_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await add(update, context, fallback_kind=None)


async def list_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    db: LedgerDB = context.bot_data["db"]
    limit = 10
    if context.args:
        try:
            limit = max(1, min(50, int(context.args[0])))
        except ValueError:
            await update.message.reply_text("❌ 筆數需為整數")
            return

    rows = db.latest_records(update.effective_user.id, limit)
    if not rows:
        await update.message.reply_text("目前沒有紀錄。")
        return

    lines = ["📒 最近紀錄："]
    for kind, amount, category, note, created_at in rows:
        sign = "+" if kind == "income" else "-"
        lines.append(f"{created_at} {sign}{amount:.2f} [{category}] {note}".rstrip())

    await update.message.reply_text("\n".join(lines))


async def summary_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    db: LedgerDB = context.bot_data["db"]
    tz_name: str = context.bot_data["timezone"]
    ym = context.args[0] if context.args else datetime.now(ZoneInfo(tz_name)).strftime("%Y-%m")

    if len(ym) != 7 or ym[4] != "-":
        await update.message.reply_text("❌ 格式需為 YYYY-MM")
        return

    income_amt, expense_amt, balance = db.summary_by_month(update.effective_user.id, ym)
    await update.message.reply_text(
        f"📊 {ym} 月報\n收入：{income_amt:.2f}\n支出：{expense_amt:.2f}\n結餘：{balance:.2f}"
    )


def main() -> None:
    if load_dotenv is None or Application is None or CommandHandler is None:
        raise RuntimeError("請先安裝 requirements.txt 內的套件")

    load_dotenv()
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not token:
        raise RuntimeError("請設定 TELEGRAM_BOT_TOKEN")

    db_path = os.getenv("DB_PATH", "ledger.db")
    timezone = os.getenv("TIMEZONE", "Asia/Taipei")

    db = LedgerDB(db_path)
    app = Application.builder().token(token).build()
    app.bot_data["db"] = db
    app.bot_data["timezone"] = timezone

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("add", add_cmd))
    app.add_handler(CommandHandler("income", income))
    app.add_handler(CommandHandler("expense", expense))
    app.add_handler(CommandHandler("list", list_cmd))
    app.add_handler(CommandHandler("summary", summary_cmd))

    logger.info("Bot is running...")
    app.run_polling()


if __name__ == "__main__":
    main()
