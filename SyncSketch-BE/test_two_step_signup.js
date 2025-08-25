// Test script for Two-Step Signup Flow
// This script demonstrates how to test the new signup endpoints

const BASE_URL = "http://localhost:3000"; // Adjust to your server URL

// Test data
const testUser = {
  userName: "testuser_" + Date.now(), // Unique username
  email: "test_" + Date.now() + "@example.com", // Unique email
  name: "Test User",
  password: "SecurePassword123!",
  phoneNumber: "+1234567890",
  avatarUrl: "https://example.com/avatar.jpg",
};

async function testTwoStepSignup() {
  console.log("🧪 Testing Two-Step Signup Flow\n");

  try {
    // Step 1: Request OTP
    console.log("📧 Step 1: Requesting OTP...");
    const otpResponse = await fetch(`${BASE_URL}/signup/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: testUser.userName,
        email: testUser.email,
      }),
    });

    if (!otpResponse.ok) {
      const error = await otpResponse.json();
      throw new Error(`OTP Request Failed: ${JSON.stringify(error)}`);
    }

    const otpResult = await otpResponse.json();
    console.log("✅ OTP Request Successful:", otpResult.message);
    console.log("📧 Check your email for OTP\n");

    // In a real scenario, you would get the OTP from email
    // For testing, we'll simulate this by asking the user
    console.log("🔐 Please check your email and enter the OTP:");
    console.log("   (You can also check the server logs for the OTP)");

    // Simulate OTP input (in real app, this would come from user input)
    const simulatedOtp = "123456"; // This should match what was sent

    // Step 2: Complete Signup
    console.log("\n📝 Step 2: Completing Signup...");
    const signupResponse = await fetch(`${BASE_URL}/signup/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: testUser.userName,
        email: testUser.email,
        otpCode: simulatedOtp,
        name: testUser.name,
        password: testUser.password,
        phoneNumber: testUser.phoneNumber,
        avatarUrl: testUser.avatarUrl,
      }),
    });

    if (!signupResponse.ok) {
      const error = await signupResponse.json();
      throw new Error(`Signup Completion Failed: ${JSON.stringify(error)}`);
    }

    const signupResult = await signupResponse.json();
    console.log("✅ Signup Completed Successfully!");
    console.log("👤 User Created:", signupResult.user);
    console.log("🔑 Token Received:", signupResult.token ? "Yes" : "No");

    // Test signin with the new account
    console.log("\n🔐 Testing Signin with new account...");
    const signinResponse = await fetch(`${BASE_URL}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: testUser.userName,
        password: testUser.password,
      }),
    });

    if (!signinResponse.ok) {
      const error = await signinResponse.json();
      throw new Error(`Signin Failed: ${JSON.stringify(error)}`);
    }

    const signinResult = await signinResponse.json();
    console.log("✅ Signin Successful!");
    console.log("👤 User Data:", signinResult.user);
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    console.error("Full Error:", error);
  }
}

async function testPasswordReset() {
  console.log("\n🔐 Testing Password Reset Flow\n");

  try {
    // Request password reset OTP
    console.log("📧 Requesting Password Reset OTP...");
    const resetRequestResponse = await fetch(`${BASE_URL}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
      }),
    });

    if (!resetRequestResponse.ok) {
      const error = await resetRequestResponse.json();
      throw new Error(
        `Password Reset Request Failed: ${JSON.stringify(error)}`
      );
    }

    const resetRequestResult = await resetRequestResponse.json();
    console.log("✅ Password Reset OTP Requested:", resetRequestResult.message);

    // In a real scenario, you would get the OTP from email
    console.log("📧 Check your email for password reset OTP");

    // Simulate OTP input
    const simulatedResetOtp = "123456";
    const newPassword = "NewSecurePassword123!";

    // Reset password
    console.log("\n🔄 Resetting Password...");
    const resetPasswordResponse = await fetch(`${BASE_URL}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testUser.email,
        otpCode: simulatedResetOtp,
        newPassword: newPassword,
      }),
    });

    if (!resetPasswordResponse.ok) {
      const error = await resetPasswordResponse.json();
      throw new Error(`Password Reset Failed: ${JSON.stringify(error)}`);
    }

    const resetPasswordResult = await resetPasswordResponse.json();
    console.log("✅ Password Reset Successful:", resetPasswordResult.message);

    // Test signin with new password
    console.log("\n🔐 Testing Signin with new password...");
    const signinResponse = await fetch(`${BASE_URL}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userName: testUser.userName,
        password: newPassword,
      }),
    });

    if (!signinResponse.ok) {
      const error = await signinResponse.json();
      throw new Error(
        `Signin with New Password Failed: ${JSON.stringify(error)}`
      );
    }

    const signinResult = await signinResponse.json();
    console.log("✅ Signin with New Password Successful!");
  } catch (error) {
    console.error("❌ Password Reset Test Failed:", error.message);
  }
}

// Run tests
async function runTests() {
  console.log("🚀 Starting Two-Step Signup Flow Tests\n");

  await testTwoStepSignup();
  await testPasswordReset();

  console.log("\n✨ All tests completed!");
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = { testTwoStepSignup, testPasswordReset };
}

// Run if this file is executed directly
if (typeof require !== "undefined" && require.main === module) {
  runTests();
}
