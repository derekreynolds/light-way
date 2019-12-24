import * as l from "@derekreynolds/logger";

import { RingApi } from "ring-client-api";

import * as r from "request-promise-native";

import * as config from 'config';

import * as path from 'path'

import * as moment from 'moment';


export class RingService {

  private ringApi: any;

  constructor() {       
  }

  public init(): Promise<boolean> {

    return new Promise<boolean>(async(resolve, reject) => {
      var token = config.get('ring.token');
     
      try {
        this.ringApi = new RingApi({
          refreshToken: 'eyJhbGciOiJIUzUxMiIsImprdSI6Ii9vYXV0aC9pbnRlcm5hbC9qd2tzIiwia2lkIjoiZGVmYXVsdCIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NzcxMjczNTYsInJlZnJlc2hfY2lkIjoicmluZ19vZmZpY2lhbF9hbmRyb2lkIiwicmVmcmVzaF9zY29wZXMiOlsiY2xpZW50Il0sInJlZnJlc2hfdXNlcl9pZCI6OTkxMDkyMywicm5kIjoiWWRhSVRxeUt3U2ZXaGciLCJ0eXBlIjoicmVmcmVzaC10b2tlbiJ9.qfrCfhdXQd76U5K61VL9VbMlXWtCBPxy9VYOQfeLBJvxQlDx4_jMTAa4u8biUu4N_96ET9hz4M2CvfScZb7ZKw',
          cameraDingsPollingSeconds: 2,
          debug: true
      })
        resolve(true);
      } catch ( e ) {
          console.error( e )
          console.error('We couldn\'t create the API instance. This might be because ring.com changed their API again' );
          console.error('or maybe your password is wrong, in any case, sorry can\'t help you today. Bye!' );
          reject(false);
      }
    });

  }

  public registerMotionCallback(callback: (activity: any) => any) {
    this.ringApi.getCameras().then((data: any) => {
      data[0].onMotionDetected.subscribe((isMotion : Boolean) => {  
        l.info("Motion detected at " + new Date());      
        callback(isMotion);
      })
    });
  } 
  
  public registerRingCallback(callback: () => any) {
    this.ringApi.getCameras().then((data: any) => {
      data[0].onDoorbellPressed.subscribe(() => {  
        let now = moment();
        l.info("Button pressed at " + now.format()); 
        data[0].recordToFile(path.join('/app', now.format('YYYY-MM-D-HH:mm:ss') + '.mp4'), 10).then((result: any) => {
          l.info("Recording " + new Date());  
        }).catch((err: any) => {
          console.log('Error:', err.message);
        });  
        callback();
      })
    });
  }

}