import { NestModule, MiddlewareConsumer } from '@nestjs/common';
export declare class AuthProxyModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void;
}
