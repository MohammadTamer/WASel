# WASEL
## Database Documentation
### Local Delivery Platform

---

# 1. Database Overview

The Wasel database is responsible for storing and organizing all information required to operate the local delivery platform.

The database is built around the main business entities:

```text
Users
Customers
Stores
Drivers
Products
Orders
Deliveries
Reviews
Notifications
```

The database must preserve the relationships between these entities and maintain a complete history of customer orders and delivery operations.

---

# 2. Database Objectives

The database should:

- Store user information.
- Separate different user roles.
- Store store information.
- Store products and categories.
- Store customer addresses.
- Store customer orders.
- Store products included in each order.
- Store delivery information.
- Store reviews.
- Store notifications.
- Maintain the history of important business operations.
- Protect data consistency between related entities.

---

# 3. Database Design Principles

The database follows several important principles.

## 3.1 Separation of Responsibilities

Each table represents a specific business entity.

For example:

```text
users
    → User identity

stores
    → Store information

products
    → Product information

orders
    → Order information

deliveries
    → Delivery information
```

---

## 3.2 Referential Integrity

Related records must remain connected through relationships.

For example:

An order must belong to:

- One customer.
- One store.
- One delivery address.

---

## 3.3 Historical Accuracy

Historical order information must not change when the original product changes.

For example:

A product costs 100 when an order is created.

Later, the store changes the product price to 130.

The old order must still show the original price of 100.

This is why order-specific product information is stored inside `order_items`.

---

# 4. Tables Overview

Wasel contains the following tables:

| Table | Purpose |
|---|---|
| users | Stores all platform users |
| customers | Stores customer-specific information |
| drivers | Stores driver-specific information |
| stores | Stores store information |
| store_employees | Connects employees with stores |
| addresses | Stores customer delivery addresses |
| categories | Stores product categories |
| products | Stores store products |
| orders | Stores customer orders |
| order_items | Stores products included in orders |
| deliveries | Stores delivery operations |
| reviews | Stores customer reviews |
| notifications | Stores user notifications |

---

# 5. users

## Purpose

The `users` table is the main identity table.

Every person using the platform has a record here.

This includes:

- Customers
- Drivers
- Store owners
- Store employees
- Administrators

---

## Columns

| Column | Type | Required | Description |
|---|---|---:|---|
| id | BIGINT | Yes | Unique user identifier |
| name | VARCHAR(100) | Yes | User's full name |
| email | VARCHAR(150) | Yes | User's email address |
| phone | VARCHAR(30) | Yes | User's phone number |
| password_hash | TEXT | Yes | Stored password representation |
| role | VARCHAR(20) | Yes | User role |
| is_active | BOOLEAN | Yes | Whether the account is active |
| created_at | TIMESTAMP | Yes | Account creation time |
| updated_at | TIMESTAMP | Yes | Last update time |

---

## Role Values

```text
customer
driver
store_owner
store_employee
admin
```

---

## Rules

- Email must be unique.
- Phone number must be unique.
- Every user must have exactly one primary role.
- Inactive users cannot perform normal platform operations.

---

# 6. customers

## Purpose

The `customers` table contains information specific to users who act as customers.

It extends the general `users` record.

---

## Columns

| Column | Type | Required | Description |
|---|---|---:|---|
| id | BIGINT | Yes | Customer identifier |
| user_id | BIGINT | Yes | Related user |
| created_at | TIMESTAMP | Yes | Customer creation time |

---

## Relationships

```text
users 1 ───── 1 customers
```

A user can have one customer profile.

A customer profile belongs to one user.

---

# 7. drivers

## Purpose

The `drivers` table contains information specific to delivery drivers.

---

## Columns

| Column | Type | Required | Description |
|---|---|---:|---|
| id | BIGINT | Yes | Driver identifier |
| user_id | BIGINT | Yes | Related user |
| status | VARCHAR(20) | Yes | Current driver status |
| rating | DECIMAL(3,2) | Yes | Current average rating |
| created_at | TIMESTAMP | Yes | Driver creation time |

---

## Driver Status

```text
available
unavailable
busy
suspended
```

---

## Rules

- A driver must belong to a user.
- A suspended driver cannot receive deliveries.
- A busy driver should not normally receive another delivery.
- Rating must remain between 0 and 5.

---

# 8. stores

## Purpose

