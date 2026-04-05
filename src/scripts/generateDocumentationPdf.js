const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const outputPath = path.join(process.cwd(), "docs", "system-documentation.pdf");

const models = [
  {
    name: "Role",
    purpose: "Luu vai tro he thong",
    fields: [
      ["name", "String", "Ten role, duy nhat"],
      ["description", "String", "Mo ta role"]
    ]
  },
  {
    name: "User",
    purpose: "Luu thong tin tai khoan",
    fields: [
      ["fullName", "String", "Ho ten user"],
      ["email", "String", "Email dang nhap, duy nhat"],
      ["password", "String", "Mat khau da hash bcrypt"],
      ["phone", "String", "So dien thoai"],
      ["avatar", "String", "Duong dan avatar"],
      ["address", "String", "Dia chi"],
      ["role", "ObjectId", "Tham chieu sang Role"],
      ["isActive", "Boolean", "Trang thai tai khoan"]
    ]
  },
  {
    name: "Category",
    purpose: "Phan loai san pham",
    fields: [
      ["name", "String", "Ten danh muc, duy nhat"],
      ["description", "String", "Mo ta danh muc"]
    ]
  },
  {
    name: "Product",
    purpose: "Thong tin san pham",
    fields: [
      ["name", "String", "Ten san pham"],
      ["description", "String", "Mo ta"],
      ["price", "Number", "Gia ban"],
      ["stock", "Number", "Ton kho hien tai"],
      ["image", "String", "Duong dan anh"],
      ["category", "ObjectId", "Tham chieu Category"],
      ["createdBy", "ObjectId", "Nguoi tao san pham"],
      ["isActive", "Boolean", "Con kinh doanh hay khong"]
    ]
  },
  {
    name: "Cart",
    purpose: "Gio hang cua tung user",
    fields: [
      ["user", "ObjectId", "Chu gio hang"],
      ["totalAmount", "Number", "Tong tien tam tinh"]
    ]
  },
  {
    name: "CartItem",
    purpose: "San pham trong gio hang",
    fields: [
      ["cart", "ObjectId", "Cart chua item"],
      ["product", "ObjectId", "San pham"],
      ["quantity", "Number", "So luong"],
      ["unitPrice", "Number", "Don gia tai luc them"],
      ["subtotal", "Number", "Thanh tien dong"]
    ]
  },
  {
    name: "Order",
    purpose: "Don hang",
    fields: [
      ["user", "ObjectId", "Khach hang dat hang"],
      ["code", "String", "Ma don hang"],
      ["shippingAddress", "String", "Dia chi giao hang"],
      ["note", "String", "Ghi chu"],
      ["totalAmount", "Number", "Tong tien don hang"],
      ["status", "String", "pending, confirmed, shipping, completed, cancelled"]
    ]
  },
  {
    name: "OrderItem",
    purpose: "Chi tiet tung san pham trong don",
    fields: [
      ["order", "ObjectId", "Don hang cha"],
      ["product", "ObjectId", "San pham"],
      ["quantity", "Number", "So luong dat"],
      ["unitPrice", "Number", "Don gia khi dat"],
      ["subtotal", "Number", "Thanh tien dong"]
    ]
  },
  {
    name: "Payment",
    purpose: "Thanh toan cua don hang",
    fields: [
      ["order", "ObjectId", "Gan 1-1 voi order"],
      ["method", "String", "cash, banking, momo"],
      ["amount", "Number", "So tien thanh toan"],
      ["status", "String", "pending, paid, failed, refunded"],
      ["paidAt", "Date", "Thoi diem thanh toan thanh cong"]
    ]
  },
  {
    name: "Notification",
    purpose: "Thong bao cho user",
    fields: [
      ["user", "ObjectId", "Nguoi nhan thong bao"],
      ["title", "String", "Tieu de"],
      ["message", "String", "Noi dung"],
      ["type", "String", "system, order, payment"],
      ["isRead", "Boolean", "Trang thai da doc"]
    ]
  }
];

