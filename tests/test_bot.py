from bot import LedgerDB, Record, parse_add_args


def test_parse_add_args_with_add_command():
    kind, amount, category, note = parse_add_args(["expense", "120", "meal", "lunch"])
    assert kind == "expense"
    assert amount == 120
    assert category == "meal"
    assert note == "lunch"


def test_parse_add_args_with_shortcut_command():
    kind, amount, category, note = parse_add_args(["1800", "salary", "jan"], fallback_kind="income")
    assert kind == "income"
    assert amount == 1800
    assert category == "salary"
    assert note == "jan"


def test_ledger_db_summary(tmp_path):
    db = LedgerDB(str(tmp_path / "test.db"))
    db.add_record(
        Record(
            user_id=1,
            kind="income",
            amount=1000,
            category="salary",
            note="",
            created_at="2026-02-01 09:00:00",
        )
    )
    db.add_record(
        Record(
            user_id=1,
            kind="expense",
            amount=200,
            category="food",
            note="",
            created_at="2026-02-02 12:00:00",
        )
    )

    income, expense, balance = db.summary_by_month(1, "2026-02")
    assert income == 1000
    assert expense == 200
    assert balance == 800
