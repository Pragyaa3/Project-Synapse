// Simple health check endpoint
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    const itemCount = await prisma.item.count();

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      itemCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    }, { status: 500 });
  }
}
