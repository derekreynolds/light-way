import * as l from "@derekreynolds/logger";

import * as config from 'config';
import * as request from "request-promise-native";

export class HueService {

  private baseEndpoint: string;

  private groupEndpoint: string;


  constructor() {
    this.baseEndpoint = config.get('hue.url') + '/' + config.get('hue.user');
    this.groupEndpoint = this.baseEndpoint + `/groups`;
  }

  public getInfo(): request.RequestPromise<any> {
  
    var options = {
      uri: this.groupEndpoint,
      json: true
    };

    return request.get(options); 
  }

  /**
    * Switch on light group
    * 
  */
	public switchOnLightGroup = (groupId: number) => {    

		l.info(`Switch on group ${groupId}`);
    
    this.updateOnActionOnGroup(groupId, true);	

  }

  /**
    * Switch off light group
    * 
  */
   public switchOffLightGroup = (groupId: number) => {    

    l.info(`Switch off group ${groupId}`);
  
    this.updateOnActionOnGroup(groupId, false);	

  }


  private updateOnActionOnGroup = (groupId: number, on: boolean) => {

    var actionsEndpoint = this.groupEndpoint + `/${groupId}/action`;

    var options = {
      uri: actionsEndpoint,
      body: {
        on: on
      },
      json: true
    };

    request.put(options)
            .then((result: string) => {
              if(result)
                l.info(result)
            })
            .catch((err) => l.error(err));    
  }

}