# WASel
## Local Delivery Platform
### Product & Business Requirements Document

---

# 1. Project Overview

## 1.1 Project Name

**Wasel**

## 1.2 Project Type

Local delivery management platform.

## 1.3 Main Idea

Wasel is a platform that connects **customers, local stores, and delivery drivers** in one simple workflow.

A customer chooses a store, selects products, places an order, and waits for the store to prepare it. A delivery driver then receives the delivery request, picks up the order from the store, and delivers it to the customer.

The project focuses on managing this process clearly from beginning to end.

---

# 2. Project Goal

The main goal of Wasel is to make local delivery operations organized and easy to manage.

The platform should answer four basic questions at every moment:

1. What did the customer order?
2. What is the store currently doing with the order?
3. Who is responsible for delivering it?
4. What is the current status of the delivery?

---

# 3. Users

Wasel has three main user types.

## 3.1 Customer

The customer purchases products from stores.

The customer can:

- Create an account.
- Browse stores.
- View products.
- Place orders.
- Track orders.
- Cancel eligible orders.
- View previous orders.
- Review completed orders.

---

## 3.2 Store

A store sells products through Wasel.

The store can:

- Manage its information.
- Manage products.
- Receive orders.
- Accept orders.
- Reject orders.
- Prepare orders.
- Mark orders as ready.
- View previous orders.

---

## 3.3 Driver

A driver delivers orders from stores to customers.

The driver can:

- Set availability.
- View delivery requests.
- Accept a delivery.
- Pick up an order.
- Deliver an order.
- Complete a delivery.
- View previous deliveries.

---

# 4. Core Concept

The entire platform revolves around one main object:

## Order

An order represents a customer's request to purchase products from a store and have them delivered.

An order connects:

**Customer + Store + Products + Delivery Driver**

The order moves through several stages until it is completed.

---

# 5. Complete Order Journey

The main business flow is:

```text id="at5x7k"
Customer
   ↓
Select Store
   ↓
Select Products
   ↓
Create Order
   ↓
Store Receives Order
   ↓
Store Accepts Order
   ↓
Store Prepares Order
   ↓
Order Becomes Ready
   ↓
Driver Assigned
   ↓
Driver Accepts Delivery
   ↓
Driver Picks Up Order
   ↓
Driver Delivers Order
   ↓
Order Completed
```

An order can also be cancelled if cancellation is allowed at its current stage.

---

# 6. Customer Experience

## 6.1 Customer Registration

A new customer creates an account.

The customer provides basic information required to use the platform.

After registration, the customer can access the main platform.

---

# 7. Customer Profile

The customer can view and update basic profile information.

The profile contains:

- Name
- Phone number
- Email
- Saved addresses

---

# 8. Customer Addresses

A customer can save multiple delivery addresses.

Examples:

- Home
- Work
- Other

Each address contains the information required for delivery.

The customer selects one saved address when creating an order.

---

# 9. Store Discovery

The customer can browse available stores.

Each store can display:

- Store name
- Description
- Category
- Rating
- Delivery fee
- Current availability

The customer selects a store to view its products.

---

# 10. Product Browsing

Inside a store, the customer can view its products.

Each product contains:

- Product name
- Description
- Price
- Availability

Unavailable products cannot be added to a new order.

---

# 11. Cart

The customer adds products to a cart.

The cart shows:

- Product name
- Quantity
- Product price
- Subtotal
- Delivery fee
- Final total

The customer can increase, decrease, or remove product quantities before placing the order.

---

# 12. Placing an Order

Before placing the order, the customer reviews:

- Store
- Products
- Quantities
- Delivery address
- Total amount

The customer then confirms the order.

The order is created and sent to the store.

---

# 13. Order Information

Every order contains basic information such as:

- Order number
- Customer
- Store
- Products
- Delivery address
- Total amount
- Current status
- Driver
- Creation date

---

# 14. Order Statuses

An order can have the following statuses:

```text id="6l3a7n"
Pending
Accepted
Preparing
Ready
Assigned
Picked Up
On The Way
Delivered
Cancelled
Rejected
```

