import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

// Initialize Firebase Functions
const functions = getFunctions(getApp());

export async function getAllUsers() {
  try {
    const getAllUsersFunction = httpsCallable(functions, 'getAllUsers');
    const result = await getAllUsersFunction();

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error getting all users:', error);
    return {
      success: false,
      error: error.message || 'Failed to get users'
    };
  }
}

export async function updateUser(uid, updates) {
  try {
    const updateUserFunction = httpsCallable(functions, 'updateUser');
    const result = await updateUserFunction({ uid, updates });

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      error: error.message || 'Failed to update user'
    };
  }
}

export async function deleteUser(uid) {
  try {
    const deleteUserFunction = httpsCallable(functions, 'deleteUser');
    const result = await deleteUserFunction({ uid });

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete user'
    };
  }
}

export function formatUserData(user) {
  return {
    uid: user.uid,
    email: user.email,
    name: user.name || user.displayName || 'Unknown',
    role: user.role || 'user',
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber || 'Not set',
    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown',
    lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : 'Never',
    disabled: user.disabled || false,
    firestoreId: user.firestoreId,
    photoURL: user.photoURL
  };
}

export function validateUserUpdate(updates) {
  const errors = [];
  const validUpdates = {};

  // Validate name
  if (updates.name !== undefined) {
    if (typeof updates.name !== 'string' || updates.name.trim().length === 0) {
      errors.push('Name must be a non-empty string');
    } else if (updates.name.length > 50) {
      errors.push('Name must be less than 50 characters');
    } else {
      validUpdates.name = updates.name.trim();
    }
  }

  // Validate role
  if (updates.role !== undefined) {
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(updates.role)) {
      errors.push('Role must be either "user" or "admin"');
    } else {
      validUpdates.role = updates.role;
    }
  }

  // Validate email (can't be changed in Auth, but can be validated)
  if (updates.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.email)) {
      errors.push('Email must be a valid email address');
    }
  }

  // Validate phone number
  if (updates.phoneNumber !== undefined) {
    if (updates.phoneNumber !== null && typeof updates.phoneNumber !== 'string') {
      errors.push('Phone number must be a string or null');
    } else {
      validUpdates.phoneNumber = updates.phoneNumber;
    }
  }

  // Validate disabled status
  if (updates.disabled !== undefined) {
    if (typeof updates.disabled !== 'boolean') {
      errors.push('Disabled status must be a boolean');
    } else {
      validUpdates.disabled = updates.disabled;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    validUpdates
  };
}

export async function confirmUserDeletion(user) {
  const message = `Are you sure you want to delete the following user?\n\n` +
    `Name: ${user.name}\n` +
    `Email: ${user.email}\n` +
    `Role: ${user.role}\n\n` +
    `This action cannot be undone!`;

  return new Promise((resolve) => {
    // In a real application, you'd use a proper modal/dialog
    if (window.confirm(message)) {
      // Double confirmation
      const secondConfirm = window.confirm(
        `Please confirm again: Delete user "${user.email}"? This will remove their account and all associated data.`
      );
      resolve(secondConfirm);
    } else {
      resolve(false);
    }
  });
}
