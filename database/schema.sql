-- Represents supermarkets we are tracking
CREATE TABLE supermarkets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(32) NOT NULL,
    url TEXT NOT NULL
);

-- Represents products available across stores
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category VARCHAR(32) NOT NULL,
    supermarket_id INTEGER NOT NULL,
    FOREIGN KEY (supermarket_id) REFERENCES supermarkets(id)
);

-- Represents price snapshots over time (the fact table)
CREATE TABLE prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    price REAL NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'NZD',
    scraped_at TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
