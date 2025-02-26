// src/config/config.validation.ts
import * as Joi from 'joi';

/**
 * Environment variables interface
 */
export interface EnvironmentVariables {
  // Application
  NODE_ENV: string;
  PORT: number;
  APP_NAME?: string;
  APP_URL?: string;
  API_PREFIX?: string;
  CORS_ORIGINS?: string;
  
  // JWT Authentication
  JWT_SECRET: string;
  JWT_EXPIRES_IN?: string;
  
  // Redis Cache
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_TTL?: number;
  
  // GraphQL
  GRAPHQL_PLAYGROUND?: boolean;
  
  // Application Specific
  VPN_SERVER_HOST?: string;
  WELCOME_MESSAGE?: string;
}

/**
 * Validates the environment variables using Joi
 * @param config The environment variables to validate
 * @returns The validated environment variables
 * @throws Error if the environment variables are invalid
 */
export function validateConfig(config: Record<string, unknown>): EnvironmentVariables {
  const schema = Joi.object({
    // Application
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number().default(3000),
    APP_NAME: Joi.string().default('NestJS Application'),
    APP_URL: Joi.string().uri().optional(),
    API_PREFIX: Joi.string().default('api'),
    CORS_ORIGINS: Joi.string().optional(),
    
    // JWT Authentication
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRES_IN: Joi.string().default('1h'),
    
    // Redis Cache
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_PASSWORD: Joi.string().optional().allow(''),
    REDIS_TTL: Joi.number().default(300),
    
    // GraphQL
    GRAPHQL_PLAYGROUND: Joi.boolean().default(false),
    
    // Application Specific
    VPN_SERVER_HOST: Joi.string().optional(),
    WELCOME_MESSAGE: Joi.string().optional(),
  });

  const { error, value } = schema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });

  if (error) {
    const errorMessage = `Config validation error: ${error.message}`;
    throw new Error(errorMessage);
  }

  return value as EnvironmentVariables;
}