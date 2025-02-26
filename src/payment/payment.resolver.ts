import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../user/enums/role.enum';
import { User } from '../user/entities/user.entity';
import { Payment } from './entities/payment.entity';
import { PaymentIntent } from './entities/payment-intent.entity';
import { RefundResult } from './entities/refund-result.entity';
import { CreatePaymentIntentInput } from './dto/create-payment-intent.dto';
import { ProcessPaymentInput } from './dto/process-payment.dto';
import { PaymentFilterInput } from './dto/payment-filter.input';
import { RefundPaymentInput } from './dto/refund-payment.dto';

@Resolver()
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Получение списка платежей пользователя
   */
  @Query(() => [Payment], { name: 'userPayments', description: 'Get user payments with filtering' })
  @UseGuards(GqlAuthGuard)
  async getUserPayments(
    @CurrentUser() user: User,
    @Args('filter', { nullable: true }) filter?: PaymentFilterInput,
  ): Promise<Payment[]> {
    return this.paymentService.findUserPayments(String(user.id), filter);
  }

  /**
   * Получение информации о конкретном платеже
   */
  @Query(() => Payment, { name: 'payment', description: 'Get payment by ID' })
  @UseGuards(GqlAuthGuard)
  async getPayment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Payment> {
    const payment = await this.paymentService.findById(id);
    
    // Проверяем, что платеж принадлежит пользователю или пользователь - админ
    if (payment.userId !== String(user.id) && !user.roles.includes(Role.Admin)) {
      throw new Error('Access denied');
    }
    
    return payment;
  }

  /**
   * Получение информации о платежном интенте
   */
  @Query(() => PaymentIntent, { name: 'paymentIntent', description: 'Get payment intent by ID' })
  @UseGuards(GqlAuthGuard)
  async getPaymentIntent(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<PaymentIntent> {
    return this.paymentService.getUserPaymentIntent(String(user.id), id);
  }

  /**
   * Создание платежного интента
   */
  @Mutation(() => PaymentIntent, { name: 'createPaymentIntent', description: 'Create a new payment intent' })
  @UseGuards(GqlAuthGuard)
  async createPaymentIntent(
    @Args('input') input: CreatePaymentIntentInput,
    @CurrentUser() user: User,
  ): Promise<PaymentIntent> {
    return this.paymentService.createPaymentIntent(String(user.id), input);
  }

  /**
   * Обработка платежа
   */
  @Mutation(() => Payment, { name: 'processPayment', description: 'Process a payment with payment intent' })
  @UseGuards(GqlAuthGuard)
  async processPayment(
    @Args('input') input: ProcessPaymentInput,
    @CurrentUser() user: User,
  ): Promise<Payment> {
    return this.paymentService.processPayment(String(user.id), input);
  }

  /**
   * Запрос на возврат средств
   */
  @Mutation(() => RefundResult, { name: 'refundPayment', description: 'Request a refund for a payment' })
  @UseGuards(GqlAuthGuard)
  async refundPayment(
    @Args('input') input: RefundPaymentInput,
    @CurrentUser() user: User,
  ): Promise<RefundResult> {
    return this.paymentService.refundPayment(String(user.id), input);
  }

  /**
   * Административный доступ к платежам всех пользователей (только для админов)
   */
  @Query(() => [Payment], { name: 'adminPayments', description: 'Admin access to all payments (Admin only)' })
  @UseGuards(GqlAuthGuard, RoleGuard)
  @Roles(Role.Admin)
  async getAdminPayments(
    @Args('userId', { type: () => ID, nullable: true }) userId?: string,
    @Args('filter', { nullable: true }) filter?: PaymentFilterInput,
  ): Promise<Payment[]> {
    if (userId) {
      return this.paymentService.findUserPayments(userId, filter);
    }
    
    // В реальном проекте здесь был бы более сложный запрос для админа
    // с дополнительными параметрами фильтрации и пагинацией
    throw new Error('Admin access to all payments not implemented yet');
  }
}