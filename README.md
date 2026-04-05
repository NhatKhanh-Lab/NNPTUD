# Online Shop Management API

Backend do an Node.js/Express cho mon Ngon ngu Phat trien Ung dung moi.

## Tinh nang

- JWT authentication
- Role-based authorization (`admin`, `staff`, `customer`)
- CRUD cho user, role, category, product, cart, order, payment, notification
- Upload avatar va anh san pham
- Transaction dat hang bang MongoDB session
- Socket.IO thong bao realtime

## Cong nghe

- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcryptjs
- Multer
- Socket.IO

## Cai dat

```bash
npm install
copy .env.example .env
```

## Chay project

```bash
npm run dev
```

## Frontend React

Chay frontend rieng trong luc dev:

```bash
npm run frontend:dev
```

Chay ca backend + frontend:

```bash
npm run dev:full
```

Build frontend:

```bash
npm run frontend:build
```

Sau khi build, backend se serve frontend tai:

- `http://localhost:5000/`

Trang test API dang "Postman online":

- Mo `http://localhost:5000/tools/api-playground.html`
- Chon endpoint mau, sua body JSON va gui request truc tiep
- API upload file van nen demo bang Postman desktop vi can `form-data`

## Seed du lieu

```bash
npm run seed
```

Tai khoan mac dinh:

- `admin@example.com` / `123456`
- `staff@example.com` / `123456`
- `customer@example.com` / `123456`

## Luu y transaction

- API dat hang su dung MongoDB transaction khi database chay replica set.
- Neu MongoDB dang la standalone, endpoint van fallback de demo luong dat hang, va response se tra `meta.transactionMode`.
- Muon demo transaction dung nghia cho bao cao, nen bat replica set cho MongoDB.
