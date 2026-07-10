CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(16) PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  phone VARCHAR(10) NOT NULL,
  email VARCHAR(120) NOT NULL,
  address VARCHAR(200) NOT NULL,
  city VARCHAR(40) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NULL DEFAULT NULL,

  UNIQUE KEY uq_customers_phone (phone),
  UNIQUE KEY uq_customers_email (email)
);