The `stores` table represents businesses operating on Wasel.

---

## Columns

| Column | Type | Required | Description |
|---|---|---:|---|
| id | BIGINT | Yes | Store identifier |
| owner_id | BIGINT | Yes | Store owner |
| name | VARCHAR(150) | Yes | Store name |
| description | TEXT | No | Store description |
| phone | VARCHAR(30) | No | Store contact number |
| address | TEXT | Yes | Store address |
| status | VARCHAR(20) | Yes | Current store status |
| rating | DECIMAL(3,2) | Yes | Average customer rating |
| created_at | TIMESTAMP | Yes | Store creation time |
| updated_at | TIMESTAMP | Yes | Last update time |

---

## Store Status

```text
open
closed
suspended
```

---

## Relationships

```text
users 1 ─────< stores
```

One owner may manage one or more stores.

---

## Rules

- A suspended store cannot receive new orders.
- A closed store cannot receive new orders.
- Store rating must remain between 0 and 5.

---

# 9. store_employees

## Purpose

This table connects store employees with the stores they work for.

---

## Columns

| Column | Type | Required | Description |
|---|---|---:|---|
| id | BIGINT | Yes | Relationship identifier |
| store_id | BIGINT | Yes | Related store |
| user_id | BIGINT | Yes | Related employee |
| created_at | TIMESTAMP | Yes | Assignment time |

---

## Relationship

```text
stores
   │
   └──────< store_employees >────── users
```

This creates a many-to-many relationship between users and stores.

A user may work for multiple stores.

A store may have multiple employees.

---

## Rules

The same employee should not be assigned to the same store more than once.

---

# 10. addresses

## Purpose

Stores delivery addresses belonging to customers.

Customers can save multiple addresses.

---

## Columns

| Column | Type | Required | Description |
|---|---|---:|---|
| id | BIGINT | Yes | Address identifier |
| customer_id | BIGINT | Yes | Address owner |
| label | VARCHAR(50) | Yes | Address label |
| address_line | TEXT | Yes | Main address |
| city | VARCHAR(100) | Yes | City |
| building_number | VARCHAR(50) | No | Building number |
| floor | VARCHAR(20) | No | Floor |
| apartment | VARCHAR(20) | No | Apartment |
| notes | TEXT | No | Additional delivery notes |
| created_at | TIMESTAMP | Yes | Creation time |

---

## Examples

```text
Home
Work
Parents
Other
```

---

## Relationship

```text
customers 1 ─────< addresses
```

---

# 11. categories

## Purpose

Represents product categories belonging to a store.

Examples:

```text
Pizza
Burgers
Drinks
Desserts
```

---

## Columns

| Column | Type | Required | Description |
|---|---|---:|---|
| id | BIGINT | Yes | Category identifier |
| store_id | BIGINT | Yes | Related store |
| name | VARCHAR(100) | Yes | Category name |
| created_at | TIMESTAMP | Yes | Creation time |

---

## Relationship

```text
stores 1 ─────< categories
```

---

## Rules

A category belongs to one store.

The same category name should not be duplicated inside the same store.

---

# 12. products

## Purpose

Stores products that customers can purchase.

---

## Columns

| Column | Type | Required | Description |
|---|---|---:|---|
| id | BIGINT | Yes | Product identifier |
| store_id | BIGINT | Yes | Product owner |
| category_id | BIGINT | No | Product category |
| name | VARCHAR(150) | Yes | Product name |
| description | TEXT | No | Product description |
| price | DECIMAL(10,2) | Yes | Current product price |
| image_url | TEXT | No | Product image |
| is_available | BOOLEAN | Yes | Whether the product can be ordered |
| created_at | TIMESTAMP | Yes | Creation time |
| updated_at | TIMESTAMP | Yes | Last update time |

---

## Relationships

```text
stores 1 ─────< products
categories 1 ─────< products
```

---

## Rules

- Price cannot be negative.
- An unavailable product cannot be added to a new order.
- A product belongs to exactly one store.
- A product may optionally belong to one category.

---

# 13. orders

## Purpose

The `orders` table is the central table of the platform.

It represents a customer's purchase from a store.

---

## Columns

