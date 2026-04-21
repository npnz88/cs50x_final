# NZ Grocery Price Tracker
### CS50x 2026 — Final Project

## 📌 Overview
A Python ETL pipeline that scrapes grocery prices from Woolworths NZ,
Pak'nSave, and New World, stores snapshots over time in SQLite, and
visualises price comparisons via a Flask web dashboard.

Built as the CS50x final project by [@npnz88](https://github.com/npnz88).

---

## 🛠️ Tech Stack

---

## 📁 Project Structure
- `scraper/` — one file per store, extracts product names & prices
- `etl/` — cleans and normalises data before storing
- `database/` — SQLite database storing price snapshots over time
- `app/` — Flask app serving the comparison dashboard

---

## 🚀 How to Run

```bash
# Install dependencies
pip install -r requirements.txt
playwright install chromium

# Run scrapers
python scraper/woolworths.py
python scraper/paknsave.py
python scraper/newworld.py

# Launch dashboard
flask --app app/app.py run
```

---

## 💡 Design Decisions
*(Fill this in as you build — explain why you made key choices)*

---

## 🤖 AI Usage
This project was built with guidance from Claude (Anthropic) as per
CS50x academic honesty policy for final projects. All code written
and understood by the student.

---

## 📸 Demo
*(Add screenshot or link to your 3-minute video here)*
