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
    
    // Основные файлы приложения
    /^src\/main\.ts$/,
    /^src\/app\.module\.ts$/,
    /^src\/app\.controller\.ts$/,
    /^src\/app\.service\.ts$/,
    /^src\/app\.resolver\.ts$/,
    /^src\/app\.controller\.spec\.ts$/,
    /^src\/schema\.gql$/,
    
    // Модуль Auth
    /^src\/auth\/auth\.module\.ts$/,
    /^src\/auth\/auth\.service\.ts$/,
    /^src\/auth\/auth\.resolver\.ts$/,
    /^src\/auth\/jwt\.strategy\.ts$/,
    /^src\/auth\/dto\/(.*)\.ts$/,
    /^src\/auth\/guards\/(.*)\.ts$/,
    /^src\/auth\/types\/(.*)\.ts$/,
    
    // Модуль User
    /^src\/user\/user\.module\.ts$/,
    /^src\/user\/user\.service\.ts$/,
    /^src\/user\/user\.resolver\.ts$/,
    /^src\/user\/user\.entity\.ts$/,  // Временно сохраним
    /^src\/user\/role\.enum\.ts$/,    // Временно сохраним
    /^src\/user\/entities\/(.*)\.ts$/,
    /^src\/user\/dto\/(.*)\.ts$/,
    /^src\/user\/enums\/(.*)\.ts$/,
    /^src\/user\/mappers\/(.*)\.ts$/,
    
    // Модуль Config
    /^src\/config\/(.*)\.ts$/,
    
    // Модуль Common
    /^src\/common\/cache\/(.*)\.ts$/,
    /^src\/common\/decorators\/(.*)\.ts$/,
    /^src\/common\/filters\/(.*)\.ts$/,
    /^src\/common\/exceptions\/(.*)\.ts$/,
    /^src\/common\/interceptors\/(.*)\.ts$/,
    
    // Модуль Prisma
    /^src\/prisma\/(.*)\.ts$/,
    /^prisma\/(.*)\.prisma$/,
    /^prisma\/migrations\/(.*)$/,
    
    // Тесты
    /^test\/(.*)\.ts$/,
    /^test\/jest-e2e\.json$/,
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