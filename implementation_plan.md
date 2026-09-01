# WASel - Spring Boot Backend Implementation Plan

## Overview

Build a complete **Spring Boot Backend** for the WASel local delivery platform based on the project spec ([WASel.md](file:///c:/Users/User/Desktop/WASel/WASel.md)) and database spec ([WASelDB.md](file:///c:/Users/User/Desktop/WASel/WASelDB.md)).

**Tech Stack**: Spring Boot, JPA/Hibernate, JWT Authentication, BCrypt Password Encoding, H2 (dev) / PostgreSQL (prod), Maven

**Architecture**: Clean layered architecture — Controller → Service → Repository → Entity

---

## Project Structure

```
WASel/
├── pom.xml
├── src/main/java/com/wasel/
│   ├── WaselApplication.java
│   │
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── ApplicationConfig.java
│   │
│   ├── entity/
│   │   ├── User.java
│   │   ├── Customer.java
│   │   ├── Driver.java
│   │   ├── Store.java
│   │   ├── StoreEmployee.java
│   │   ├── Address.java
│   │   ├── Category.java
│   │   ├── Product.java
│   │   ├── Order.java
│   │   ├── OrderItem.java
│   │   ├── Delivery.java
│   │   ├── Review.java
│   │   └── Notification.java
│   │
│   ├── enums/
│   │   ├── UserRole.java
│   │   ├── OrderStatus.java
│   │   ├── DriverStatus.java
│   │   ├── StoreStatus.java
│   │   ├── DeliveryStatus.java
│   │   └── NotificationType.java
│   │
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── CustomerRepository.java
│   │   ├── DriverRepository.java
│   │   ├── StoreRepository.java
│   │   ├── StoreEmployeeRepository.java
│   │   ├── AddressRepository.java
│   │   ├── CategoryRepository.java
│   │   ├── ProductRepository.java
│   │   ├── OrderRepository.java
│   │   ├── OrderItemRepository.java
│   │   ├── DeliveryRepository.java
│   │   ├── ReviewRepository.java
│   │   └── NotificationRepository.java
│   │
│   ├── dto/
│   │   ├── auth/
│   │   │   ├── RegisterRequest.java
│   │   │   ├── LoginRequest.java
│   │   │   └── AuthResponse.java
│   │   ├── user/
│   │   │   ├── UserDto.java
│   │   │   └── UpdateProfileRequest.java
│   │   ├── customer/
│   │   │   └── CustomerDto.java
│   │   ├── address/
│   │   │   ├── AddressDto.java
│   │   │   └── CreateAddressRequest.java
│   │   ├── store/
│   │   │   ├── StoreDto.java
│   │   │   ├── CreateStoreRequest.java
│   │   │   └── UpdateStoreRequest.java
│   │   ├── category/
│   │   │   ├── CategoryDto.java
│   │   │   └── CreateCategoryRequest.java
│   │   ├── product/
│   │   │   ├── ProductDto.java
│   │   │   ├── CreateProductRequest.java
│   │   │   └── UpdateProductRequest.java
│   │   ├── order/
│   │   │   ├── OrderDto.java
│   │   │   ├── OrderSummaryDto.java
│   │   │   ├── CreateOrderRequest.java
│   │   │   ├── OrderItemDto.java
│   │   │   └── CancelOrderRequest.java
│   │   ├── delivery/
│   │   │   ├── DeliveryDto.java
│   │   │   └── DeliveryRequestDto.java
│   │   ├── review/
│   │   │   ├── ReviewDto.java
│   │   │   └── CreateReviewRequest.java
│   │   ├── notification/
│   │   │   └── NotificationDto.java
│   │   └── admin/
│   │       └── AdminDashboardDto.java
│   │
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── JwtService.java
│   │   ├── UserService.java
│   │   ├── CustomerService.java
│   │   ├── DriverService.java
│   │   ├── StoreService.java
│   │   ├── StoreEmployeeService.java
│   │   ├── AddressService.java
│   │   ├── CategoryService.java
│   │   ├── ProductService.java
│   │   ├── OrderService.java
│   │   ├── DeliveryService.java
│   │   ├── ReviewService.java
│   │   ├── NotificationService.java
│   │   └── AdminService.java
│   │
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── CustomerController.java
│   │   ├── AddressController.java
│   │   ├── StoreController.java
│   │   ├── CategoryController.java
│   │   ├── ProductController.java
│   │   ├── OrderController.java
│   │   ├── DeliveryController.java
│   │   ├── DriverController.java
│   │   ├── ReviewController.java
│   │   ├── NotificationController.java
│   │   └── AdminController.java
│   │
│   └── exception/
│       ├── GlobalExceptionHandler.java
│       ├── ResourceNotFoundException.java
│       ├── BadRequestException.java
│       ├── UnauthorizedException.java
│       ├── ForbiddenException.java
│       ├── DuplicateResourceException.java
│       └── ErrorResponse.java
│
└── src/main/resources/
    └── application.properties
```

---

## Proposed Changes

### Phase 1: Project Foundation

#### [NEW] pom.xml
Maven configuration with dependencies:
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-security`
- `spring-boot-starter-validation`
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson` (JWT)
- `h2` (dev database)
- `postgresql` (prod database)
- `lombok`

#### [NEW] application.properties
- H2 database config (dev)
- JPA/Hibernate DDL auto-update
- JWT secret & expiration
- Server port

#### [NEW] WaselApplication.java
Main Spring Boot application entry point.

---

### Phase 2: Enums

#### [NEW] All enum files
- `UserRole`: CUSTOMER, DRIVER, STORE_OWNER, STORE_EMPLOYEE, ADMIN
- `OrderStatus`: PENDING, ACCEPTED, PREPARING, READY, ASSIGNED, PICKED_UP, ON_THE_WAY, DELIVERED, CANCELLED, REJECTED
- `DriverStatus`: AVAILABLE, UNAVAILABLE, BUSY, SUSPENDED
- `StoreStatus`: OPEN, CLOSED, SUSPENDED
- `DeliveryStatus`: PENDING, ASSIGNED, PICKED_UP, ON_THE_WAY, DELIVERED, FAILED, CANCELLED
- `NotificationType`: ORDER_CREATED, ORDER_ACCEPTED, ORDER_REJECTED, ORDER_READY, DRIVER_ASSIGNED, ORDER_PICKED_UP, ORDER_ON_THE_WAY, ORDER_DELIVERED, ORDER_CANCELLED

---

### Phase 3: Entities (JPA + Hibernate)

All 13 entities mapped exactly to the DB spec with proper:
- `@Entity`, `@Table`, `@Id`, `@GeneratedValue`
- `@ManyToOne`, `@OneToMany`, `@OneToOne` relationships
- `@Column` constraints (nullable, unique, length)
- `@Enumerated(EnumType.STRING)` for enums
- `@CreationTimestamp`, `@UpdateTimestamp` for audit fields
- Validation constraints (`@DecimalMin`, `@Size`, etc.)

Key entity relationships:
| Entity | Relationships |
|---|---|
| User | 1:1 Customer, 1:1 Driver, 1:N Stores (as owner), 1:N Notifications |
| Customer | 1:1 User, 1:N Addresses, 1:N Orders, 1:N Reviews |
| Driver | 1:1 User, 1:N Deliveries |
| Store | N:1 User (owner), 1:N Categories, 1:N Products, 1:N Orders, 1:N StoreEmployees |
| Order | N:1 Customer, N:1 Store, N:1 Address, 1:N OrderItems, 1:1 Delivery, 1:1 Review |
| OrderItem | N:1 Order, N:1 Product (stores historical name+price) |
| Delivery | 1:1 Order, N:1 Driver |

---

### Phase 4: Repositories

JPA repositories with custom queries:
- `UserRepository` — findByEmail, findByPhone, existsByEmail, existsByPhone
- `CustomerRepository` — findByUserId
- `DriverRepository` — findByUserId, findByStatus
- `StoreRepository` — findByOwnerId, findByStatus
- `OrderRepository` — findByCustomerId, findByStoreId, findByStatus, findByOrderNumber
- `ProductRepository` — findByStoreId, findByStoreIdAndIsAvailable
- `DeliveryRepository` — findByDriverId, findByOrderId
- `ReviewRepository` — findByOrderId, findByCustomerId
- `NotificationRepository` — findByUserId, findByUserIdAndIsRead

---

### Phase 5: DTOs + Validation

Request/Response DTOs with Jakarta Validation:
- `@NotBlank`, `@Email`, `@Size`, `@Min`, `@Max`, `@NotNull`, `@Positive`
- Separate Request DTOs (what client sends) and Response DTOs (what API returns)
- No entity leaking to API layer

---

### Phase 6: Exception Handling

- `GlobalExceptionHandler` with `@RestControllerAdvice`
- Custom exceptions: `ResourceNotFoundException`, `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `DuplicateResourceException`
- Consistent `ErrorResponse` format: `{ timestamp, status, error, message, path }`
- Handle `MethodArgumentNotValidException` for validation errors
- Handle `AccessDeniedException` and `AuthenticationException`

---

### Phase 7: Security (JWT + BCrypt)

- `JwtService` — generate token, validate token, extract claims
- `JwtAuthenticationFilter` — intercept requests, validate JWT, set SecurityContext
- `SecurityConfig` — configure HTTP security, public/private endpoints, role-based access
- `ApplicationConfig` — `PasswordEncoder` (BCrypt), `AuthenticationManager`, `UserDetailsService`
- Password hashing with BCrypt on registration
- JWT token returned on login/register

Public endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/stores` (browsing)
- `GET /api/stores/{id}/products` (browsing)

Protected endpoints require valid JWT + appropriate role.

---

### Phase 8: Services (Business Logic)

Core business logic per spec:

**AuthService**: Register (creates User + role-specific profile), Login, token generation

**OrderService** (most complex):
- Create order: validate store open, products available, calculate totals, snapshot prices into order_items, generate order_number
- Status transitions with validation (pending→accepted→preparing→ready→assigned→picked_up→on_the_way→delivered)
- Cancellation rules: only allowed in PENDING/ACCEPTED/PREPARING/READY
- Rejection: only from PENDING
- Reorder: clone previous order's items into new order

**DeliveryService**:
- Auto-create delivery when order becomes READY
- Assign driver (must be AVAILABLE)
- Status transitions: pending→assigned→picked_up→on_the_way→delivered
- Driver status management (AVAILABLE→BUSY→AVAILABLE)

**ReviewService**:
- Only for DELIVERED orders
- One review per order
- Recalculate store/driver average ratings

**NotificationService**:
- Create notifications on key order events
- Mark as read

---

### Phase 9: Controllers (REST API)

All REST endpoints grouped by domain:

#### Auth (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register new user |
| POST | `/login` | Login & get JWT |

#### Customer Profile (`/api/customers`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/me` | Get current customer profile |
| PUT | `/me` | Update profile |

#### Addresses (`/api/addresses`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List my addresses |
| POST | `/` | Create address |
| PUT | `/{id}` | Update address |
| DELETE | `/{id}` | Delete address |

#### Stores (`/api/stores`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Browse all open stores |
| GET | `/{id}` | Get store details |
| POST | `/` | Create store (STORE_OWNER) |
| PUT | `/{id}` | Update store |
| PATCH | `/{id}/status` | Change store status |

#### Categories (`/api/stores/{storeId}/categories`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List store categories |
| POST | `/` | Create category |
| PUT | `/{id}` | Update category |
| DELETE | `/{id}` | Delete category |

#### Products (`/api/stores/{storeId}/products`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List store products |
| POST | `/` | Create product |
| PUT | `/{id}` | Update product |
| PATCH | `/{id}/availability` | Toggle availability |
| DELETE | `/{id}` | Delete product |

#### Orders (`/api/orders`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create order (CUSTOMER) |
| GET | `/my-orders` | Customer order history |
| GET | `/store-orders` | Store incoming orders |
| GET | `/{id}` | Get order details |
| PATCH | `/{id}/accept` | Accept order (STORE) |
| PATCH | `/{id}/reject` | Reject order (STORE) |
| PATCH | `/{id}/prepare` | Start preparing (STORE) |
| PATCH | `/{id}/ready` | Mark ready (STORE) |
| POST | `/{id}/cancel` | Cancel order |
| POST | `/{id}/reorder` | Reorder from history |

#### Deliveries (`/api/deliveries`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/available` | Available delivery requests (DRIVER) |
| GET | `/my-deliveries` | Driver delivery history |
| GET | `/{id}` | Get delivery details |
| PATCH | `/{id}/accept` | Accept delivery (DRIVER) |
| PATCH | `/{id}/pickup` | Confirm pickup (DRIVER) |
| PATCH | `/{id}/on-the-way` | Start delivery (DRIVER) |
| PATCH | `/{id}/deliver` | Complete delivery (DRIVER) |

#### Driver (`/api/drivers`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/me` | Get driver profile |
| PATCH | `/me/status` | Update availability |

#### Reviews (`/api/reviews`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create review (CUSTOMER) |
| GET | `/order/{orderId}` | Get review for order |
| GET | `/store/{storeId}` | Get store reviews |

#### Notifications (`/api/notifications`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List my notifications |
| PATCH | `/{id}/read` | Mark as read |
| PATCH | `/read-all` | Mark all as read |

#### Admin (`/api/admin`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Platform statistics |
| GET | `/customers` | List all customers |
| GET | `/stores` | List all stores |
| GET | `/drivers` | List all drivers |
| GET | `/orders` | List all orders |
| PATCH | `/users/{id}/toggle-active` | Enable/disable user |

---

## Key Business Rules Implemented

1. Customer can only order from an **OPEN** store
2. Cannot order **unavailable** products
3. Store must **accept** before **preparing**
4. Store must mark **ready** before delivery begins
5. Driver must **accept** before pickup
6. Driver cannot **complete** before pickup
7. Only **DELIVERED** orders can receive reviews
8. **CANCELLED** orders cannot continue
9. Driver must be **AVAILABLE** to receive deliveries
10. One active delivery per order at a time
11. Order cancellation only in PENDING/ACCEPTED/PREPARING/READY
12. Historical prices preserved in order_items

---

## Verification Plan

### Automated Tests
```bash
mvn clean compile          # Verify compilation
mvn spring-boot:run        # Verify application starts
```

### Manual Verification
- Test auth flow (register → login → JWT)
- Test complete order journey (create → accept → prepare → ready → assign → pickup → deliver)
- Test business rule enforcement (ordering from closed store, cancelling late, etc.)
- Test role-based access control
