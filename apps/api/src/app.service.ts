import { Injectable } from '@nestjs/common';
import process from 'process';

@Injectable()
export class AppService {
  getVersion(): string {
    return `OK, ${process.env.npm_package_version ?? 'Aucune version trouvée'}`;
  }
}
