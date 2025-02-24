import { Resolver, Query } from '@nestjs/graphql';  

/**
 * Резолвер для обработки GraphQL-запросов.
 */
@Resolver()
export class AppResolver {
  /**
   * Возвращает приветственное сообщение для проверки GraphQL.
   * @returns {string} Приветственное сообщение
   */
  @Query(() => String)
  getHello(): string {
    return 'Hello, GraphQL!';
  }
}