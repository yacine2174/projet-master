require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Utilisateur = require('./models/Utilisateur');

async function fixAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await Utilisateur.findOne({ email: 'admin@audit.com' });
    
    if (!adminUser) {
      console.log('Admin user not found, creating new one...');
      
      // Create new admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdminUser = new Utilisateur({
        nom: 'Administrator',
        email: 'admin@audit.com',
        motDePasse: hashedPassword,
        role: 'ADMIN',
        status: 'approved'
      });

      await newAdminUser.save();
      console.log('New admin user created successfully!');
    } else {
      console.log('Admin user found, updating status...');
      
      // Update admin user status and role
      adminUser.status = 'approved';
      adminUser.role = 'ADMIN';
      
      // Update password if needed
      if (!adminUser.motDePasse) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        adminUser.motDePasse = hashedPassword;
      }
      
      await adminUser.save();
      console.log('Admin user updated successfully!');
    }

    // Verify the admin user
    const verifiedAdmin = await Utilisateur.findOne({ email: 'admin@audit.com' });
    console.log('\nAdmin user details:');
    console.log('Email:', verifiedAdmin.email);
    console.log('Role:', verifiedAdmin.role);
    console.log('Status:', verifiedAdmin.status);
    console.log('Password exists:', !!verifiedAdmin.motDePasse);

  } catch (error) {
    console.error('Error fixing admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixAdminUser();
