import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';

interface RateLimitResult {
    success: boolean;
    remaining: number;
    reset: number;
}

class RateLimit {
    private async getKey(request: NextRequest, endpoint: string): Promise<string> {
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        return `ratelimit:${endpoint}:${ip}`;
    }

    async check(
        request: NextRequest,
        endpoint: string,
        limit: number,
        windowSeconds: number
    ): Promise<RateLimitResult> {
        const key = await this.getKey(request, endpoint);
        const now = Date.now();
        const windowMs = windowSeconds * 1000;

        const doc = db.collection('rateLimits').doc(key);

        try {
            const result = await db.runTransaction(async (transaction) => {
                const snapshot = await transaction.get(doc);
                const data = snapshot.data();

                if (!data || now - data.timestamp > windowMs) {
                    // First request or window expired
                    transaction.set(doc, {
                        count: 1,
                        timestamp: now
                    });
                    return {
                        success: true,
                        remaining: limit - 1,
                        reset: now + windowMs
                    };
                }

                if (data.count >= limit) {
                    // Rate limit exceeded
                    return {
                        success: false,
                        remaining: 0,
                        reset: data.timestamp + windowMs
                    };
                }

                // Increment counter
                transaction.update(doc, {
                    count: data.count + 1
                });

                return {
                    success: true,
                    remaining: limit - (data.count + 1),
                    reset: data.timestamp + windowMs
                };
            });

            return result;
        } catch (error) {
            console.error('Rate limit check failed:', error);
            // On error, allow the request but log the issue
            return {
                success: true,
                remaining: 1,
                reset: now + windowMs
            };
        }
    }
}

export const rateLimit = new RateLimit(); 