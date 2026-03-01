#!/usr/bin/env python3
"""从 无障碍相关书籍.docx 解析并生成 books.json"""
import json
import re
from pathlib import Path

from docx import Document

BASE = Path(__file__).resolve().parent.parent
DOCX_PATH = BASE / "data" / "无障碍相关书籍.docx"
OUT_PATH = BASE / "src" / "data" / "books.json"


def main():
    doc = Document(DOCX_PATH)
    books = []
    current = None
    id_counter = 1

    for p in doc.paragraphs:
        text = p.text.strip()
        if not text:
            continue

        # 匹配 "1.书名" 或 "2.xxx" 格式
        num_match = re.match(r"^(\d+)\.\s*(.+)$", text)
        if num_match and len(text) < 80:
            if current and current.get("summary"):
                current["author"] = current.get("author", "未知")
                books.append(current)
                id_counter += 1

            title = num_match.group(2).strip().rstrip(".")
            if title == ".":
                title = ""
            current = {
                "id": str(id_counter),
                "title": title or "",
                "audience": "",
                "summary": "",
                "author": "未知",
                "cover": "/images/books/placeholder.svg",
            }
            continue

        # 适用人群
        if "适用人群" in text or "主要适用人群" in text:
            audience = re.sub(r"^(主要)?适用人群[：:]\s*", "", text)
            if current:
                current["audience"] = audience
            continue

        # 简介（通常为长段落，且不含"适用人群"等关键字）
        if current and not current.get("summary") and len(text) > 30:
            # 从《》中提取书名（若 title 为空）
            if not current["title"] and "《" in text and "》" in text:
                m = re.search(r"《([^》]+)》", text)
                if m:
                    current["title"] = m.group(1)
            current["summary"] = text
            continue

    if current and current.get("summary"):
        current["author"] = current.get("author", "未知")
        books.append(current)

    # 重新编号
    for i, b in enumerate(books, 1):
        b["id"] = str(i)

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(books, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(books)} books to {OUT_PATH}")


if __name__ == "__main__":
    main()
