import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http';
import { UploadedFloorPlanService } from './uploaded-floor-plan.service';
import { Observable, of } from 'rxjs';
import { environment } from '../environments/environment'; 

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
@Injectable({
  providedIn: 'root'
})

export class AuthService {
	
	constructor(private http: HttpClient, private uploadedFloorPlanService: UploadedFloorPlanService) {};
	auth: boolean = false;	
	public showLBS:boolean=false;
	public showAccounts:boolean=false;
	public showST:boolean=false;
	public showAdmin:boolean=false;
    server = environment.server;
	username= "";
	
	login(e: string, p: string): Observable<boolean> {
		var obj={};
		obj["email"]=e;
		obj["password"]=p;
		var that=this;

		console.log(JSON.stringify(obj));

		return this.http.post('http://'+that.server+'/auth.php',JSON.stringify(obj), {
			responseType: 'json'
		}).map(response => {
				if (response["auth"] == "1") {
					that.uploadedFloorPlanService.setLoggedIn(true);					
					that.uploadedFloorPlanService.setOrgId(response["org"]);
					that.uploadedFloorPlanService.setGroup("");
					that.uploadedFloorPlanService.setUser(response["user"]);
					that.uploadedFloorPlanService.setLastLogin(response["last_activity"]);
					that.uploadedFloorPlanService.setTotalLogins(response["counter"]);					
					sessionStorage.setItem("username",e);
					return true;					  					  
				} else {
					sessionStorage.removeItem("username");					
					return false;
				}
			}).catch(() => {
				sessionStorage.removeItem("username");
				    return Observable.of(false);
			});
	}

	logout(): void {
		var that =this;
		sessionStorage.removeItem("username");
		this.uploadedFloorPlanService.setLoggedIn(false);				
	}		
}