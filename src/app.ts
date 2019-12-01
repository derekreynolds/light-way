import * as express from "express";
import * as bodyParser from "body-parser";
import * as moment from 'moment';
import * as config from 'config'; 

import { LightWayRoutes } from './routes/lightway';
import { SunriseService } from './services/sunrise';
import { RingService } from './services/ring';
import { Sunrise } from './models/sunrise';
import * as l from "@derekreynolds/logger";
import * as schedule from 'node-schedule';
import { HueService } from './services/hue';

class App {

    public app: express.Application;

    public lightWayRoutes: LightWayRoutes = new LightWayRoutes();

    private ringService = new RingService();

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
        
        var sunriseService = new SunriseService();

        var sunrise: Sunrise;

        schedule.scheduleJob({hour: 0, minute: 0}, () => {
            l.info("Getting Sunrise for today");
            sunriseService.getSunrise(config.get('sunrise.latitude'), config.get('sunrise.longitude')).then((result) => {
                l.info(`Sunset ${result.results.sunset}`); 
                l.info(`Sunrise ${result.results.sunrise}`);          
                sunrise = new Sunrise(moment(result.results.sunrise), moment(result.results.sunset));
            }).catch((e) => {
                l.error(e);
            });
        });
        
        sunriseService.getSunrise(config.get('sunrise.latitude'), config.get('sunrise.longitude')).then((result) => { 
            var m = moment(); 
            l.info(`Sunset ${result.results.sunset}`); 
            l.info(`Sunrise ${result.results.sunrise}`);     
            sunrise = new Sunrise(moment(result.results.sunrise), moment(result.results.sunset));
        }).catch((e) => {
            l.error(e);
        });        

        this.ringService.init().then(() => {
            this.ringService.registerActivityCallback((activity: any) => {
                // If is nighttime, switch on the lights
                if(moment().isBetween(sunrise.sunset, sunrise.sunrise.add(1, 'days'), 'minute')) {
                    if(activity.motion) {
                        var hueService = new HueService();
                        var groups = config.get<Array<number>>('hue.groups');

                        groups.forEach(group => hueService.switchOnLightGroup(group));
                        var duration = config.get<number>('hue.duration') * 60 * 1000;
                        let startTime = new Date(Date.now() + duration);
                        let endTime = new Date(startTime.getTime() + 1000);
                        schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, () => {
                            groups.forEach(group => hueService.switchOffLightGroup(group));
                        });                    
                    }

                }
            });
        }).catch((e) => {
            l.error(e);
        });            

        
     }


}

export default new App().app; 