| Column | Type | Required | Description |
|---|---|---:|---|
| id | BIGINT | Yes | Internal order identifier |
| order_number | VARCHAR(30) | Yes | Public order reference |
| customer_id | BIGINT | Yes | Customer who placed the order |
| store_id | BIGINT | Yes | Store receiving the order |
| address_id | BIGINT | Yes | Delivery address |
| status | VARCHAR(30) | Yes | Current order status |
| subtotal | DECIMAL(10,2) | Yes | Product total before delivery |
| delivery_fee | DECIMAL(10,2) | Yes | Delivery charge |
| total_amount | DECIMAL(10,2) | Yes | Final order amount |
| cancellation_reason | TEXT | No | Reason for cancellation |
| created_at | TIMESTAMP | Yes | Order creation time |
| updated_at | TIMESTAMP | Yes | Last order update |

---

# 14. Order Statuses

The order can move through the following states:

```text
pending
accepted
preparing
ready
assigned
picked_up
on_the_way
delivered
cancelled
rejected
```

---

# 15. Order Status Rules

The normal lifecycle is:

```text
pending
   ↓
accepted
   ↓
preparing
   ↓
ready
   ↓
assigned
   ↓
picked_up
   ↓
on_the_way
   ↓
delivered
```

Exceptional states:

```text
pending → rejected
```

or:

```text
pending / accepted / preparing / ready → cancelled
```

depending on the business rules.

---

# 16. Order Amount Rules

The order contains three important financial values:

```text
subtotal
delivery_fee
total_amount
```

The expected relationship is:

```text
total_amount = subtotal + delivery_fee
```

In a future version, discounts can be added without changing the overall concept.

---

# 17. orders Relationships

```text
customers 1 ─────< orders
stores    1 ─────< orders
addresses 1 ─────< orders
```

One customer can have many orders.

One store can receive many orders.

One saved address can be used by many historical orders.

---

# 18. order_items

## Purpose

Represents the products included in a specific order.

An order can contain multiple products.

---

## Columns

| Column | Type | Required | Description |
|---|---|---:|---|
| id | BIGINT | Yes | Order item identifier |
| order_id | BIGINT | Yes | Related order |
| product_id | BIGINT | Yes | Original product |
| product_name | VARCHAR(150) | Yes | Product name at purchase time |
| unit_price | DECIMAL(10,2) | Yes | Product price at purchase time |
| quantity | INT | Yes | Purchased quantity |
| total_price | DECIMAL(10,2) | Yes | Quantity × unit price |

---

## Relationship

```text
orders 1 ─────< order_items >───── products
```

This resolves the many-to-many relationship between orders and products.

---

# 19. Why order_items Stores Product Information

The `products` table represents the product's **current state**.

The `order_items` table represents the product's **historical state at purchase time**.

Example:

```text
Product today:
Chicken Burger
150 EGP
```

Later:

```text
Product:
Double Chicken Burger
220 EGP
```

The previous order must still display:

```text
Chicken Burger
150 EGP
```

Therefore, `order_items` keeps:

- Product name at purchase time.
- Price at purchase time.
- Quantity purchased.

---

# 20. deliveries

## Purpose

Represents the physical delivery operation associated with an order.

---

## Columns

| Column | Type | Required | Description |
|---|---|---:|---|
| id | BIGINT | Yes | Delivery identifier |
| order_id | BIGINT | Yes | Related order |
| driver_id | BIGINT | No | Assigned driver |
| status | VARCHAR(30) | Yes | Delivery status |
| assigned_at | TIMESTAMP | No | Driver assignment time |
| picked_up_at | TIMESTAMP | No | Pickup time |
| delivered_at | TIMESTAMP | No | Delivery completion time |
| failure_reason | TEXT | No | Reason for failed delivery |
| created_at | TIMESTAMP | Yes | Delivery creation time |

---

# 21. Delivery Statuses

```text
pending
assigned
picked_up
on_the_way
delivered
failed
cancelled
```

---

# 22. Delivery Relationships

```text
orders 1 ───── 1 deliveries
drivers 1 ─────< deliveries
```

Every order has one delivery record when delivery processing is required.

One driver can complete many deliveries over time.

---

# 23. Delivery Rules

- A driver must be assigned before pickup.
- Pickup must happen before delivery completion.
- A delivered delivery cannot normally return to an earlier state.
- A suspended driver cannot receive new deliveries.
- A failed delivery should have a failure reason.

---

# 24. reviews

