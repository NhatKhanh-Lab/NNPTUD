# NNPTUD Online Shop

Website quan ly dat mon truc tuyen gom frontend cho khach hang va backend quan tri van hanh cua hang.

## Chuc nang chinh

- Dang ky, dang nhap bang JWT
- Phan quyen `admin`, `staff`, `customer`
- Quan ly danh muc, san pham, nguoi dung, vai tro
- Gio hang va quy trinh tao don hang
- Thanh toan va cap nhat trang thai don
- Thong bao theo nguoi dung
- API Playground de test nhanh endpoint
- Frontend React cho customer va admin dashboard

## Cong nghe su dung

- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO
- Frontend: React, Vite, TypeScript, Tailwind CSS

## Cau truc thu muc

- `src/`: backend source code
- `frontend/`: giao dien React
- `public/`: tai nguyen static, gom `api-playground.html`
- `uploads/`: anh san pham va avatar upload

## Cai dat

```bash
npm install
npm --prefix frontend install
copy .env.example .env
```

## Chay du an

Chay backend:

```bash
npm start
```

Chay frontend:

```bash
npm run frontend:dev
```

Chay dong thoi backend + frontend:

```bash
npm run dev:full
```

## Seed du lieu

```bash
npm run seed
```

Tai khoan mau:

- `admin@example.com` / `123456`
- `staff@example.com` / `123456`
- `customer@example.com` / `123456`

## Dia chi mac dinh

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api/v1`
- Health check: `http://localhost:5000/api/v1/health`
- API Playground: `http://localhost:5000/tools/api-playground.html`

## Scripts chinh

- `npm start`: chay backend
- `npm run dev`: chay backend voi watch mode
- `npm run seed`: seed du lieu mau
- `npm run frontend:dev`: chay frontend dev server
- `npm run frontend:build`: build frontend
- `npm run frontend:preview`: preview frontend sau build
- `npm run dev:full`: chay backend va frontend cung luc

## Ghi chu

- Frontend va backend dung chung repo.
- Anh upload duoc phuc vu qua thu muc `uploads/`.
- Neu can test API nhanh tren trinh duyet, dung `public/api-playground.html`.
