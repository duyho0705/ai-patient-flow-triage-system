CREATE TABLE IF NOT EXISTS pharmacy_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    unit VARCHAR(255) NOT NULL,
    stock_quantity INTEGER
);
