import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // En conditions réelles, vous pourriez tester via ConvexHttpClient si la Database répond
        // Mais pour empêcher un Cold Start de tuer le conteneur NextJS, une réponse 200 immédiate est préférable.

        return NextResponse.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            version: "1.0.0-rc1",
            uptime_seconds: process.uptime(),
            environment: process.env.NODE_ENV || "development"
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            }
        });
    } catch (error) {
        return NextResponse.json({
            status: "unhealthy",
            error: "Le service interne NextJS ne répond pas correctement."
        }, { status: 503 });
    }
}
