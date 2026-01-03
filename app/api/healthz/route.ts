import { NextResponse } from 'next/server';
import { testRedisConnection } from '@/lib/redis';

export async function GET() {
  try {
    // Test Redis connection
    const isHealthy = await testRedisConnection();
    return NextResponse.json({ ok: isHealthy });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
