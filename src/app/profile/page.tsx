// app/profile/page.tsx
import ProfileCard from '@/components/ui/ProfileCard';
import React from 'react';

// Note: This page itself can be a Server Component, 
// as the interactive logic is contained in the Client Component (ProfileCard).

export default function ProfilePage() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-center mb-8">My Profile</h1>
            <ProfileCard/>
        </div>
    );
}