import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CategoriesModule } from "./categories/categories.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { IncomesModule } from "./incomes/incomes.module";
import { InstallmentsModule } from "./installments/installments.module";
import { SavingsBoxModule } from "./savings-box/savings-box.module";
import { PaymentMethodModule } from "./payment-methods/payment-method.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { CardsModule } from "./cards/cards.module";
import { GoalsModule } from "./goals/goals.module";
import { InvestmentsModule } from "./investments/investments.module";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";
import { HealthController } from "./health.controller";

@Module({
	controllers: [HealthController],
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		TypeOrmModule.forRootAsync({
			useFactory: () => {
				const nodeEnv = process.env.NODE_ENV;

				if (nodeEnv === "development") {
					return {
						type: "postgres",
						host: process.env.DB_HOST,
						port: parseInt(process.env.DB_PORT ?? "5432", 10),
						username: process.env.DB_USERNAME,
						password: process.env.DB_PASSWORD,
						database: process.env.DB_NAME,
						autoLoadEntities: true,
						synchronize: false,
					};
				}

				return {
					type: "postgres",
					url: process.env.DATABASE_URL,
					ssl: { rejectUnauthorized: false },
					autoLoadEntities: true,
					synchronize: true,
				};
			},
		}),

		AuthModule,
		UsersModule,
		CategoriesModule,
		TransactionsModule,
		IncomesModule,
		InstallmentsModule,
		SavingsBoxModule,
		PaymentMethodModule,
		AnalyticsModule,
		CardsModule,
		GoalsModule,
		InvestmentsModule,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes("*");
	}
}
