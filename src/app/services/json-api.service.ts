
import {map} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JsonApiModel, JsonApiDatastore } from '@michalkotas/angular2-jsonapi';
import { DatastoreService } from 'app/services/datastore.service';

export type ModelType<T extends JsonApiModel> = new(datastore: JsonApiDatastore, data: any) => T;

export interface JsonApiParams {
  page?: {
    size?: number,
    number?: number
  };

  sort?: string;

  [str: string]: any;
}

export interface JsonApiResponse<T extends JsonApiModel> {
  data: T[];
  meta: {
    total_items: number
  };
}

@Injectable()
export class JsonApiService<T extends JsonApiModel> {

  public model: ModelType<T>;
  protected datastoreService: DatastoreService;
  protected http: HttpClient;

  private getUrl(params: JsonApiParams): string {
    const baseUrl: string = Reflect.getMetadata('JsonApiDatastoreConfig', this.datastoreService.constructor).baseUrl;
    const typeName: string = Reflect.getMetadata('JsonApiModelConfig', this.model).type;
    return [baseUrl, typeName, (params ? '?' : ''), this.toQueryString(params)].join('');
  }

  private toQueryString(params: any) {
    let encodedStr = '';
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        if (encodedStr && encodedStr[encodedStr.length - 1] !== '&') {
          encodedStr = encodedStr + '&';
        }
        const value: any = params[key];
        if (value instanceof Array) {
          for (const item of value) {
            encodedStr = encodedStr + key + '=' + encodeURIComponent(item) + '&';
          }
        } else if (typeof value === 'object') {
          for (const innerKey in value) {
            if (Object.prototype.hasOwnProperty.call(value, innerKey)) {
              encodedStr = encodedStr + key + '[' + innerKey + ']=' + encodeURIComponent(value[innerKey]) + '&';
            }
          }
        } else {
          encodedStr = encodedStr + key + '=' + encodeURIComponent(value);
        }
      }
    }
    if (encodedStr[encodedStr.length - 1] === '&') {
      encodedStr = encodedStr.substr(0, encodedStr.length - 1);
    }
    return encodedStr;
  }

  public get(params: JsonApiParams): Promise<JsonApiResponse<T>> {
    const url = this.getUrl(params);

    return this.http.get(url).pipe(
      map((body: any) => {
        const models: T[] = [];

        body.data.forEach(data => {
          const model: T = new this.model(this.datastoreService, data);
          this.datastoreService.addToStore(model);

          if (body.included) {
            model.syncRelationships(data, body.included);
            this.datastoreService.addToStore(model);
          }

          models.push(model);
        });

        return {
          data: models,
          meta: body.meta
        };
      }))
      .toPromise();
  }

}
