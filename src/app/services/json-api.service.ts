import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { JsonApiModel, JsonApiDatastore } from 'angular2-jsonapi';
import { DatastoreService } from 'app/services/datastore.service';

// tslint:disable-next-line:interface-over-type-literal
export type ModelType<T extends JsonApiModel> = { new(datastore: JsonApiDatastore, data: any): T; };

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
  protected http: Http;

  private getUrl(params: JsonApiParams): string {
    const baseUrl: string = Reflect.getMetadata('JsonApiDatastoreConfig', this.datastoreService.constructor).baseUrl;
    const typeName: string = Reflect.getMetadata('JsonApiModelConfig', this.model).type;
    return [baseUrl, typeName, (params ? '?' : ''), this.toQueryString(params)].join('');
  }

  private toQueryString(params: any) {
    let encodedStr = '';
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        if (encodedStr && encodedStr[encodedStr.length - 1] !== '&') {
          encodedStr = encodedStr + '&';
        }
        const value: any = params[key];
        if (value instanceof Array) {
          for (let i = 0; i < value.length; i++) {
            encodedStr = encodedStr + key + '=' + encodeURIComponent(value[i]) + '&';
          }
        } else if (typeof value === 'object') {
          for (const innerKey in value) {
            if (value.hasOwnProperty(innerKey)) {
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

    return this.http.get(url)
      .map(res => {
        const body = res.json();
        const models: T[] = [];

        body.data.forEach(data => {
          const model: T = new this.model(this.datastoreService, data);
          this.datastoreService.addToStore(model);

          if (body.included) {
            model.syncRelationships(data, body.included, 0);
            this.datastoreService.addToStore(model);
          }

          models.push(model);
        });

        return {
          data: models,
          meta: body.meta
        };
      })
      .toPromise();
  }

}
