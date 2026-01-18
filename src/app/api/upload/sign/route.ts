import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fileName, fileType, roomId } = await request.json();
        
        if (!fileName || !fileType || !roomId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const filePath = `chat-images/${roomId}/${fileName}`;

        // Create signed upload URL (valid for 1 hour)
        const { data, error } = await supabaseAdmin.storage
            .from('chat-files')
            .createSignedUploadUrl(filePath, {
                upsert: false
            });

        if (error) {
            console.error('Error creating signed URL:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            signedUrl: data.signedUrl,
            path: filePath,
            token: data.token
        });

    } catch (error) {
        console.error('Sign URL error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}