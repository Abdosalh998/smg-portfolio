const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smg_db';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB for seeding...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@smg.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists. Skipping seed.');
      process.exit(0);
    }

    // Create admin user
    await User.create({
      username: 'admin',
      email: 'admin@smg.com',
      password: 'Admin@1234',
      role: 'admin',
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email   : admin@smg.com');
    console.log('   Password: Admin@1234');
    console.log('   ⚠️  Please change the password after first login.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
