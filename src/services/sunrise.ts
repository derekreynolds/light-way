import * as l from "@derekreynolds/logger";

import * as request from "request-promise-native";

import * as config from 'config';

export class SunriseService {

  private baseEndpoint: string;

  constructor() {
    this.baseEndpoint = config.get('sunrise.url');
  }


  public getSunrise(lat: number, lon: number) : request.RequestPromise<any> {

    var locationEndpoint = this.baseEndpoint + `/json?lat=${lat}&lng=${lon}&formatted=0`;

    l.info(locationEndpoint);

    var options = {
        uri: locationEndpoint,
        json: true
    };

    return request.get(options);

  }

}