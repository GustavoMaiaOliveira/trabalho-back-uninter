import { AppDataSource } from '../data-source';
import { AuditLog } from '../entities/AuditLog';

export class AuditService {
  static async log(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: object;
    ipAddress: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      const repo = AppDataSource.getRepository(AuditLog);
      const entry = repo.create({
        user: params.userId ? ({ id: params.userId } as any) : undefined,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
      await repo.save(entry);
    } catch {
      console.error('[Audit] Falha ao registrar log de auditoria');
    }
  }
}
