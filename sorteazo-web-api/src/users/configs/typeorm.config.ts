import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { environment } from "./enviroment.config";

export const TypeOrmOptions: TypeOrmModuleOptions = {
    type: "postgres",
    host: environment.database.host,
    port: environment.database.port,
    username: environment.database.username,
    password: environment.database.password,
    database: environment.database.database,
    logging: false,
    synchronize: true,
    autoLoadEntities: true
};
