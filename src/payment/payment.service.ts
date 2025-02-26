import { Injectable, Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMapper } from './mappers/payment.mapper';
import { CacheService } from '../common/cache/cache.service';
import { UserService } from '../user/user.service';
import { Payment } from './entities/payment.entity';
import { PaymentIntent } from './entities/payment-intent.entity';
import { RefundResult } from './entities/refund-result.entity';
import { CreatePaymentIntentInput } from './dto/create-payment-intent.dto';
import { ProcessPaymentInput } from './dto/process-payment.dto';
import { PaymentFilterInput } from './dto/payment-filter.input';
import { RefundPaymentInput } from './dto/refund-payment.dto';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentIntentStatus } from './enums/payment-intent-status.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly PAYMENT_CACHE_KEY = 'payment';
  private readonly INTENT_CACHE_KEY = 'payment_intent';

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentMapper: PaymentMapper,
    private readonly cacheService: CacheService,
    private readonly userService: UserService,
  ) {}

  /**
   * Создает новый платежный интент для инициирования платежа
   */
  async createPaymentIntent(userId: string, input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    // Проверка пользователя
    await this.userService.findById(+userId);

    // Создаем уникальный идентификатор
    const id = uuidv4();

    // Устанавливаем срок действия (24 часа)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Здесь в реальном проекте была бы интеграция с платежной системой
    // Это заглушка для примера
    const paymentUrl = `https://payment.example.com/${id}`;

    try {
      // Создаем запись в БД
      const paymentIntentData = {
        id,
        userId,
        subscriptionId: input.subscriptionId,
        tariffPlanId: input.tariffPlanId,
        amount: input.amount,
        currency: input.currency || 'USD',
        status: PaymentIntentStatus.CREATED,
        availablePaymentMethods: input.preferredPaymentMethods 
          ? JSON.stringify(input.preferredPaymentMethods) 
          : undefined,
        description: input.description,
        expiresAt,
        paymentUrl,
        returnUrl: input.returnUrl,
        metadata: JSON.stringify({
          createdAt: new Date().toISOString(),
          ipAddress: '127.0.0.1', // В реальности - IP пользователя
        }),
      };

      const prismaResult = await this.prisma.paymentIntent.create({
        data: paymentIntentData,
      });

      const result = this.paymentMapper.toPaymentIntentDomain(prismaResult);
      
      this.logger.log(`Payment intent created: ${result.id} for user ${userId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create payment intent: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create payment intent');
    }
  }

  /**
   * Обрабатывает платеж после того, как пользователь заполнил платежную форму
   */
  async processPayment(userId: string, input: ProcessPaymentInput): Promise<Payment> {
    // Проверяем существование интента
    const intent = await this.getPaymentIntent(input.paymentIntentId);
    
    // Проверяем, что интент принадлежит пользователю
    if (intent.userId !== userId) {
      throw new BadRequestException('Payment intent does not belong to this user');
    }
    
    // Проверяем статус интента
    if (intent.status !== PaymentIntentStatus.CREATED && intent.status !== PaymentIntentStatus.REQUIRES_PAYMENT_METHOD) {
      throw new BadRequestException(`Payment intent is in invalid state: ${intent.status}`);
    }
    
    // Проверяем, не истек ли срок действия
    if (new Date() > intent.expiresAt) {
      throw new BadRequestException('Payment intent has expired');
    }

    try {
      // Здесь в реальном проекте была бы интеграция с платежной системой
      // и обработка ответа от платежной системы
      
      // Обновляем статус интента
      await this.prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { status: PaymentIntentStatus.COMPLETED },
      });
      
      // Создаем запись о платеже
      const paymentData = {
        id: uuidv4(),
        userId,
        subscriptionId: intent.subscriptionId,
        tariffPlanId: intent.tariffPlanId,
        amount: intent.amount,
        currency: intent.currency,
        status: PaymentStatus.COMPLETED,
        paymentMethod: input.paymentMethod,
        externalId: `ext-${uuidv4().substring(0, 8)}`, // В реальности - ID от платежной системы
        invoiceUrl: `https://payment.example.com/invoice/${uuidv4().substring(0, 8)}`,
        receiptUrl: `https://payment.example.com/receipt/${uuidv4().substring(0, 8)}`,
        description: intent.description,
        metadata: JSON.stringify({
          paymentIntentId: intent.id,
          processedAt: new Date().toISOString(),
          paymentData: input.paymentData,
        }),
      };
      
      const prismaResult = await this.prisma.payment.create({
        data: paymentData,
      });
      
      const result = this.paymentMapper.toDomain(prismaResult);
      
      // Инвалидируем кэш
      await this.invalidateCache(userId);
      
      this.logger.log(`Payment processed successfully: ${result.id} for intent ${intent.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to process payment: ${error.message}`, error.stack);
      
      // Обновляем статус интента в случае ошибки
      await this.prisma.paymentIntent.update({
        where: { id: intent.id },
        data: { status: PaymentIntentStatus.REQUIRES_PAYMENT_METHOD },
      });
      
      throw new InternalServerErrorException('Failed to process payment');
    }
  }

  /**
   * Запрашивает возврат средств по платежу
   */
  async refundPayment(userId: string, input: RefundPaymentInput): Promise<RefundResult> {
    // Получаем платеж по ID
    const payment = await this.findById(input.paymentId);
    
    // Проверяем, что платеж принадлежит пользователю или пользователь - админ
    // В реальном проекте здесь была бы проверка на роль пользователя
    if (payment.userId !== userId) {
      throw new BadRequestException('Payment does not belong to this user');
    }
    
    // Проверяем статус платежа
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(`Cannot refund payment with status: ${payment.status}`);
    }
    
    // Определяем сумму возврата
    const refundAmount = input.fullRefund ? payment.amount : (input.amount || payment.amount);
    
    if (refundAmount <= 0 || refundAmount > payment.amount) {
      throw new BadRequestException('Invalid refund amount');
    }

    try {
      // Здесь в реальном проекте была бы интеграция с платежной системой
      // и запрос на возврат средств
      
      // Определяем новый статус платежа
      const newStatus = refundAmount === payment.amount 
        ? PaymentStatus.REFUNDED 
        : PaymentStatus.PARTIALLY_REFUNDED;
      
      // Обновляем статус платежа
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { 
          status: newStatus,
          metadata: JSON.stringify({
            ...payment.metadata,
            refundedAt: new Date().toISOString(),
            refundReason: input.reason,
            refundAmount,
          }),
        },
      });
      
      // Создаем результат возврата
      const refundResult: RefundResult = {
        id: uuidv4(),
        paymentId: payment.id,
        amount: refundAmount,
        currency: payment.currency,
        paymentStatus: newStatus,
        successful: true,
        refundId: `ref-${uuidv4().substring(0, 8)}`,
        refundReason: input.reason,
        processedAt: new Date(),
        receiptUrl: `https://payment.example.com/refund/${uuidv4().substring(0, 8)}`,
      };
      
      // Инвалидируем кэш
      await this.invalidateCache(userId);
      
      this.logger.log(`Payment refunded: ${payment.id}, amount: ${refundAmount}`);
      return refundResult;
    } catch (error) {
      this.logger.error(`Failed to refund payment: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to refund payment');
    }
  }

  /**
   * Получает информацию о платеже по ID
   */
  async findById(id: string): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID "${id}" not found`);
    }

    return this.paymentMapper.toDomain(payment);
  }

  /**
   * Получает информацию об интенте по ID
   */
  async getPaymentIntent(id: string): Promise<PaymentIntent> {
    const paymentIntent = await this.prisma.paymentIntent.findUnique({
      where: { id },
    });

    if (!paymentIntent) {
      throw new NotFoundException(`Payment intent with ID "${id}" not found`);
    }

    return this.paymentMapper.toPaymentIntentDomain(paymentIntent);
  }

  /**
   * Получает список платежей пользователя с фильтрацией
   */
  async findUserPayments(userId: string, filter?: PaymentFilterInput): Promise<Payment[]> {
    // Для простых запросов используем кэширование
    if (!filter) {
      const cacheKey = `${this.PAYMENT_CACHE_KEY}:${userId}`;
      const cached = await this.cacheService.get<Payment[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Строим условия фильтрации
    const where: any = { userId };
    
    if (filter) {
      if (filter.statuses && filter.statuses.length > 0) {
        where.status = { in: filter.statuses };
      }
      
      if (filter.paymentMethods && filter.paymentMethods.length > 0) {
        where.paymentMethod = { in: filter.paymentMethods };
      }
      
      if (filter.subscriptionId) {
        where.subscriptionId = filter.subscriptionId;
      }
      
      if (filter.tariffPlanId) {
        where.tariffPlanId = filter.tariffPlanId;
      }
      
      if (filter.dateFrom || filter.dateTo) {
        where.createdAt = {};
        
        if (filter.dateFrom) {
          where.createdAt.gte = filter.dateFrom;
        }
        
        if (filter.dateTo) {
          where.createdAt.lte = filter.dateTo;
        }
      }
      
      if (filter.searchTerm) {
        where.OR = [
          { description: { contains: filter.searchTerm, mode: 'insensitive' } },
          { externalId: { contains: filter.searchTerm, mode: 'insensitive' } },
        ];
      }
    }

    try {
      const payments = await this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      const result = this.paymentMapper.toDomainList(payments);
      
      // Кэшируем только простые запросы
      if (!filter) {
        const cacheKey = `${this.PAYMENT_CACHE_KEY}:${userId}`;
        await this.cacheService.set(cacheKey, result, this.CACHE_TTL);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch user payments: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch user payments');
    }
  }

  /**
   * Получает платежный интент пользователя
   */
  async getUserPaymentIntent(userId: string, intentId: string): Promise<PaymentIntent> {
    const intent = await this.getPaymentIntent(intentId);
    
    if (intent.userId !== userId) {
      throw new NotFoundException(`Payment intent not found`);
    }
    
    return intent;
  }

  /**
   * Инвалидирует кэш
   */
  private async invalidateCache(userId: string): Promise<void> {
    await this.cacheService.del(`${this.PAYMENT_CACHE_KEY}:${userId}`);
    await this.cacheService.del(`${this.INTENT_CACHE_KEY}:${userId}`);
  }
}