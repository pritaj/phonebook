import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${configService.get('KEYCLOAK_AUTH_URL')}/realms/${configService.get('KEYCLOAK_REALM')}/clientId/${configService.get('KEYCLOAK_CLIENT_ID')}`,
      }),
      issuer: `${configService.get('KEYCLOAK_AUTH_URL')}/realms/${configService.get('KEYCLOAK_REALM')}/clientId/${configService.get('KEYCLOAK_CLIENT_ID')}`,
      algorithms: ['RS256'],
    });
  }

  validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.preferred_username,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name,
      roles: payload.realm_access?.roles ?? [],
    };
  }
}
