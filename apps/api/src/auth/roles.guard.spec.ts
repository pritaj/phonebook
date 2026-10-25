import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function createContext(user?: { role?: string }): ExecutionContext {
  return {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: Reflector;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('beenged mindenkit, ha a végponton nincs szerepkör megadva', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const result = guard.canActivate(createContext({ role: 'user' }));

    expect(result).toBe(true);
  });
  it('beengedi az admin felületre, ha admin a szerepköre', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    const result = guard.canActivate(createContext({ role: 'admin' }));

    expect(result).toBe(true);
  });
  it('kizárja a sima felhasználót, ha a végponton admin szerepkör van megadva', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    const result = guard.canActivate(createContext({ role: 'user' }));

    expect(result).toBe(false);
  });
});
