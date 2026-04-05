# Backend Branch Guide

Tai lieu nay dung de chia backend thanh 3 nhanh, 3 nguoi.

## 1. Base branch

- Base branch: `main`
- Repo: `https://github.com/NhatKhanh-Lab/NNPTUD`
- `main` chi la khung backend dung chung.

Truoc khi lam viec:

```bash
git checkout main
git pull origin main
```

## 2. Quy tac chung

- Chi sua file thuoc nhanh minh.
- Khong commit:
  - `AGENT.MD`
  - `*.log`
  - `*.err.log`
  - `frontend/`
  - `zip/`

## 3. Chia nhanh

### Nguoi 1: Payment + Notification

- Branch: `feature/payment-notification`
- Day la nhanh da duoc tao san.

- Scope:
  - `src/controllers/paymentController.js`
  - `src/controllers/notificationController.js`
  - `src/services/paymentService.js`
  - `src/services/notificationService.js`
  - `src/repositories/paymentRepository.js`
  - `src/repositories/notificationRepository.js`
  - `src/domain/paymentDomain.js`
  - `src/validators/paymentValidators.js`
  - `src/routes/paymentRoutes.js`
  - `src/routes/notificationRoutes.js`

- Commit message nen dung:

```bash
git commit -m "add payment and notification backend"
```

### Nguoi 2: Order + Checkout

- Branch: `feature/order-checkout`

- Scope:
  - `src/controllers/orderController.js`
  - `src/services/orderService.js`
  - `src/repositories/orderRepository.js`
  - `src/repositories/cartRepository.js`
  - `src/repositories/productRepository.js`
  - `src/repositories/roleRepository.js`
  - `src/repositories/userRepository.js`
  - `src/domain/orderDomain.js`
  - `src/validators/orderValidators.js`
  - `src/routes/orderRoutes.js`
  - `src/models/Order.js`

- Lenh tao nhanh:

```bash
git checkout -b feature/order-checkout
```

- Commit message nen dung:

```bash
git commit -m "add order and checkout backend"
```

### Nguoi 3: Auth + CRUD

- Branch: `feature/crud-auth-core`

- Scope:
  - `src/controllers/authController.js`
  - `src/controllers/cartController.js`
  - `src/controllers/categoryController.js`
  - `src/controllers/productController.js`
  - `src/controllers/roleController.js`
  - `src/controllers/userController.js`
  - `src/services/cartService.js`
  - `src/routes/authRoutes.js`
  - `src/routes/cartRoutes.js`
  - `src/routes/categoryRoutes.js`
  - `src/routes/productRoutes.js`
  - `src/routes/roleRoutes.js`
  - `src/routes/userRoutes.js`
  - `src/routes/index.js`
  - `src/scripts/seed.js`

- Lenh tao nhanh:

```bash
git checkout -b feature/crud-auth-core
```

- Commit message nen dung:

```bash
git commit -m "add auth and CRUD backend"
```

## 4. Thu tu merge

1. `feature/crud-auth-core`
2. `feature/payment-notification`
3. `feature/order-checkout`
