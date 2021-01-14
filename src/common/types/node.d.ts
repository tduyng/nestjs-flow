declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly SERVER_PORT: string;
    readonly TYPEORM_CONNECTION: string;
    readonly TYPEORM_HOST: string;
    readonly TYPEORM_USERNAME: string;
    readonly TYPEORM_PASSWORD: string;
    readonly TYPEORM_DATABASE: string;
    readonly TYPEORM_PORT: string;
    readonly TYPEORM_LOGGING: string;
    readonly TYPEORM_ENTITIES: string;
    readonly TYPEORM_MIGRATIONS: string;
    readonly ROUTE_GLOBAL_PREFIX: string;
    readonly JWT_SECRET: string;
    readonly TWO_FACTOR_AUTHENTICATION_APP_NAME: string;
    readonly JWT_EXPIRATION_TIME: string;
  }
}
