import * as l from "@derekreynolds/logger";

import { RingApi } from "ring-client-api";
import * as schedule from 'node-schedule';
import * as config from 'config';

import { SunriseService } from './sunrise';
import { HueService } from './hue';
import { Sunrise } from '../models/sunrise';
import * as moment from 'moment';


export class RingService {

  private ringApi: any;

  private doorbell: any;

  constructor(private hueService: HueService, private sunriseService: SunriseService) {       
  }

  public init(): Promise<Boolean> {
     return new Promise<Boolean>(async(resolve, reject) => {    
       try {
          this.ringApi = new RingApi({
            refreshToken: config.get('ring.token'),
            cameraDingsPollingSeconds: 2,
            debug: true
          });
  
          this.ringApi.getCameras().then((data: any) => {
            this.doorbell = data[0];
            resolve(true);
          });
        
        } catch ( e ) {
            console.error( e )
            console.error('We couldn\'t create the API instance. This might be because ring.com changed their API again' );
            console.error('or maybe your token is wrong!' );
            reject(false);
        }
     }); 
  }

  public setupMotionDetection(): void {    
    this.doorbell.onMotionDetected.subscribe((isMotion : Boolean) => {  
      l.info("Motion detected at " + new Date()); 
      if(isMotion) { 
        this.switchOnLights();
      }    
    });   
  } 

  private switchOnLights() :void {
    this.sunriseService.getSunrise(config.get('sunrise.latitude'), config.get('sunrise.longitude')).then((result) => { 
      var m = moment(); 
      l.info(`Sunset ${result.results.sunset}`); 
      l.info(`Sunrise ${result.results.sunrise}`);
      l.info(`Current time ${m.format()}`);      
      const sunrise = new Sunrise(moment(result.results.sunrise), moment(result.results.sunset));      
      if(m.isBetween(sunrise.sunset, sunrise.sunrise.add(1, 'days'))) {                              
        var groups = config.get<Array<number>>('hue.groups');
        groups.forEach(group => this.hueService.switchOnLightGroup(group));
        var duration = config.get<number>('hue.duration');
        l.info(`Duration ${duration}`); 
        let endTime = m.add(duration, 'm');
        schedule.scheduleJob(endTime.toDate(), () => {
            groups.forEach(group => this.hueService.switchOffLightGroup(group));
        });                    
    }
      
    }).catch((e) => {
        l.error(e);
    });
  }
  
}