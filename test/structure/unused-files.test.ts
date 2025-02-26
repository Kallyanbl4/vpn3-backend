// test/structure/unused-files.test.ts
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

describe('Project structure - Unused files', () => {
  // Определяем разрешенные шаблоны файлов в соответствии с архитектурой
  const allowedPatterns = [
    // Корневые файлы проекта
    /^\.eslintrc\.js$/,
    /^\.gitignore$/,
    /^\.prettierrc$/,
    /^nest-cli\.json$/,
    /^package\.json$/,
    /^package-lock\.json$/,
    /^README\.md$/,
    /^tsconfig\.json$/,
    /^tsconfig\.build\.json$/,
    /^\.env(.*)$/,
    /^jest\.config\.js$/,
  
    // Файлы сборки и зависимостей
    /^yarn\.lock$/,
    /^bun\.lock$/,
    /^pnpm-lock\.yaml$/,
    /^(.*)\.code-workspace$/,
    /^eslint\.config\.mjs$/,
    /^eslint\.config\.js$/,
  
    // Тесты
    /^test\/.*\.ts$/,           // Все тестовые файлы в test/
    /^test\/jest-e2e\.json$/,   // Конфигурация e2e тестов
  
    // Основные файлы приложения
    /^src\/main\.ts$/,
    /^src\/schema\.gql$/,
    /^src\/app\..*\.ts$/,       // Все файлы app.* (module, service, controller, resolver, spec)
  
    // Модуль Auth
    /^src\/auth\/auth\..*\.ts$/, // auth.module.ts, auth.service.ts, auth.resolver.ts
    /^src\/auth\/jwt\.strategy\.ts$/,
    /^src\/auth\/dto\/.*\.ts$/,  // Все DTO в auth/dto/
    /^src\/auth\/guards\/.*\.ts$/, // Все guards в auth/guards/
    /^src\/auth\/types\/.*\.ts$/,  // Все типы в auth/types/
  
    // Модуль User
    /^src\/user\/user\..*\.ts$/, // user.module.ts, user.service.ts, user.resolver.ts
    /^src\/user\/dto\/.*\.ts$/,  // Все DTO в user/dto/
    /^src\/user\/entities\/.*\.ts$/, // Все entities в user/entities/
    /^src\/user\/enums\/.*\.ts$/,    // Все enums в user/enums/
    /^src\/user\/mappers\/.*\.ts$/,  // Все mappers в user/mappers/
  
    // Модуль Config
    /^src\/config\/.*\.ts$/,    // Все файлы в config/
  
    // Модуль Common
    /^src\/common\/cache\/.*\.ts$/,     // Все файлы в common/cache/
    /^src\/common\/decorators\/.*\.ts$/, // Все декораторы в common/decorators/
    /^src\/common\/filters\/.*\.ts$/,    // Все фильтры в common/filters/
    /^src\/common\/exceptions\/.*\.ts$/, // Все исключения в common/exceptions/
    /^src\/common\/interceptors\/.*\.ts$/, // Все перехватчики в common/interceptors/
  
    // Модуль Prisma
    /^src\/prisma\/.*\.ts$/,    // Все файлы в prisma/
    /^prisma\/.*\.prisma$/,     // Prisma схема
    /^prisma\/migrations\/.*$/, // Все файлы миграций
  ];

  it('should not have any files outside the allowed structure', () => {
    // Получаем все файлы в проекте, исключая node_modules и dist
    const allFiles = glob.sync('**/*', {
      ignore: ['node_modules/**', 'dist/**', '.git/**', 'coverage/**'],
      nodir: true,
    });

    // Функция для проверки совпадения файла с паттерном
    const matchesAnyPattern = (file: string) => {
      return allowedPatterns.some(pattern => pattern.test(file));
    };

    // Находим файлы, не соответствующие структуре
    const unusedFiles = allFiles.filter(file => !matchesAnyPattern(file));

    // Отображаем список файлов для отладки, если тест не проходит
    if (unusedFiles.length > 0) {
      console.error('Found files that don\'t match the expected project structure:');
      unusedFiles.forEach(file => console.error(`- ${file}`));
    }

    // Проверка должна пройти только если нет лишних файлов
    expect(unusedFiles).toEqual([]);
  });
});