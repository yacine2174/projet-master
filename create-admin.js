require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Utilisateur = require('./models/Utilisateur');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Utilisateur.findOne({ email: 'admin@audit.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('Status:', existingAdmin.statut);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new Utilisateur({
      nom: 'Administrator',
      email: 'admin@audit.com',
      motDePasse: hashedPassword,
      role: 'ADMIN',
      statut: 'approved'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@audit.com');
    console.log('Password: admin123');
    console.log('Role: ADMIN');
    console.log('Status: approved');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminUser();
