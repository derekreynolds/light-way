import { Request, Response, Application } from "express";

import { LightWayController } from "../controllers/lightway";

import { HueService } from '../services/hue';
import { SunriseService } from '../services/sunrise';
import { RingService } from '../services/ring';

export class LightWayRoutes {

    constructor(private ringService: RingService, private sunriseService: SunriseService, 
        private hueService: HueService) {
    }

    public lightWayController: LightWayController = new LightWayController(this.ringService, this.sunriseService, 
        this.hueService);

    public routes(app: Application): void {

        app.route('/lightway/hue')
            .get(this.lightWayController.hue);
            
        app.route('/lightway/sunrise')
            .get(this.lightWayController.sunrise);

        app.route('/lightway/reset')
            .get(this.lightWayController.reset);     
                       
    }
}