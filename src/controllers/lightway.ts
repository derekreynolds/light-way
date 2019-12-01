import * as l from "@derekreynolds/logger";

import * as r from "request-promise-native";

import * as config from 'config';

import { Request, Response } from 'express';
import { SunriseService } from "../services/sunrise";
import { HueService } from "../services/hue";


export class LightWayController {

 /**
  * Find an LightWay Hue info
  * 
  * @param request
  * @param response
  */
	public hue = (request: Request, response: Response) => {    

    l.info(`Getting Hue info`);
    
    var hueService = new HueService();

    hueService.getInfo().then()
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
    
    var sunriseService = new SunriseService();

    sunriseService.getSunrise(config.get('sunrise.latitude'), config.get('sunrise.longitude'))
            .then((result) => {response.status(200).json(result)});  
		
  }

}