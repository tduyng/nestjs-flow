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
    readonly AWS_REGION: string;
    readonly AWS_ACCESS_KEY_ID: string;
    readonly AWS_SECRET_ACCESS_KEY: string;
    readonly AWS_PUBLIC_BUCKET_NAME: string;
    readonly AWS_PRIVATE_BUCKET_NAME: string;
    readonly ELASTICSEARCH_NODE: string;
    readonly ELASTICSEARCH_USERNAME: string;
    readonly ELASTICSEARCH_PASSWORD: string;
    readonly JWT_REFRESH_TOKEN_SECRET: string;
    readonly JWT_REFRESH_TOKEN_EXPIRATION_TIME: string;
    readonly RABBITMQ_USER: string;
    readonly RABBITMQ_PASSWORD: string;
    readonly RABBITMQ_HOST: string;
    readonly RABBITMQ_QUEUE_NAME: string;
    readonly GRPC_CONNECTION_URL: string;
    readonly REDIS_HOST: string;
    readonly REDIS_PORT: string;
  }
}