---

# 15. Pending Status

When the customer places an order, the initial status is:

**Pending**

This means the store has received the order but has not yet decided whether to accept it.

---

# 16. Accepted Status

The store reviews the order.

If the store can fulfill it, the order becomes:

**Accepted**

This means the store has officially agreed to prepare the order.

---

# 17. Rejected Status

The store may reject an order.

Possible reasons:

- Product unavailable
- Store cannot fulfill the order
- Store is closing
- Operational problem

When rejected, the order cannot continue through the normal delivery process.

---

# 18. Preparing Status

After accepting an order, the store starts preparing it.

The order becomes:

**Preparing**

This indicates that the store is actively working on the order.

---

# 19. Ready Status

When all products are prepared, the store marks the order:

**Ready**

This means the order is ready for pickup by a driver.

---

# 20. Driver Assignment

After the order becomes ready, a driver needs to be assigned.

The platform identifies an available driver.

The driver receives the delivery request.

---

# 21. Driver Acceptance

The driver can accept the delivery request.

After acceptance, the order becomes:

**Assigned**

This means the delivery has been assigned to a specific driver.

If the driver rejects the request, another driver may be selected.

---

# 22. Pickup

The driver goes to the store.

After receiving the order from the store, the driver confirms the pickup.

The order becomes:

**Picked Up**

This means the order is now in the driver's possession.

---

# 23. On The Way

After pickup, the driver starts the delivery.

The order becomes:

**On The Way**

The customer can see that the order has left the store.

---

# 24. Delivery Completion

After reaching the customer and handing over the order, the driver confirms delivery.

The order becomes:

**Delivered**

This is the final successful status.

---

# 25. Order Cancellation

Orders can be cancelled only during allowed stages.

For example, a customer may cancel an order while it is still waiting for store approval.

Once preparation or delivery has progressed too far, cancellation may no longer be available.

A cancellation should include:

- Reason
- Who cancelled it
- Cancellation time

---

# 26. Customer Order History

The customer can view previous orders.

Each order summary contains:

- Order number
- Store name
- Date
- Total
- Status

The customer can open an order to see its full details.

---

# 27. Reordering

A customer can select a previous order and choose:

**Order Again**

The system creates a new order using the previous products as a starting point.

The old order remains unchanged.

---

# 28. Customer Reviews

After an order is successfully delivered, the customer can submit a review.

The review can contain:

- Rating
- Comment

The customer may review the overall order experience.

The review is linked to the completed order.

---

# 29. Store Management

Every store has its own profile.

The store can manage:

- Name
- Description
- Contact information
- Address
- Products
- Operating status

---

# 30. Store Availability

A store can be:

### Open

The store accepts new orders.

### Closed

The store is not currently accepting new orders.

A closed store can still have historical orders.

---

# 31. Product Management

The store can:

- Add products.
- Edit products.
- Remove products.
- Change prices.
- Mark products as available.
- Mark products as unavailable.

---

# 32. Store Order Management

The store has a list of incoming orders.

For every new order, the store can see:

- Customer
- Products
- Quantities
- Address
- Total amount
- Current status
- Order time

The store can then accept or reject the order.

---

# 33. Store Order Workflow

The store's normal workflow is:

```text id="shxwfa"
New Order
   ↓
Accept
   ↓
Prepare
   ↓
Ready
```

Once the order becomes ready, the delivery process begins.

---

# 34. Driver Management

A driver has a basic profile containing:

- Name
- Phone number
- Availability
- Delivery history
- Rating

---

# 35. Driver Availability

The driver can control whether they are available.

Possible states:

```text id="1ixc06"
Available
Unavailable
Busy
```

### Available

The driver can receive new deliveries.

### Unavailable

The driver does not want to receive new deliveries.

### Busy

The driver is currently completing a delivery.

---

# 36. Delivery Requests

When a suitable delivery becomes available, the driver receives a request containing:

- Store information
- Pickup location
- Customer delivery area
- Order information
- Delivery details

