import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { IncomesModule } from './incomes/incomes.module';
import { InstallmentsModule } from './installments/installments.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(
      isProduction
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            ssl: {
              rejectUnauthorized: false,
            },
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
          }
        : {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT ?? '5432', 10),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            database: process.env.DB_NAME || 'finance_tracker',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: false,
            logging: false,
          },
    ),
    AuthModule,
    UsersModule,
    CategoriesModule,
    TransactionsModule,
    IncomesModule,
    InstallmentsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