const apis = [
  ["POST", "/auth/register", "Dang ky customer moi, co the upload avatar", "Public"],
  ["POST", "/auth/login", "Dang nhap va nhan JWT", "Public"],
  ["GET", "/auth/me", "Lay thong tin nguoi dung hien tai", "Login"],
  ["GET", "/roles", "Danh sach role", "admin"],
  ["POST", "/roles", "Tao role", "admin"],
  ["PUT", "/roles/:id", "Cap nhat role", "admin"],
  ["DELETE", "/roles/:id", "Xoa role", "admin"],
  ["GET", "/users", "Danh sach user", "admin"],
  ["GET", "/users/:id", "Chi tiet user", "admin"],
  ["POST", "/users", "Tao user moi, co the upload avatar", "admin"],
  ["PUT", "/users/:id", "Cap nhat user", "admin"],
  ["DELETE", "/users/:id", "Xoa user", "admin"],
  ["GET", "/categories", "Danh sach category", "Public"],
  ["GET", "/categories/:id", "Chi tiet category", "Public"],
  ["POST", "/categories", "Tao category", "admin, staff"],
  ["PUT", "/categories/:id", "Cap nhat category", "admin, staff"],
  ["DELETE", "/categories/:id", "Xoa category", "admin"],
  ["GET", "/products", "Danh sach product, co search keyword/categoryId", "Public"],
  ["GET", "/products/:id", "Chi tiet product", "Public"],
  ["POST", "/products", "Tao product va upload image", "admin, staff"],
  ["PUT", "/products/:id", "Cap nhat product", "admin, staff"],
  ["DELETE", "/products/:id", "Xoa product", "admin"],
  ["GET", "/carts/me", "Xem gio hang cua user hien tai", "Login"],
  ["POST", "/carts/items", "Them san pham vao gio", "Login"],
  ["PUT", "/carts/items/:id", "Sua so luong item trong gio", "Login"],
  ["DELETE", "/carts/items/:id", "Xoa item khoi gio", "Login"],
  ["GET", "/orders", "Danh sach order", "Login"],
  ["GET", "/orders/:id", "Chi tiet order, order item, payment", "Login"],
  ["POST", "/orders", "Customer tao order tu gio hang", "customer"],
  ["PATCH", "/orders/:id/status", "Admin/staff cap nhat trang thai order", "admin, staff"],
  ["GET", "/payments", "Danh sach payment", "admin, staff"],
  ["PATCH", "/payments/:id/status", "Cap nhat payment status theo state machine", "admin, staff"],
  ["GET", "/notifications/me", "Danh sach notification cua user hien tai", "Login"],
  ["PATCH", "/notifications/:id/read", "Danh dau notification da doc", "Login"]
];

const rules = [
  "Cart: quantity phai la so nguyen duong, khong duoc cong don vuot ton kho.",
  "Order: chi customer duoc tao don.",
  "Order: khi tao se tao Order + OrderItem + Payment va tru stock.",
  "Order state: pending -> confirmed | cancelled; confirmed -> shipping | cancelled; shipping -> completed.",
  "Order: huy don se hoan lai stock.",
  "Payment state: pending -> paid | failed; paid -> refunded.",
  "Payment online: phai paid truoc khi shipping hoac completed.",
  "COD: payment se duoc paid khi order completed.",
  "Socket: client emit join:user, server emit notification:new."
];

const doc = new PDFDocument({
  margin: 40,
  size: "A4",
  bufferPages: true
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
doc.pipe(fs.createWriteStream(outputPath));

const ensureSpace = (height = 40) => {
  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
};

const writeTitle = (text) => {
  ensureSpace(50);
  doc.moveDown(0.3);
  doc.font("Helvetica-Bold").fontSize(20).fillColor("#0f766e").text(text);
  doc.moveDown(0.2);
};

const writeSection = (text) => {
  ensureSpace(34);
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#111827").text(text);
  doc.moveDown(0.15);
};

const writeBody = (text) => {
  ensureSpace(24);
  doc.font("Helvetica").fontSize(10.5).fillColor("#1f2937").text(text, {
    align: "left"
  });
};

const writeBullet = (text) => {
  ensureSpace(20);
  doc.font("Helvetica").fontSize(10.5).fillColor("#1f2937").text(`- ${text}`, {
    indent: 12
  });
};

writeTitle("Online Shop Management API");
writeBody("Tai lieu he thong backend cho do an mon Ngon ngu phat trien ung dung moi.");
writeBody("Cong nghe: Node.js, Express.js, MongoDB, JWT, Multer, Socket.IO.");
writeBody("Base URL: http://localhost:5000/api/v1");

writeSection("1. Tong quan he thong");
writeBullet("10 model chinh: Role, User, Category, Product, Cart, CartItem, Order, OrderItem, Payment, Notification.");
writeBullet("Authentication bang JWT Bearer Token.");
writeBullet("Authorization theo role: admin, staff, customer.");
writeBullet("Upload file cho avatar va anh san pham.");
writeBullet("Socket.IO gui thong bao realtime.");

writeSection("2. Mo ta model");
models.forEach((model) => {
  ensureSpace(40);
  doc.moveDown(0.25);
  doc.font("Helvetica-Bold").fontSize(12).text(`${model.name}: ${model.purpose}`);
  model.fields.forEach(([field, type, meaning]) => {
    writeBody(`• ${field} (${type}): ${meaning}`);
  });
});

writeSection("3. Danh sach API");
apis.forEach(([method, endpoint, description, role]) => {
  writeBody(`${method} ${endpoint}`);
  writeBody(`Mo ta: ${description}`);
  writeBody(`Quyen: ${role}`);
  doc.moveDown(0.15);
});

writeSection("4. Quy tac nghiep vu");
rules.forEach(writeBullet);

writeSection("5. Tai khoan seed");
writeBullet("admin@example.com / 123456");
writeBullet("staff@example.com / 123456");
writeBullet("customer@example.com / 123456");

writeSection("6. Luu y transaction");
writeBullet("Neu MongoDB chay replica set, order su dung MongoDB session transaction.");
writeBullet("Neu MongoDB la standalone, API van chay voi fallback rollback bu tru.");
writeBullet("Response tao order co them truong meta.transactionMode de xac dinh che do.");

const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i += 1) {
  doc.switchToPage(i);
  doc.font("Helvetica").fontSize(9).fillColor("#6b7280").text(
    `Online Shop Management API Documentation - Page ${i + 1}/${range.count}`,
    40,
    doc.page.height - 30,
    { align: "center", width: doc.page.width - 80 }
  );
}

doc.end();
console.log(`PDF generated at: ${outputPath}`);