## Purpose

Stores customer feedback for completed orders.

---

## Columns

| Column | Type | Required | Description |
|---|---|---:|---|
| id | BIGINT | Yes | Review identifier |
| order_id | BIGINT | Yes | Reviewed order |
| customer_id | BIGINT | Yes | Reviewer |
| store_rating | INT | No | Store rating |
| driver_rating | INT | No | Driver rating |
| comment | TEXT | No | Customer comment |
| created_at | TIMESTAMP | Yes | Review creation time |

---

# 25. Review Rules

Ratings range from:

```text
1 → 5
```

A customer can review an order only after successful completion.

One order can have at most one review.

A review belongs to the customer who placed the order.

---

# 26. notifications

## Purpose

Stores notifications sent to users.

---

## Columns

| Column | Type | Required | Description |
|---|---|---:|---|
| id | BIGINT | Yes | Notification identifier |
| user_id | BIGINT | Yes | Notification recipient |
| title | VARCHAR(200) | Yes | Notification title |
| message | TEXT | Yes | Notification message |
| type | VARCHAR(50) | No | Notification category |
| is_read | BOOLEAN | Yes | Whether notification was read |
| created_at | TIMESTAMP | Yes | Creation time |

---

# 27. Notification Types

Possible notification types include:

```text
order_created
order_accepted
order_rejected
order_ready
driver_assigned
order_picked_up
order_on_the_way
order_delivered
order_cancelled
```

---

# 28. Main Relationships

The major database relationships are:

```text
users
  │
  ├──── customers
  │       │
  │       └──── addresses
  │              │
  │              └──── orders
  │
  ├──── drivers
  │       │
  │       └──── deliveries
  │
  └──── stores
          │
          ├──── store_employees
          ├──── categories
          │       │
          │       └──── products
          │
          └──── orders
                  │
                  ├──── order_items
                  │       │
                  │       └──── products
                  │
                  ├──── deliveries
                  │
                  └──── reviews

users
  │
  └──── notifications
```

---

# 29. Complete ERD

```text
┌──────────────┐
│    users     │
├──────────────┤
│ id           │
│ name         │
│ email        │
│ phone        │
│ role         │
│ is_active    │
└──────┬───────┘
       │
       ├───────────────┐
       │               │
       ▼               ▼
┌──────────────┐  ┌──────────────┐
│  customers   │  │   drivers    │
├──────────────┤  ├──────────────┤
│ id           │  │ id           │
│ user_id      │  │ user_id      │
└──────┬───────┘  │ status       │
       │          └──────┬───────┘
       │                 │
       ▼                 ▼
┌──────────────┐   ┌──────────────┐
│  addresses   │   │ deliveries   │
└──────┬───────┘   └──────┬───────┘
       │                   │
       └────────┐    ┌─────┘
                ▼    ▼
              ┌──────────────┐
              │    orders    │
              ├──────────────┤
              │ id           │
              │ customer_id  │
              │ store_id     │
              │ address_id   │
              │ status       │
              │ totals       │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │ order_items  │
              ├──────────────┤
              │ order_id     │
              │ product_id   │
              │ product_name │
              │ unit_price   │
              │ quantity     │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │   products   │
              ├──────────────┤
              │ id           │
              │ store_id     │
              │ category_id  │
              │ name         │
              │ price        │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │ categories   │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │    stores    │
              ├──────────────┤
              │ id           │
              │ owner_id     │
              │ name         │
              │ status       │
              └──────────────┘
```

---

# 30. Primary Keys

Every table has a primary identifier.

```text
users.id
customers.id
drivers.id
stores.id
store_employees.id
addresses.id
categories.id
products.id
orders.id
order_items.id
deliveries.id
reviews.id
notifications.id
```

The primary key uniquely identifies each record.

---

# 31. Foreign Keys

Important foreign key relationships include:

```text
customers.user_id → users.id

drivers.user_id → users.id

stores.owner_id → users.id

store_employees.store_id → stores.id
store_employees.user_id → users.id

addresses.customer_id → customers.id

categories.store_id → stores.id

products.store_id → stores.id
products.category_id → categories.id

orders.customer_id → customers.id
orders.store_id → stores.id
orders.address_id → addresses.id

order_items.order_id → orders.id
order_items.product_id → products.id

deliveries.order_id → orders.id
deliveries.driver_id → drivers.id

reviews.order_id → orders.id
reviews.customer_id → customers.id

notifications.user_id → users.id
```

