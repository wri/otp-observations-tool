import { IWebWorkerService } from 'angular2-web-worker';
import { WebWorkerService as service } from 'angular2-web-worker';

export class WebWorkerService extends service implements IWebWorkerService {

  run<T>(workerFunction: (postMessage: (message: T) => void, any) => void, data?: any): Promise<T> {
    return super.run(workerFunction, data);
  }

  runUrl(url: string, data?: any): Promise<any> {
    return super.runUrl(url, data);
  }

  terminate<T>(promise: Promise<T>): Promise<T> {
    return super.terminate(promise);
  }

  // We override the method to enable postMessage to be called whenever we want
  // This allows us to asynchronously trigger postMessage
  private createWorkerUrl(resolve: Function): string {
    const resolveString = resolve.toString();
    // The change is here: postMessage is passed as argument
    const webWorkerTemplate = `
        self.addEventListener('message', function(e) {
            (${resolveString})(postMessage, e.data);
        });
    `;
    const blob = new Blob([webWorkerTemplate], { type: 'text/javascript' });
    return URL.createObjectURL(blob);
  }
}
