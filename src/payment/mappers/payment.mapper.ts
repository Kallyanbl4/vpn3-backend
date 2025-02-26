import { Injectable } from '@nestjs/common';
import { Payment } from '../entities/payment.entity';
import { PaymentIntent } from '../entities/payment-intent.entity';
import { RefundResult } from '../entities/refund-result.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentIntentStatus } from '../enums/payment-intent-status.enum';
import { BillingPeriod } from '../../tariff/enums/billing-period.enum';

@Injectable()
export class PaymentMapper {
  /**
   * Преобразует Prisma модель в доменную модель Payment
   */
  toDomain(prismaPayment: any): Payment {
    const {
      id,
      userId,
      subscriptionId,
      tariffPlanId,
      amount,
      currency,
      status,
      paymentMethod,
      periodType,
      periodDays,
      externalId,
      invoiceUrl,
      receiptUrl,
      description,
      metadata,
      createdAt,
      updatedAt
    } = prismaPayment;

    const payment = new Payment();
    payment.id = id;
    payment.userId = userId;
    payment.subscriptionId = subscriptionId || undefined;
    payment.tariffPlanId = tariffPlanId || undefined;
    payment.amount = amount;
    payment.currency = currency;
    payment.status = status as PaymentStatus;
    payment.paymentMethod = paymentMethod as PaymentMethod || undefined;
    payment.periodType = periodType as BillingPeriod || undefined;
    payment.periodDays = periodDays || undefined;
    payment.externalId = externalId || undefined;
    payment.invoiceUrl = invoiceUrl || undefined;
    payment.receiptUrl = receiptUrl || undefined;
    payment.description = description || undefined;
    payment.metadata = this.parseMetadata(metadata);
    payment.createdAt = createdAt;
    payment.updatedAt = updatedAt;

    return payment;
  }

  /**
   * Преобразует Prisma модель в доменную модель PaymentIntent
   */
  toPaymentIntentDomain(prismaPaymentIntent: any): PaymentIntent {
    const {
      id,
      userId,
      subscriptionId,
      tariffPlanId,
      amount,
      currency,
      status,
      availablePaymentMethods,
      description,
      expiresAt,
      paymentUrl,
      returnUrl,
      metadata,
      createdAt
    } = prismaPaymentIntent;

    const paymentIntent = new PaymentIntent();
    paymentIntent.id = id;
    paymentIntent.userId = userId;
    paymentIntent.subscriptionId = subscriptionId || undefined;
    paymentIntent.tariffPlanId = tariffPlanId || undefined;
    paymentIntent.amount = amount;
    paymentIntent.currency = currency;
    paymentIntent.status = status as PaymentIntentStatus;
    paymentIntent.availablePaymentMethods = this.parsePaymentMethods(availablePaymentMethods);
    paymentIntent.description = description || undefined;
    paymentIntent.expiresAt = expiresAt;
    paymentIntent.paymentUrl = paymentUrl;
    paymentIntent.returnUrl = returnUrl || undefined;
    paymentIntent.metadata = this.parseMetadata(metadata);
    paymentIntent.createdAt = createdAt;

    return paymentIntent;
  }

  /**
   * Преобразует данные рефанда в доменную модель RefundResult
   */
  toRefundResultDomain(data: any): RefundResult {
    const {
      id,
      paymentId,
      amount,
      currency,
      paymentStatus,
      successful,
      refundId,
      refundReason,
      processedAt,
      receiptUrl
    } = data;

    const refundResult = new RefundResult();
    refundResult.id = id;
    refundResult.paymentId = paymentId;
    refundResult.amount = amount;
    refundResult.currency = currency;
    refundResult.paymentStatus = paymentStatus as PaymentStatus;
    refundResult.successful = successful;
    refundResult.refundId = refundId || undefined;
    refundResult.refundReason = refundReason || undefined;
    refundResult.processedAt = processedAt;
    refundResult.receiptUrl = receiptUrl || undefined;

    return refundResult;
  }

