
import type { User } from '../types';

// This is a mock authentication service. In a real application, this would
// interact with an authentication provider like Firebase Auth, Auth0, or a custom backend.

const MOCK_USER_KEY = 'agriFutureMockUser';

// A simple mock user
const mockUser: User = {
  uid: '12345',
  name: 'A. Farmer',
  email: 'farmer@agrifuture.dev',
  avatarUrl: `https://api.multiavatar.com/A.%20Farmer.svg`,
};

export const authService = {
  // Simulate signing in with Google
  signInWithGoogle: async (): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
            localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
        } catch (e) {
            console.error("Could not save user to local storage", e);
        }
        resolve(mockUser);
      }, 500); // Simulate network delay
    });
  },

  // Simulate signing in with Mobile (for demo, this just logs in the mock user)
  signInWithMobile: async (mobile: string): Promise<User> => {
    console.log(`Signing in with mobile: ${mobile}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
            localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
        } catch (e) {
            console.error("Could not save user to local storage", e);
        }
        resolve(mockUser);
      }, 500);
    });
  },

  // Simulate sending an OTP
  sendOtp: async (mobile: string): Promise<boolean> => {
    console.log(`Sending OTP to ${mobile}`);
    return new Promise(resolve => setTimeout(() => resolve(true), 1000));
  },

  // Simulate verifying OTP and signing up
  verifyOtpAndSignUp: async (mobile: string, otp: string): Promise<User> => {
    console.log(`Verifying OTP ${otp} for mobile ${mobile}`);
     return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === "123456") { // Mock success OTP
            try {
                localStorage.setItem(MOCK_USER_KEY, JSON.stringify(mockUser));
            } catch (e) {
                console.error("Could not save user to local storage", e);
            }
            resolve(mockUser);
        } else {
            reject(new Error("Invalid OTP"));
        }
      }, 1000);
    });
  },

  // Simulate signing out
  signOut: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
            localStorage.removeItem(MOCK_USER_KEY);
        } catch (e) {
            console.error("Could not remove user from local storage", e);
        }
        resolve();
      }, 300);
    });
  },

  // Check for an existing session on app load
  checkSession: (): User | null => {
    try {
        const storedUser = localStorage.getItem(MOCK_USER_KEY);
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        console.error("Could not retrieve user from local storage", e);
        return null;
    }
  },
};
