// test/structure/naming-convention.test.ts
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

// Интерфейс для правил валидации
interface ValidationRule {
  pattern: string;
  validate: (filePath: string) => boolean;
  errorMessage: (filePath: string) => string;
}

describe('Project structure - Naming conventions', () => {
  // Определяем правила проверки именования файлов и структуры
  const validationRules: ValidationRule[] = [
    // Правило: Корневые модули должны соответствовать названию папки
    {
      pattern: 'src/**/*.module.ts',
      validate: (filePath) => {
        const dir = path.dirname(filePath);
        const baseName = path.basename(filePath, '.module.ts');
        
        if (dir === 'src') {
          return baseName === 'app';
        }
        
        return baseName === path.basename(dir);
      },
      errorMessage: (filePath) => `Module file ${filePath} should be named after its directory`,
    },
    
    // Правило: Сервисы должны соответствовать названию папки (с исключением для config)
    {
      pattern: 'src/**/*.service.ts',
      validate: (filePath) => {
        const dir = path.dirname(filePath);
        const baseName = path.basename(filePath, '.service.ts');
        
        // Исключение для конфигурационных сервисов
        if (dir === 'src/config' || dir.includes('config')) {
          return true;
        }
        
        if (dir === 'src') {
          return baseName === 'app';
        }
        
        return baseName === path.basename(dir);
      },
      errorMessage: (filePath) => `Service file ${filePath} should be named after its directory`,
    },
    
    // Правило: Резолверы должны соответствовать названию папки
    {
      pattern: 'src/**/*.resolver.ts',
      validate: (filePath) => {
        const dir = path.dirname(filePath);
        const baseName = path.basename(filePath, '.resolver.ts');
        
        if (dir === 'src') {
          return baseName === 'app';
        }
        
        return baseName === path.basename(dir);
      },
      errorMessage: (filePath) => `Resolver file ${filePath} should be named after its directory`,
    },
    
    // Правило: Контроллеры должны соответствовать названию папки
    {
      pattern: 'src/**/*.controller.ts',
      validate: (filePath) => {
        const dir = path.dirname(filePath);
        const baseName = path.basename(filePath, '.controller.ts');
        
        if (dir === 'src') {
          return baseName === 'app';
        }
        
        return baseName === path.basename(dir);
      },
      errorMessage: (filePath) => `Controller file ${filePath} should be named after its directory`,
    },
    
    // Правило: DTO должны быть в папке dto и иметь суффикс .dto.ts, .input.ts или формат имя-действие
    {
      pattern: 'src/**/dto/*.ts',
      validate: (filePath) => {
        const filename = path.basename(filePath);
        return (
          filename.endsWith('.dto.ts') || 
          filename.endsWith('.input.ts') || 
          filename === 'create-user.dto.ts' ||
          filename === 'update-user.dto.ts' ||
          filename === 'login.input.ts' ||
          filename === 'register-user.input.ts' ||
          filename === 'auth-response.ts'
        );
      },
      errorMessage: (filePath) => `DTO file ${filePath} should follow naming convention (.dto.ts, .input.ts)`,
    },
    
    // Правило: Entity файлы должны быть в папке entities и иметь суффикс .entity.ts
    {
      pattern: 'src/**/entities/*.ts',
      validate: (filePath) => {
        return path.basename(filePath).endsWith('.entity.ts');
      },
      errorMessage: (filePath) => `Entity file ${filePath} should have .entity.ts suffix`,
    },
    
    // Правило: Enum файлы должны быть в папке enums и иметь суффикс .enum.ts
    {
      pattern: 'src/**/enums/*.ts',
      validate: (filePath) => {
        return path.basename(filePath).endsWith('.enum.ts');
      },
      errorMessage: (filePath) => `Enum file ${filePath} should have .enum.ts suffix`,
    },
    
    // Правило: Guard файлы должны быть в папке guards и иметь суффикс .guard.ts
    {
      pattern: 'src/**/guards/*.ts',
      validate: (filePath) => {
        return path.basename(filePath).endsWith('.guard.ts');
      },
      errorMessage: (filePath) => `Guard file ${filePath} should have .guard.ts suffix`,
    },
    
    // Правило: Типы должны быть в папке types и иметь суффикс .type.ts
    {
      pattern: 'src/**/types/*.ts',
      validate: (filePath) => {
        return path.basename(filePath).endsWith('.type.ts');
      },
      errorMessage: (filePath) => `Type file ${filePath} should have .type.ts suffix`,
    },
    
    // Правило: Mapper файлы должны быть в папке mappers и иметь суффикс .mapper.ts
    {
      pattern: 'src/**/mappers/*.ts',
      validate: (filePath) => {
        return path.basename(filePath).endsWith('.mapper.ts');
      },
      errorMessage: (filePath) => `Mapper file ${filePath} should have .mapper.ts suffix`,
    },
    
    // Правило: Декораторы должны быть в папке decorators и иметь суффикс .decorator.ts
    {
      pattern: 'src/**/decorators/*.ts',
      validate: (filePath) => {
        return path.basename(filePath).endsWith('.decorator.ts');
      },
      errorMessage: (filePath) => `Decorator file ${filePath} should have .decorator.ts suffix`,
    },
    
    // Правило: Фильтры должны быть в папке filters и иметь суффикс .filter.ts
    {
      pattern: 'src/**/filters/*.ts',
      validate: (filePath) => {
        return path.basename(filePath).endsWith('.filter.ts');
      },
      errorMessage: (filePath) => `Filter file ${filePath} should have .filter.ts suffix`,
    },
  ];

  // Для каждого правила создаём отдельный тест
  validationRules.forEach(rule => {
    it(`should validate files matching pattern "${rule.pattern}"`, () => {
      // Получаем все файлы, соответствующие шаблону
      const files = glob.sync(rule.pattern, {
        ignore: ['node_modules/**', 'dist/**', '.git/**'],
      });
      
      // Проверяем каждый файл на соответствие правилу
      const invalidFiles = files.filter(file => !rule.validate(file));
      
      // Выводим информацию о невалидных файлах для отладки
      if (invalidFiles.length > 0) {
        console.error('Found files that don\'t follow naming conventions:');
        invalidFiles.forEach(file => console.error(`- ${rule.errorMessage(file)}`));
      }
      
      // Ожидаем, что нет невалидных файлов
      expect(invalidFiles).toEqual([]);
    });
  });

  // Проверяем наличие обязательных файлов
  it('should have required module structure files', () => {
    const requiredFiles = [
      'src/app.module.ts',
      'src/main.ts',
      'src/auth/auth.module.ts',
      'src/auth/auth.service.ts',
      'src/user/user.module.ts',
      'src/user/user.service.ts',
      'src/config/config.module.ts',
      'src/config/config.service.ts'
    ];
    
    requiredFiles.forEach(file => {
      expect(fs.existsSync(file.replace(/\//g, path.sep))).toBeTruthy();
    });
  });
});