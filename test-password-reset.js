const mongoose = require('mongoose');
const PasswordResetRequest = require('./models/PasswordResetRequest');
const Utilisateur = require('./models/Utilisateur');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb+srv://yacine:Yacine@projectttttttttt.oisro9s.mongodb.net/?retryWrites=true&w=majority&appName=projectttttttttt')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testPasswordResetFlow() {
  try {
    console.log('🧪 Testing Password Reset Flow...\n');

    // Step 1: Check if test user exists
    console.log('1. Checking for test user...');
    let testUser = await Utilisateur.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('   Creating test user...');
      const hashedPassword = await bcrypt.hash('TestPassword123', 12);
      testUser = new Utilisateur({
        nom: 'Test',
        prenom: 'User',
        email: 'test@example.com',
        motDePasse: hashedPassword,
        role: 'SSI',
        status: 'approved'
      });
      await testUser.save();
      console.log('   ✅ Test user created');
    } else {
      console.log('   ✅ Test user exists');
    }

    // Step 2: Create password reset request
    console.log('\n2. Creating password reset request...');
    const resetRequest = new PasswordResetRequest({
      userId: testUser._id,
      userEmail: testUser.email,
      userName: testUser.nom,
      userRole: testUser.role,
      status: 'pending'
    });
    await resetRequest.save();
    console.log('   ✅ Password reset request created');

    // Step 3: Check request status
    console.log('\n3. Checking request status...');
    const activeRequest = await PasswordResetRequest.findActiveRequest(testUser._id);
    console.log('   Status:', activeRequest.status);
    console.log('   ✅ Request found and active');

    // Step 4: Approve the request (simulate admin action)
    console.log('\n4. Approving request (admin action)...');
    await activeRequest.approve(testUser._id, 'Test approval');
    console.log('   ✅ Request approved');

    // Step 5: Check approved request
    console.log('\n5. Checking approved request...');
    const approvedRequest = await PasswordResetRequest.findOne({
      userId: testUser._id,
      status: 'approved',
      expiresAt: { $gt: new Date() }
    });
    
    if (approvedRequest) {
      console.log('   ✅ Approved request found');
      console.log('   Admin notes:', approvedRequest.adminNotes);
    } else {
      console.log('   ❌ No approved request found');
    }

    // Step 6: Test password update
    console.log('\n6. Testing password update...');
    const newPassword = 'NewPassword123';
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    const updatedUser = await Utilisateur.findOneAndUpdate(
      { email: testUser.email },
      { motDePasse: hashedNewPassword },
      { new: true }
    );
    
    if (updatedUser) {
      console.log('   ✅ Password updated successfully');
    } else {
      console.log('   ❌ Password update failed');
    }

    // Step 7: Mark request as completed
    console.log('\n7. Marking request as completed...');
    await approvedRequest.complete();
    console.log('   ✅ Request marked as completed');

    // Step 8: Verify final state
    console.log('\n8. Verifying final state...');
    const finalRequest = await PasswordResetRequest.findById(approvedRequest._id);
    console.log('   Final status:', finalRequest.status);
    console.log('   Completed at:', finalRequest.completedAt);

    console.log('\n🎉 Password reset flow test completed successfully!');
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await PasswordResetRequest.deleteMany({ userEmail: 'test@example.com' });
    console.log('   ✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testPasswordResetFlow();
