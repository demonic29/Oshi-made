// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getServerSession } from 'next-auth';

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

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // CHANGED: Process and save all images
        const imageUrls: string[] = [];
        
        for (const image of images) {
            // Validate that it's actually a file
            if (!(image instanceof File)) continue;
            
            // Save image to public/uploads folder
            const bytes = await image.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Create unique filename
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(7);
            const filename = `${timestamp}-${randomSuffix}-${image.name.replace(/\s+/g, '-')}`;
            const filepath = join(uploadsDir, filename);
            
            await writeFile(filepath, buffer);
            imageUrls.push(`/uploads/${filename}`);
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