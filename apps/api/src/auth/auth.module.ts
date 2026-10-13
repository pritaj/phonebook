import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { KeycloakStrategy } from './keycloak.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [KeycloakStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
