import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  log(
    username: string,
    action: string,
    entityType: string,
    entityId: number | null,
    details: string | null = null,
  ) {
    return this.auditRepository.save({
      username,
      action,
      entityType,
      entityId,
      details,
    });
  }

  findAll() {
    return this.auditRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}