  /**
   * Преобразует доменную модель в Prisma модель для создания
   */
  toPrismaCreate(payment: Partial<Payment>): any {
    return {
      userId: payment.userId,
      subscriptionId: payment.subscriptionId,
      tariffPlanId: payment.tariffPlanId,
      amount: payment.amount,
      currency: payment.currency || 'USD',
      status: payment.status || PaymentStatus.PENDING,
      paymentMethod: payment.paymentMethod,
      periodType: payment.periodType,
      periodDays: payment.periodDays,
      externalId: payment.externalId,
      invoiceUrl: payment.invoiceUrl,
      receiptUrl: payment.receiptUrl,
      description: payment.description,
      metadata: this.stringifyMetadata(payment.metadata),
    };
  }

  /**
   * Преобразует доменную модель в Prisma модель для создания PaymentIntent
   */
  toPrismaPaymentIntentCreate(paymentIntent: Partial<PaymentIntent>): any {
    return {
      userId: paymentIntent.userId,
      subscriptionId: paymentIntent.subscriptionId,
      tariffPlanId: paymentIntent.tariffPlanId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency || 'USD',
      status: paymentIntent.status || PaymentIntentStatus.CREATED,
      availablePaymentMethods: this.stringifyPaymentMethods(paymentIntent.availablePaymentMethods),
      description: paymentIntent.description,
      expiresAt: paymentIntent.expiresAt,
      paymentUrl: paymentIntent.paymentUrl,
      returnUrl: paymentIntent.returnUrl,
      metadata: this.stringifyMetadata(paymentIntent.metadata),
    };
  }

  /**
   * Преобразует доменную модель в Prisma модель для обновления
   */
  toPrismaUpdate(payment: Partial<Payment>): any {
    const updateData: any = {};

    if (payment.status !== undefined) updateData.status = payment.status;
    if (payment.paymentMethod !== undefined) updateData.paymentMethod = payment.paymentMethod;
    if (payment.externalId !== undefined) updateData.externalId = payment.externalId;
    if (payment.invoiceUrl !== undefined) updateData.invoiceUrl = payment.invoiceUrl;
    if (payment.receiptUrl !== undefined) updateData.receiptUrl = payment.receiptUrl;
    if (payment.description !== undefined) updateData.description = payment.description;
    if (payment.metadata !== undefined) updateData.metadata = this.stringifyMetadata(payment.metadata);

    return updateData;
  }

  /**
   * Преобразует список моделей Prisma в список доменных моделей Payment
   */
  toDomainList(prismaPayments: any[]): Payment[] {
    return prismaPayments.map(payment => this.toDomain(payment));
  }

  /**
   * Преобразует список моделей Prisma в список доменных моделей PaymentIntent
   */
  toPaymentIntentDomainList(prismaPaymentIntents: any[]): PaymentIntent[] {
    return prismaPaymentIntents.map(intent => this.toPaymentIntentDomain(intent));
  }

  /**
   * Парсит метаданные из JSON
   */
  private parseMetadata(metadataJson: any): Record<string, any> | undefined {
    if (!metadataJson) return undefined;
    try {
      return typeof metadataJson === 'string' ? JSON.parse(metadataJson) : metadataJson;
    } catch (e) {
      return {};
    }
  }

  /**
   * Преобразует метаданные в JSON-строку
   */
  private stringifyMetadata(metadata: Record<string, any> | undefined): string | null {
    if (!metadata) return null;
    return JSON.stringify(metadata);
  }

  /**
   * Парсит массив методов оплаты из JSON
   */
  private parsePaymentMethods(methodsJson: any): PaymentMethod[] | undefined {
    if (!methodsJson) return undefined;
    
    try {
      const methods = typeof methodsJson === 'string' ? JSON.parse(methodsJson) : methodsJson;
      return Array.isArray(methods) ? methods.map(method => method as PaymentMethod) : undefined;
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Преобразует массив методов оплаты в JSON-строку
   */
  private stringifyPaymentMethods(methods: PaymentMethod[] | undefined): string | null {
    if (!methods || !Array.isArray(methods)) return null;
    return JSON.stringify(methods);
  }
}