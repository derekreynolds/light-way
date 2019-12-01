import { Request, Response, Application } from "express";

import { LightWayController } from "../controllers/lightway";


export class LightWayRoutes {

	public lightWayController: LightWayController = new LightWayController();

    public routes(app: Application): void {

        app.route('/lightway/hue')
            .get(this.lightWayController.hue);
            
        app.route('/lightway/sunrise')
        	.get(this.lightWayController.sunrise);    
               
    }
}