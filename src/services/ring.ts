import * as l from "@derekreynolds/logger";

import * as ring from "ring-api";

import * as r from "request-promise-native";

import * as config from 'config';


export class RingService {

  private ringApi: any;

  constructor() {       
  }

  public init(): Promise<boolean> {

    return new Promise<boolean>(async(resolve, reject) => {
        var username = config.get('ring.username');
        var password = config.get('ring.password');
        
        try {
            this.ringApi = await ring({
                email: username,
                password: password,
                poll: true,        
            });
            resolve(true);
        } catch ( e ) {
            console.error( e )
            console.error('We couldn\'t create the API instance. This might be because ring.com changed their API again' );
            console.error('or maybe your password is wrong, in any case, sorry can\'t help you today. Bye!' );
            reject(false);
        }
    });

  }

  public registerActivityCallback(callback: (activity: any) => any) {
   
        this.ringApi.events.on('activity', callback);
  }
}