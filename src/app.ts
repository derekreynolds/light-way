import * as express from "express";
import * as bodyParser from "body-parser";
import * as moment from 'moment';
import * as schedule from 'node-schedule';
import * as config from 'config'; 

import { LightWayRoutes } from './routes/lightway';
import { SunriseService } from './services/sunrise';
import { RingService } from './services/ring';
import { Sunrise } from './models/sunrise';
import * as l from "@derekreynolds/logger";
import { HueService } from './services/hue';

class App {

    public app: express.Application;    

    private sunriseService = new SunriseService();

    private hueService = new HueService();

    private ringService = new RingService(this.hueService, this.sunriseService);

    public lightWayRoutes: LightWayRoutes = new LightWayRoutes(this.ringService, this.sunriseService, this.hueService);


    constructor() {
        this.app = express();
        this.setup();   
        this.lightWayRoutes.routes(this.app);             
    }

    private setup(): void {

        l.info('Node environment: ' + config.util.getEnv('NODE_ENV'));

        // support application/json type post data
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));       
        
        this.ringService.init().then(result => {
            this.ringService.setupMotionDetection(); 
        }).catch(error => {
            l.error('Error setting up ring connetion.');
        });
         
        
    }

}

export default new App().app; 