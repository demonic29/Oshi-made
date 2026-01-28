// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, authOptions } from '@/lib/auth';

import { getServerSession } from 'next-auth';

// upload images to supabase storage ( product-images )
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)


export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse form data
        const formData = await request.formData();
        
        // CHANGED: Get all images (multiple files)
        const images = formData.getAll('images') as File[];
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const taste = formData.get('taste') as string;
        const sellerId = session.user.id;

        // Validate required fields
        if (!images || images.length === 0 || !name || !description || !category || !taste) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
    

        // CHANGED: Process and save all images
        const imageUrls: string[] = [];

        for (const image of images) {
        if (!(image instanceof File)) continue;

        const ext = image.name.split('.').pop();
        const fileName = `${sellerId}/${crypto.randomUUID()}.${ext}`;

        const buffer = Buffer.from(await image.arrayBuffer());

        const { error } = await supabase.storage
            .from('product-images')
            .upload(fileName, buffer, {
                contentType: image.type,
                upsert: false,
            });

        if (error) {
            console.error(error);
            continue;
        }

        const { data } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

        imageUrls.push(data.publicUrl);
        }


        // Validate that at least one image was successfully uploaded
        if (imageUrls.length === 0) {
            return NextResponse.json({ error: 'No images were uploaded' }, { status: 400 });
        }

        // Save to database with all image URLs
        const product = await prisma.product.create({
            data: {
                name,
                description,
                images: imageUrls, // Array of all image URLs
                category,
                taste,
                stock: 1,
                sellerId
            },
        });

        return NextResponse.json({ success: true, product }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Get all products for homepage
export async function GET() {
    // const session = await getServerSession(authOptions);

    try {
        const products = await prisma.product.findMany({
            // where: {
            //     sellerId: session?.user.id
            // },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ products }, { status: 200 });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}