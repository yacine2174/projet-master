const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Utilisateur = require('./models/Utilisateur');

// Connect to MongoDB
mongoose.connect('mongodb+srv://yacine:Yacine@projectttttttttt.oisro9s.mongodb.net/?retryWrites=true&w=majority&appName=projectttttttttt')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function addUser() {
  try {
    console.log('🔧 Adding user to database...\n');

    // Check if user already exists
    const existingUser = await Utilisateur.findOne({ email: 'yeey7735@gmail.com' });
    
    if (existingUser) {
      console.log('✅ User already exists in database');
      console.log('   Email:', existingUser.email);
      console.log('   Name:', existingUser.nom);
      console.log('   Role:', existingUser.role);
      console.log('   Status:', existingUser.status);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('TestPassword123', 12);

    // Create new user
    const newUser = new Utilisateur({
      nom: 'Test User',
      email: 'yeey7735@gmail.com',
      motDePasse: hashedPassword,
      role: 'SSI',
      status: 'approved'
    });

    await newUser.save();
    
    console.log('✅ User created successfully!');
    console.log('   Email: yeey7735@gmail.com');
    console.log('   Password: TestPassword123');
    console.log('   Role: SSI');
    console.log('   Status: approved');

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

addUser();
