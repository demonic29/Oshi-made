// app/actions/auth-actions.ts
'use server';

import {supabase } from '@/lib/supabase/server';

export async function syncUserWithSupabase(firebaseUid: string, phoneNumber: string) {
  const supabaseClinet = await supabase();
  
  try {
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabaseClinet
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw checkError;
    }

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabaseClinet
        .from('users')
        .update({
          phone: phoneNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('firebase_uid', firebaseUid);

      if (updateError) throw updateError;
      return { success: true, message: 'User updated' };
    } else {
      // Create new user
      const { error: insertError } = await supabaseClinet
        .from('users')
        .insert({
          firebase_uid: firebaseUid,
          phone: phoneNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
      return { success: true, message: 'User created' };
    }
  } catch (error) {
    console.error('Error syncing user with Supabase:', error);
    return { success: false, message: 'Failed to sync user' };
  }
}