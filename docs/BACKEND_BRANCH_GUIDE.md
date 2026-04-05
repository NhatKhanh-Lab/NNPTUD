# Backend Branch Guide

Tai lieu nay dung de chia backend thanh 3 nhanh, 3 nguoi, it xung dot nhat.

## 1. Nhanh goc de moi nguoi tach nhanh

- Base branch: `main`
- Repo: `https://github.com/nkhanh-it/NNPTUD`
- Truoc khi lam viec, moi nguoi phai:

```bash
git checkout main
git pull origin main
```

## 2. Quy tac chung

- Chi sua dung file thuoc scope cua nhanh minh.
- Khong sua file cua nhanh khac neu chua thong nhat.
- Truoc khi push:

```bash
git pull origin main
```

- Neu co conflict thi tu giai quyet tren nhanh cua minh truoc khi tao PR.
- Khong commit cac file sau:
  - `AGENT.MD`
  - `*.log`
  - `*.err.log`
  - `frontend/`
  - `zip/`

## 3. Chia nhanh

### Nguoi 1: Payment + Notification

- Branch: `feature/payment-notification`
- Muc tieu:
  - Tach payment business logic ra service
  - Chuan hoa payment state machine
  - Gom notification/socket vao service rieng
  - Hoan thien API notification

- File ownership:
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

- Khong duoc sua:
  - `src/controllers/orderController.js`
  - `src/services/orderService.js`
  - `src/routes/orderRoutes.js`
  - `src/models/Order.js`

- Lenh tao nhanh:

```bash
git checkout -b feature/payment-notification
```

- Commit message goi y:

```bash
git commit -m "refactor(payment): isolate payment and notification logic"
```

- Push:

```bash
git push -u origin feature/payment-notification
```

### Nguoi 2: Order + Checkout

- Branch: `feature/order-checkout`
- Muc tieu:
  - Tach order flow ra service
  - Chuan hoa order state machine
  - Xu ly checkout, inventory, idempotency
  - Giu controller mong

- File ownership:
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

- Khong duoc sua:
  - `src/controllers/paymentController.js`
  - `src/services/paymentService.js`
  - `src/services/notificationService.js`
  - `src/routes/paymentRoutes.js`

- Lenh tao nhanh:

```bash
git checkout -b feature/order-checkout
```

- Commit message goi y:

```bash
git commit -m "refactor(order): move checkout and order transitions into service"
```

- Push:

```bash
git push -u origin feature/order-checkout
```

### Nguoi 3: CRUD/Auth/Shared backend cleanup

- Branch: `feature/backend-cleanup`
- Muc tieu:
  - Don dep layer chung backend
  - Chuan hoa auth/authorize/error handling
  - Hoan thien thin-controller pattern cho CRUD don gian
  - Giu ownership cac file routing chung

- File ownership:
  - `src/controllers/authController.js`
  - `src/controllers/cartController.js`
  - `src/controllers/categoryController.js`
  - `src/controllers/productController.js`
  - `src/controllers/roleController.js`
  - `src/controllers/userController.js`
  - `src/services/cartService.js`
  - `src/services/transactionService.js`
  - `src/middlewares/auth.js`
  - `src/middlewares/authorize.js`
  - `src/middlewares/errorHandler.js`
  - `src/middlewares/validate.js`
  - `src/routes/authRoutes.js`
  - `src/routes/cartRoutes.js`
  - `src/routes/categoryRoutes.js`
  - `src/routes/productRoutes.js`
  - `src/routes/roleRoutes.js`
  - `src/routes/userRoutes.js`
  - `src/routes/index.js`

- Khong duoc sua:
  - `src/services/orderService.js`
  - `src/services/paymentService.js`
  - `src/controllers/orderController.js`
  - `src/controllers/paymentController.js`

- Lenh tao nhanh:

```bash
git checkout -b feature/backend-cleanup
```

- Commit message goi y:

```bash
git commit -m "refactor(api): align auth and CRUD controllers with thin-controller pattern"
```

- Push:

```bash
git push -u origin feature/backend-cleanup
```

## 4. Thu tu merge

1. Merge `feature/backend-cleanup`
2. Merge `feature/payment-notification`
3. Merge `feature/order-checkout`

Neu nhom muon merge `order` truoc `payment`, duoc, nhung nguoi 1 va nguoi 2 phai `git pull origin main` lai truoc khi push PR.

## 5. Quy tac staging

Chi stage file thuoc nhanh minh:

```bash
git status
git add <danh_sach_file_scope_cua_minh>
git commit -m "<commit_message>"
git push -u origin <ten_nhanh>
```

## 6. File da co tren base main

Base `main` da chua:
- backend skeleton
- auth / authorize / validation middleware
- domain, repository, service structure
- package, env example, README, API playground

Nhiem vu cua 3 nhanh la tiep tuc hoan thien tung module theo scope tren, khong duoc sua tran lan.
