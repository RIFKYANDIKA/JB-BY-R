CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    external_id VARCHAR(100) NOT NULL UNIQUE,
    account_id VARCHAR(100) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    amount BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    invoice_id VARCHAR(100),
    payment_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL
);