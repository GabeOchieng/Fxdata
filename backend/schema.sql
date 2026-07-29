-- KaziHub — PostgreSQL schema (reference DDL).
-- The application creates tables via SQLAlchemy metadata / Alembic; this file
-- documents the canonical Postgres shape from the technical brief.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- fuzzy search

-- ── ENUMS ──────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin', 'caretaker');
CREATE TYPE listing_status AS ENUM ('active', 'paused', 'pending', 'suspended');
CREATE TYPE rental_type AS ENUM (
  'bedsitter','sq','studio','1br','2br','3br',
  'shared','hostel','short_stay','furnished_apt',
  'office','shop','event_space','land'
);
CREATE TYPE rental_availability AS ENUM ('now','30days','60days');
CREATE TYPE order_type AS ENUM ('service','rental','product');
CREATE TYPE order_status AS ENUM (
  'pending','confirmed','in_progress','completed','cancelled','refunded'
);
CREATE TYPE delivery_type AS ENUM ('pickup','cbd','nairobi','outside','upcountry');
CREATE TYPE payment_method AS ENUM ('mpesa','card','cash','wallet');
CREATE TYPE payment_status AS ENUM ('pending','processing','paid','failed','refunded');

-- ── USERS ──────────────────────────────────────────────────────
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone           VARCHAR(20) UNIQUE,
  email           VARCHAR(255) UNIQUE,
  name            VARCHAR(255) NOT NULL,
  role            user_role NOT NULL DEFAULT 'buyer',
  password_hash   TEXT,
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio         TEXT,
  avatar_url  TEXT,
  location    VARCHAR(255),
  area        VARCHAR(100),
  whatsapp    VARCHAR(20),
  xp          INTEGER DEFAULT 0,
  jobs_done   INTEGER DEFAULT 0,
  rating      NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  response_time VARCHAR(50),
  UNIQUE(user_id)
);

-- ── CATEGORIES ─────────────────────────────────────────────────
CREATE TABLE categories (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,
  slug      VARCHAR(100) NOT NULL UNIQUE,
  icon      VARCHAR(10),
  color     VARCHAR(20),
  parent_id INTEGER REFERENCES categories(id)
);

-- ── SERVICE LISTINGS ───────────────────────────────────────────
CREATE TABLE service_listings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id),
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  price_from  NUMERIC(10,2),
  workers     INTEGER DEFAULT 1,
  jobs_done   INTEGER DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  xp          INTEGER DEFAULT 0,
  status      listing_status DEFAULT 'pending',
  area        VARCHAR(100),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_listings_category ON service_listings(category_id);
CREATE INDEX idx_listings_user ON service_listings(user_id);
CREATE INDEX idx_listings_area ON service_listings(area);
CREATE INDEX idx_listings_title_trgm ON service_listings USING gin(title gin_trgm_ops);

CREATE TABLE portfolio_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES service_listings(id) ON DELETE CASCADE,
  media_url   TEXT NOT NULL,
  media_type  VARCHAR(20) DEFAULT 'image',
  title       VARCHAR(255),
  description TEXT,
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE service_packages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id  UUID NOT NULL REFERENCES service_listings(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  icon        VARCHAR(10)
);

-- ── RENTALS ────────────────────────────────────────────────────
CREATE TABLE rentals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type            rental_type NOT NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  price_monthly   NUMERIC(10,2) NOT NULL,
  deposit         NUMERIC(10,2),
  area            VARCHAR(100),
  location_lat    NUMERIC(9,6),
  location_lng    NUMERIC(9,6),
  sqft            INTEGER,
  floor_num       INTEGER,
  beds            SMALLINT DEFAULT 0,
  baths           SMALLINT DEFAULT 0,
  availability    rental_availability DEFAULT 'now',
  is_furnished    BOOLEAN DEFAULT FALSE,
  is_short_term   BOOLEAN DEFAULT FALSE,
  matatu_stage    VARCHAR(100),
  matatu_mins     INTEGER,
  views           INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_rentals_owner ON rentals(owner_id);
CREATE INDEX idx_rentals_area ON rentals(area);
CREATE INDEX idx_rentals_type ON rentals(type);
CREATE INDEX idx_rentals_price ON rentals(price_monthly);

CREATE TABLE rental_amenities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id   UUID NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  amenity_key VARCHAR(50) NOT NULL,
  value       VARCHAR(100),
  UNIQUE(rental_id, amenity_key)
);

-- ── PRODUCTS ───────────────────────────────────────────────────
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  category    VARCHAR(50),
  description TEXT,
  price       NUMERIC(10,2) NOT NULL,
  was_price   NUMERIC(10,2),
  sold_count  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_variants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size        VARCHAR(20),
  color       VARCHAR(50),
  stock       INTEGER DEFAULT 0,
  UNIQUE(product_id, size, color)
);

-- ── ORDERS ─────────────────────────────────────────────────────
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id        UUID NOT NULL REFERENCES users(id),
  type            order_type NOT NULL,
  status          order_status DEFAULT 'pending',
  subtotal        NUMERIC(10,2) NOT NULL,
  delivery_fee    NUMERIC(10,2) DEFAULT 0,
  delivery_type   delivery_type,
  delivery_address TEXT,
  notes           TEXT,
  placed_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id     UUID NOT NULL,
  item_type   VARCHAR(20) NOT NULL, -- 'service'|'rental'|'product'
  name        VARCHAR(255),
  qty         INTEGER DEFAULT 1,
  unit_price  NUMERIC(10,2) NOT NULL,
  size        VARCHAR(20),
  color       VARCHAR(50),
  package_id  UUID
);

-- ── PAYMENTS ───────────────────────────────────────────────────
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES orders(id),
  method              payment_method DEFAULT 'mpesa',
  amount              NUMERIC(10,2) NOT NULL,
  mpesa_ref           VARCHAR(50),
  mpesa_checkout_id   VARCHAR(100),
  status              payment_status DEFAULT 'pending',
  paid_at             TIMESTAMPTZ,
  raw_callback        JSONB,
  UNIQUE(order_id)
);

-- ── REVIEWS ────────────────────────────────────────────────────
CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id   UUID NOT NULL REFERENCES users(id),
  subject_id    UUID NOT NULL,
  subject_type  VARCHAR(20), -- 'listing'|'rental'|'product'
  rating        SMALLINT NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_reviews_subject ON reviews(subject_id, subject_type);

-- ── NOTIFICATIONS ──────────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(50),
  payload     JSONB,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_notif_user ON notifications(user_id) WHERE read_at IS NULL;
