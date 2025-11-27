// app/api/test-db/route.ts or pages/api/test-db.ts
import { prisma } from '@/lib/prisma'; // adjust path

export async function GET() {
    try {
        await prisma.$connect();
        return Response.json({ status: 'Connected to database' });
    } catch (error) {
        console.error('Database connection error:', error);
        return Response.json({ 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}