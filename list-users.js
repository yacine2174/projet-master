const mongoose = require('mongoose');
const Utilisateur = require('./models/Utilisateur');

// Connect to MongoDB
mongoose.connect('mongodb+srv://yacine:Yacine@projectttttttttt.oisro9s.mongodb.net/?retryWrites=true&w=majority&appName=projectttttttttt')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function listUsers() {
  try {
    console.log('📋 LISTING ALL USERS IN DATABASE\n');

    const users = await Utilisateur.find({}).select('-motDePasse');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('\n💡 To add a test user, run: node add-user.js');
    } else {
      console.log(`✅ Found ${users.length} user(s) in database:\n`);
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. User Details:`);
        console.log(`   Name: ${user.nom}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
    }

    console.log('🎯 You can use ANY of these email addresses for password reset testing!');

  } catch (error) {
    console.error('❌ Error listing users:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

listUsers();
