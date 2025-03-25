import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  get isProduction() {
    return environment.production;
  }

  get appVersion() {
    return environment.appVersion;
  }

  get apiEndpoint() {
    return environment.apiEndpoint;
  }

  get timeout() {
    return environment.timeout;
  }
}