The driver can accept or reject the request.

---

# 37. Driver Delivery Workflow

The driver's normal workflow is:

```text id="o7ew4a"
Available
   ↓
Receive Delivery Request
   ↓
Accept
   ↓
Go to Store
   ↓
Pick Up Order
   ↓
Deliver to Customer
   ↓
Complete Delivery
```

---

# 38. Delivery History

The driver can view previous deliveries.

Each delivery record contains:

- Order number
- Store
- Delivery date
- Delivery status
- Delivery result

---

# 39. Ratings

Customers can rate their completed delivery experience.

The platform can calculate a driver's overall rating based on customer reviews.

Stores can also have an overall rating based on customer reviews.

---

# 40. Basic Notifications

Wasel provides simple notifications for important order events.

## Customer

Examples:

- Order received.
- Order accepted.
- Order rejected.
- Order ready.
- Driver assigned.
- Order picked up.
- Order on the way.
- Order delivered.
- Order cancelled.

## Store

Examples:

- New order.
- Order cancelled.
- Driver assigned.

## Driver

Examples:

- New delivery request.
- Delivery cancelled.
- Order ready for pickup.

---

# 41. Basic Admin Management

The platform includes a simple administrative role.

The administrator can:

- View customers.
- View stores.
- View drivers.
- View orders.
- Disable accounts when necessary.
- Monitor active operations.

The administrator is not responsible for normal daily order processing unless an exceptional situation occurs.

---

# 42. Admin Overview

The administrator should be able to see basic platform statistics such as:

- Number of customers.
- Number of stores.
- Number of drivers.
- Active orders.
- Completed orders.
- Cancelled orders.

---

# 43. Basic Permissions

Different users have different responsibilities.

| Action | Customer | Store | Driver | Admin |
|---|---:|---:|---:|---:|
| Browse Stores | Yes | Yes | Yes | Yes |
| Place Order | Yes | No | No | Yes |
| Manage Products | No | Yes | No | Yes |
| Accept Orders | No | Yes | No | Yes |
| Prepare Orders | No | Yes | No | Yes |
| Accept Delivery | No | No | Yes | Yes |
| Complete Delivery | No | No | Yes | Yes |
| View Own History | Yes | Yes | Yes | Yes |
| Manage Users | No | No | No | Yes |

---

# 44. Important Business Rules

## Rule 1

A customer can only order from a store that is currently accepting orders.

## Rule 2

A customer cannot order an unavailable product.

## Rule 3

A store must accept an order before preparing it.

## Rule 4

A store must mark an order as ready before delivery can begin.

## Rule 5

A driver must accept a delivery before picking up the order.

## Rule 6

A driver cannot complete a delivery before picking up the order.

## Rule 7

Only completed orders can receive customer reviews.

## Rule 8

Cancelled orders cannot continue through the normal delivery process.

## Rule 9

A driver must be available before receiving a new delivery.

## Rule 10

An order should have only one active delivery responsibility at a time.

---

# 45. Exceptional Cases

The system should handle simple real-world problems.

### Store Rejects Order

The order becomes rejected and the customer is informed.

### Driver Rejects Delivery

The delivery can be offered to another available driver.

### No Driver Available

The order remains ready until a suitable driver is available.

### Customer Cancels Early

The order becomes cancelled when cancellation is allowed.

### Customer Cancels Late

The cancellation may be rejected because the order has already progressed too far.

### Product Becomes Unavailable

The store may reject the order or stop the order according to the applicable business rule.

### Driver Cannot Complete Delivery

The delivery can be marked as unsuccessful and reviewed.

---

# 46. Main Screens / Areas

## Customer Area

The customer should have access to:

```text id="hm8k0r"
Home
Stores
Store Details
Cart
Checkout
Active Order
Order History
Order Details
Profile
Addresses
```

---

## Store Area

The store should have:

```text id="s7ht8u"
Dashboard
Orders
Order Details
Products
Store Profile
Order History
```

---

## Driver Area

The driver should have:

