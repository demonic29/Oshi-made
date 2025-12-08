// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse form data
        const formData = await request.formData();
        const image = formData.get('image') as File;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const category = formData.get('category') as string;
        const taste = formData.get('taste') as string;

        // Validate required fields
        if (!image || !name || !description || !category || !taste) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Save image to public/uploads folder
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Create unique filename
        const timestamp = Date.now();
        const filename = `${timestamp}-${image.name.replace(/\s+/g, '-')}`;
        const filepath = join(uploadsDir, filename);
        
        await writeFile(filepath, buffer);
        const imageUrl = `/uploads/${filename}`;

        // Save to database
        const product = await prisma.product.create({
            data: {
                name,
                description,
                image: imageUrl,
                category,
                taste,
                stock: 1, // Default stock
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
    try {
        const products = await prisma.product.findMany({
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