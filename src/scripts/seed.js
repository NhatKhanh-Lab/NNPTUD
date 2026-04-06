const connectDatabase = require("../config/db");
const Role = require("../models/Role");
const User = require("../models/User");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");

const seed = async () => {
  await connectDatabase();

  await Promise.all([
    Role.deleteMany({}),
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Cart.deleteMany({}),
    CartItem.deleteMany({}),
    Order.deleteMany({}),
    OrderItem.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({})
  ]);

  const [adminRole, staffRole, customerRole] = await Role.create([
    { name: "admin", description: "Quan tri he thong" },
    { name: "staff", description: "Nhan vien quan ly san pham va don hang" },
    { name: "customer", description: "Khach hang" }
  ]);

  const users = await User.create([
    {
      fullName: "Admin User",
      email: "admin@example.com",
      password: "123456",
      role: adminRole._id,
      phone: "0900000001",
      address: "Ho Chi Minh City"
    },
    {
      fullName: "Staff User",
      email: "staff@example.com",
      password: "123456",
      role: staffRole._id,
      phone: "0900000002",
      address: "Da Nang"
    },
    {
      fullName: "Customer User",
      email: "customer@example.com",
      password: "123456",
      role: customerRole._id,
      phone: "0900000003",
      address: "Ha Noi"
    }
  ]);

  await Cart.create(users.map((user) => ({ user: user._id })));

  const categories = await Category.create([
    { name: "Laptop", description: "Danh muc laptop" },
    { name: "Phu kien", description: "Danh muc phu kien" }
  ]);

  await Product.create([
    {
      name: "MacBook Pro M3",
      description: "Laptop cao cap",
      price: 45000000,
      stock: 10,
      category: categories[0]._id,
      createdBy: users[0]._id
    },
    {
      name: "Logitech MX Master 3S",
      description: "Chuot khong day",
      price: 2500000,
      stock: 30,
      category: categories[1]._id,
      createdBy: users[1]._id
    }
  ]);

  console.log("Seed completed");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