```text id="8wp5u2"
Dashboard
Available Deliveries
Current Delivery
Delivery Details
Delivery History
Profile
```

---

## Admin Area

The administrator should have:

```text id="z4p4qc"
Dashboard
Customers
Stores
Drivers
Orders
```

---

# 47. Example: Complete Successful Order

### Step 1

Ahmed opens Wasel.

### Step 2

Ahmed chooses a local store.

### Step 3

He selects two products.

### Step 4

He selects his home address.

### Step 5

He confirms the order.

The order becomes:

**Pending**

### Step 6

The store receives the order.

The store accepts it.

The order becomes:

**Accepted**

### Step 7

The store starts preparing the products.

The order becomes:

**Preparing**

### Step 8

The store finishes preparation.

The order becomes:

**Ready**

### Step 9

A driver named Mohamed accepts the delivery.

The order becomes:

**Assigned**

### Step 10

Mohamed arrives at the store and picks up the order.

The order becomes:

**Picked Up**

### Step 11

Mohamed starts driving to Ahmed.

The order becomes:

**On The Way**

### Step 12

Mohamed delivers the order.

The order becomes:

**Delivered**

### Step 13

Ahmed submits a rating.

The complete order remains in his history.

---

# 48. Example: Rejected Order

Ahmed places an order.

The order becomes:

**Pending**

The store discovers that one of the required products is unavailable.

The store rejects the order.

The order becomes:

**Rejected**

Ahmed receives a notification.

The order is added to his history as a rejected order.

---

# 49. Example: Cancelled Order

Ahmed creates an order.

The store has not started preparation yet.

Ahmed decides he no longer wants the order.

He requests cancellation.

The cancellation is allowed.

The order becomes:

**Cancelled**

The cancellation is recorded with its reason and time.

---

# 50. Example: Driver Rejection

A store marks an order as ready.

The system offers the delivery to a driver.

The driver rejects it.

Another eligible driver receives the delivery request.

The second driver accepts it.

The order continues normally.

---

# 51. MVP Scope

The first version of Wasel should contain only the essential functionality.

## Customer

- Registration
- Profile
- Addresses
- Store browsing
- Product browsing
- Cart
- Order creation
- Order tracking
- Order history
- Reviews

## Store

- Store profile
- Product management
- Order management
- Preparation workflow

## Driver

- Profile
- Availability
- Delivery requests
- Pickup
- Delivery completion
- Delivery history

## Admin

- User management
- Store management
- Driver management
- Order monitoring

---

# 52. Features Explicitly Outside the MVP

To keep the project focused, the first version does **not** require:

- Advanced payments.
- Refund systems.
- Loyalty programs.
- Complex promotions.
- Subscription plans.
- Corporate accounts.
- Advanced analytics.
- Multiple store branches.
- Advanced customer support.
- Complex financial management.

These can be added later without changing the core concept.

---

# 53. Future Expansion

Once the basic system is complete, Wasel can grow into a larger platform.

Possible future features include:

- Online payments.
- Refunds.
- Coupons.
- Scheduled orders.
- Express delivery.
- Multiple store branches.
- Loyalty points.
- Customer support.
- Advanced reporting.
- Business accounts.
- Delivery zones.
- Advanced driver assignment.
- Subscription plans.

---

# 54. Final Product Definition

Wasel is a **small but realistic local delivery platform**.

Its main purpose is to manage one complete business process:

> **A customer places an order → a store prepares it → a driver delivers it → the customer receives and reviews it.**

The project intentionally focuses on this lifecycle instead of trying to become a complete marketplace.

The core relationship is:

```text id="8v58kw"
Customer
   │
   │ places
   ▼
 Order
   │
   ├──────────────► Store
   │                  │
   │                  │ prepares
   │                  ▼
   │                Ready
   │                  │
   │                  │ assigned to
   │                  ▼
   └──────────────► Driver
                      │
                      │ delivers
                      ▼
                   Customer
```

The final system should feel like a real delivery business rather than a simple CRUD application, while remaining small enough to be completed as a focused project.