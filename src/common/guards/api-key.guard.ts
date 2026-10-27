import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API Key inválida o no proporcionada');
    }

    const apiKeysConfig = this.configService.get<string>('API_KEYS', '');
    const validKeys = apiKeysConfig
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (!validKeys.includes(apiKey as string)) {
      throw new UnauthorizedException('API Key inválida o no proporcionada');
    }

    return true;
  }
}
