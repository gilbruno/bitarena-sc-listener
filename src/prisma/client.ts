import { PrismaClient } from '@prisma/client';
import logger from '../logger/log';

class PrismaManager {
    private static instance: PrismaClient;

    private constructor() { }

    public static getInstance(): PrismaClient {
        if (!PrismaManager.instance) {
            PrismaManager.instance = new PrismaClient({
                log: [
                    {
                        emit: 'event',
                        level: 'query',
                    },
                    {
                        emit: 'event',
                        level: 'error',
                    },
                ],
            });

            // Logging des requêtes Prisma
            PrismaManager.instance.$on('query', (e: { query: string; duration: number }) => {
                logger.debug('Prisma Query', { query: e.query, duration: e.duration });
            });

            PrismaManager.instance.$on('error', (e: { message: string }) => {
                logger.error('Prisma Error', { error: e.message });
            });
        }
        return PrismaManager.instance;
    }
}

export const prisma = PrismaManager.getInstance(); 