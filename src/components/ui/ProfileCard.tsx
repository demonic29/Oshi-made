// components/ProfileCard.tsx
'use client'

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import SignOutButton from './SignOutButton';
// import ButtonUi from './ui/ButtonUi'; // Assuming you have this component

export default function ProfileCard() {
    // 1. Get Session Data
    const { data: session, status } = useSession();

    // 2. Handle Loading State
    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-40">
                <p>Loading user profile...</p>
            </div>
        );
    }

    // 3. Handle Not Authenticated State
    if (!session) {
        return (
            <div className="text-center p-6 bg-red-100 rounded-lg">
                <p className="text-red-700 font-semibold">
                    You are not signed in. Please log in to view your profile.
                </p>
                {/* Optionally, include a link/button to the sign-in page */}
            </div>
        );
    }

    // 4. Display User Data
    const user = session.user;

    return (
        <div className="max-w-md mx-auto bg-white shadow-xl rounded-lg overflow-hidden my-10">
            <div className="bg-gray-100 p-6 text-center">
                {/* User Image */}
                {user?.image && (
                    <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white">
                        <Image 
                            src={user?.image}
                            alt={user.name || 'User Profile'}
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                )}
                
                {/* User Name and Email */}
                <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
            
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Account Details</h3>
                <p className="text-sm text-gray-600 mb-2">
                    **User ID:** {user?.id || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                    **Authentication Method:** Google
                </p>
                
                <SignOutButton/>
            </div>
        </div>
    );
}