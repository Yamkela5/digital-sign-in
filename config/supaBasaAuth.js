// supabaseAuth.js - Authentication and data fetching functions for Supabase

import supabase from '../config/supabaseClient.js';

/**
 * Authenticate a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Authentication result with user data and admin status
 */
export async function authenticateUser(email, password) {
  try {
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    
    if (error) throw error;
    
    // Fetch user data from candidates table
    const { data: candidateData, error: candidateError } = await supabase
      .from('candidates')
      .select('id, "full name", email, cohort')
      .eq('email', email)
      .single();
    
    if (candidateError) throw candidateError;
    
    // Store user data in session storage
    sessionStorage.setItem('userData', JSON.stringify(candidateData));
    
    // Check if admin (email starts with "admin")
    const isAdmin = email.startsWith('admin');
    
    return { 
      isAdmin: isAdmin, 
      userData: candidateData 
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

/**
 * Get user data from the candidates table
 * @param {string} email - User's email
 * @returns {Promise<Object>} User data from candidates table
 */
export async function getUserData(email) {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('id, "full name", email, cohort')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

/**
 * Check if a user is an admin based on email prefix
 * @param {string} email - User's email
 * @returns {boolean} True if user is an admin
 */
export function isAdminUser(email) {
  return email.startsWith('admin');
}

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear session storage
    sessionStorage.removeItem('userData');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}
