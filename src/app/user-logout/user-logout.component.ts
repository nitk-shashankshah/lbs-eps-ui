import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import {Observable} from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import { LoggerService } from '../logger.service';
import { environment } from '../../environments/environment'; 
import {UploadedFloorPlanService} from '../uploaded-floor-plan.service';

@Component({
  selector: 'app-user-logout',
  templateUrl: './user-logout.component.html',
  styleUrls: ['./user-logout.component.css'],
  providers: [AuthService]
})

export class UserLogoutComponent implements OnInit {

  public username:String="";
  
  public server = environment.server;

  constructor(private authService: AuthService,   private http: HttpClient, private router: Router,  private uploadedService: UploadedFloorPlanService,private logger : LoggerService) { }

  ngOnInit() {    

    var url='http://'+this.server+'/'+environment.rbacRoot+'/logout.php';    

    this.http.post(url, null, {
      responseType: 'json'
    }).map(response => {      
      this.logger.log("LOGOUT","LOGOUT", new Date().toUTCString(),sessionStorage.getItem('username') as string,"SUCCESS",JSON.parse(this.uploadedService.getAccount()) as boolean,sessionStorage.getItem('username') as string,this.uploadedService.getRoleName() as string,"LOGOUT",this.uploadedService.getOrgName() as string);
      
      this.uploadedService.setLoggedIn(false);				
      sessionStorage.removeItem('showAdmin');
      sessionStorage.removeItem('showLBS');
      sessionStorage.removeItem('showST');
      sessionStorage.removeItem('showRoles');
      sessionStorage.removeItem('showAccounts');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('orgId');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('totalLogins');
      sessionStorage.removeItem('group');
      sessionStorage.removeItem('roleName');
      sessionStorage.removeItem('orgName');
      sessionStorage.removeItem('allowConf');
      sessionStorage.clear();
    }).subscribe(response => {
      console.log(response);
    });
  
   
  }

}