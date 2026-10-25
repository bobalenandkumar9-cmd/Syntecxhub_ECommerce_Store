require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

const img = (s) => `https://picsum.photos/seed/${s}/600/450`;
const products = [
  ['Wireless Headphones', 'Over-ear Bluetooth headphones with 30-hour battery life.', 2999, 'Electronics', 25],
  ['Mechanical Keyboard', 'Hot-swappable keyboard with tactile switches and RGB.', 4499, 'Electronics', 15],
  ['Smart Watch', 'Heart-rate, sleep tracking and 7-day battery.', 3799, 'Electronics', 30],
  ['Portable Speaker', 'Water-resistant speaker with deep bass.', 1999, 'Electronics', 40],
  ['Canvas Backpack', '22L backpack with laptop sleeve and rain cover.', 1499, 'Fashion', 50],
  ['Running Shoes', 'Lightweight, breathable daily trainers.', 3299, 'Fashion', 35],
  ['Cotton T-Shirt', 'Heavyweight 100% cotton crew-neck tee.', 599, 'Fashion', 100],
  ['Aviator Sunglasses', 'UV400 polarised lenses, metal frame.', 899, 'Fashion', 60],
  ['Steel Water Bottle', 'Insulated 750 ml bottle, keeps cold 24h.', 699, 'Home', 80],
  ['Ceramic Coffee Mug', 'Hand-glazed 350 ml mug, dishwasher safe.', 349, 'Home', 120],
  ['LED Desk Lamp', 'Dimmable lamp with USB charging port.', 1199, 'Home', 45],
  ['Yoga Mat', '6 mm non-slip mat with carry strap.', 799, 'Sports', 70],
].map(([name, description, price, category, stock], i) => ({ name, description, price, category, stock, image: img('store' + i) }));

(async () => {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  const email = (process.env.ADMIN_EMAIL || 'admin@store.com').toLowerCase();
  if (!(await User.findOne({ email }))) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Store Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log('Admin created:', email);
  } else console.log('Admin already exists:', email);
  console.log(`Seeded ${products.length} products`);
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