---

# 32. Delete Behavior

Relationships should be handled carefully when records are deleted.

## Safe cascading examples

Deleting a customer profile may remove:

- Saved addresses.
- Related notifications.

Deleting a store may remove:

- Store employees.
- Categories.
- Products.

However, historical orders should generally be preserved.

---

# 33. Historical Order Protection

Orders are business records and should not disappear simply because a product or user is no longer active.

For example:

A store may stop operating tomorrow.

Past orders should still exist.

A product may be removed from the store.

Past order items should still exist.

A driver may leave the platform.

Past deliveries should still retain their history.

Therefore, important historical relationships should be treated carefully rather than blindly deleting records.

---

# 34. Data Consistency Rules

The database should enforce important business rules where possible.

Examples:

### Product Price

```text
price >= 0
```

### Quantity

```text
quantity > 0
```

### Ratings

```text
1 <= rating <= 5
```

### Order Amounts

```text
subtotal >= 0
delivery_fee >= 0
total_amount >= 0
```

### Unique Values

Examples:

```text
users.email
users.phone
orders.order_number
```

must be unique.

---

# 35. Important Historical Principle

There are two different types of data in the database:

## Current Data

Represents what is true **now**.

Examples:

```text
products.price
stores.status
drivers.status
```

## Historical Data

Represents what happened **in the past**.

Examples:

```text
order_items.unit_price
order_items.product_name
orders.created_at
deliveries.delivered_at
reviews.created_at
```

The database must not allow current changes to destroy historical information.

---

# 36. Order Data Example

Imagine Ahmed orders:

```text
2 × Chicken Burger
1 × Cola
```

The database stores:

### orders

```text
Order #10025
Customer: Ahmed
Store: Burger House
Subtotal: 320
Delivery: 30
Total: 350
```

### order_items

```text
Chicken Burger | 2 | 150 | 300
Cola           | 1 |  20 | 20
```

Later, the store changes the burger price to 180.

The old order remains:

```text
Chicken Burger | 2 | 150 | 300
```

The new price affects future orders only.

---

# 37. Database Lifecycle Example

A complete order creates and updates records across several tables.

## Step 1 — Customer

The customer already exists in:

```text
users
customers
```

## Step 2 — Address

The selected delivery address exists in:

```text
addresses
```

## Step 3 — Order

A new record is created in:

```text
orders
```

## Step 4 — Products

The selected products are copied into:

```text
order_items
```

## Step 5 — Delivery

A delivery record is created:

```text
deliveries
```

## Step 6 — Driver

A driver is assigned.

The delivery record now references the driver.

## Step 7 — Completion

The delivery receives a completion timestamp.

The order becomes:

```text
delivered
```

## Step 8 — Review

The customer can create a review:

```text
reviews
```

---

# 38. Recommended Database Scope

For the current MVP, these tables are enough:

```text
users
customers
drivers
stores
store_employees
addresses
categories
products
orders
order_items
deliveries
reviews
notifications
```

The following should remain outside the first version:

```text
payments
refunds
promotions
coupons
loyalty_points
subscriptions
complaints
advanced_analytics
```

They can be added later without redesigning the core order system.

---

# 39. Final Database Architecture

The final database revolves around the following chain:

```text
USER
 ↓
CUSTOMER
 ↓
ADDRESS
 ↓
ORDER
 ↓
ORDER ITEMS
 ↓
PRODUCT
 ↓
STORE
 ↓
DELIVERY
 ↓
DRIVER
 ↓
REVIEW
```

While supporting information flows through:

```text
STORE → CATEGORIES → PRODUCTS

STORE → EMPLOYEES

USER → NOTIFICATIONS
```

---

# 40. Final Schema Summary

```text
users
 ├── customers
 │    └── addresses
 │
 ├── drivers
 │    └── deliveries
 │
 └── stores
      ├── store_employees
      ├── categories
      │    └── products
      │
      └── orders
           ├── order_items
           ├── deliveries
           └── reviews

users
 └── notifications
```

This schema represents the complete database foundation for the Wasel MVP.

It is intentionally focused on the core business lifecycle:

**Customer → Order → Store → Delivery → Driver → Completion → Review**