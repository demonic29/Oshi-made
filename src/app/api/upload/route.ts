import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for server-side
);

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const roomId = formData.get('roomId') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!roomId) {
            return NextResponse.json({ error: 'No room ID provided' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
        const filePath = `chat-images/${roomId}/${fileName}`;

        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Supabase Storage with service role key
        const { data, error } = await supabaseAdmin.storage
            .from('chat-files')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('chat-files')
            .getPublicUrl(filePath);

        return NextResponse.json({
            success: true,
            fileName,
            fileUrl: publicUrl
        });

    } catch (error) {
        console.error('Upload API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false, // Disable body parsing for FormData
    },
};