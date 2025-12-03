// components/SignOutButton.tsx
'use client'

import React from 'react';
import { signOut } from 'next-auth/react';
import { Button } from './button';

interface SignOutButtonProps {
  // Optional: Allows passing custom classes for styling
  className?: string; 
}

export default function SignOutButton({ className }: SignOutButtonProps) {
    const handleSignOut = () => {
        signOut({ callbackUrl: '/register' }); 
    };

    return (
        <Button 
            onClick={handleSignOut}
            className={`bg-main w-full py-6 text-white ${className}`}
        >
            サインアウト
        </Button>
    );
}