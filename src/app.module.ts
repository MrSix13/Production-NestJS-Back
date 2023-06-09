import { Module, RequestMethod } from "@nestjs/common";
import { MiddlewareConsumer } from "@nestjs/common/interfaces";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { TablesModule } from "./tables/tables.module";
import { MenusModule } from "./menus/menus.module";
import { OrdersModule } from "./orders/orders.module";
import { RestaurantsModule } from "./restaurants/restaurants.module";
import { PaymentGatewayModule } from "./payment-gateway/payment-gateway.module";
import * as express from "express";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UsersModule,
    AuthModule,
    TablesModule,
    MenusModule,
    OrdersModule,
    RestaurantsModule,
    PaymentGatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(express.json(), express.urlencoded({ extended: true }))
      .forRoutes({ path: "*", method: RequestMethod.ALL });
    consumer
      .apply((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization",
        );
        next();
      })
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
