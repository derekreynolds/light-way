import * as l from "@derekreynolds/logger";

import * as r from "request-promise-native";

import * as moment from 'moment';
import * as schedule from 'node-schedule';
import * as config from 'config';

import { Request, Response } from 'express';
import { SunriseService } from '../services/sunrise';
import { HueService } from '../services/hue';
import { RingService } from '../services/ring';

import { Sunrise } from '../models/sunrise';

export class LightWayController {

  constructor(private ringService: RingService, private sunriseService: SunriseService, 
    private hueService: HueService) {
  
  }

 /**
  * Find an LightWay Hue info
  * 
  * @param request
  * @param response
  */
	public hue = (request: Request, response: Response) => {    

    l.info(`Getting Hue info`);

    this.hueService.getInfo().then()
      .then((result) => {response.status(200).json(result)});    
		
  }

  /**
  * Find an LightWay Sunrise info
  * 
  * @param request
  * @param response
  */
	public sunrise = (request: Request, response: Response) => {    

    l.info(`Getting Sunrise info`);

    this.sunriseService.getSunrise(config.get('sunrise.latitude'), config.get('sunrise.longitude'))
            .then((result) => {response.status(200).json(result)});  
		
  }

    /**
  * Find an LightWay Sunrise info
  * 
  * @param request
  * @param response
  */
	public reset = (request: Request, response: Response) => {    

    l.info(`Resetting Lightway`);

    var sunrise: Sunrise;

    schedule.scheduleJob({hour: 12, minute: 0}, () => {
        l.info("Getting Sunrise for today");
        this.sunriseService.getSunrise(config.get('sunrise.latitude'), config.get('sunrise.longitude')).then((result) => {
            l.info(`Sunset ${result.results.sunset}`); 
            l.info(`Sunrise ${result.results.sunrise}`);          
            sunrise = new Sunrise(moment(result.results.sunrise), moment(result.results.sunset));
        }).catch((e) => {
            l.error(e);
        });
    });
    
    this.sunriseService.getSunrise(config.get('sunrise.latitude'), config.get('sunrise.longitude')).then((result) => { 
        var m = moment(); 
        l.info(`Sunset ${result.results.sunset}`); 
        l.info(`Sunrise ${result.results.sunrise}`);     
        sunrise = new Sunrise(moment(result.results.sunrise), moment(result.results.sunset));
    }).catch((e) => {
        l.error(e);
    }); 

    this.ringService.init().then(() => {
      this.ringService.registerMotionCallback((activity: any) => {
          // If is nighttime, switch on the lights
          if(moment().isBetween(sunrise.sunset, sunrise.sunrise.add(1, 'days'))) {
              if(activity.motion) {
                 
                  var groups = config.get<Array<number>>('hue.groups');

                  groups.forEach(group => this.hueService.switchOnLightGroup(group));
                  var duration = config.get<number>('hue.duration') * 60 * 1000;
                  let startTime = new Date(Date.now() + duration);
                  let endTime = new Date(startTime.getTime() + 2000);
                  schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, () => {
                      groups.forEach(group => this.hueService.switchOffLightGroup(group));
                  });                    
              }

          }         
      });
      response.status(200).json("SUCCESS");
    }).catch((e) => {
      response.status(501).json("ERROR")
      l.error(e);
    });
		
  }

}