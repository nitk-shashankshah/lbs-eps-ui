import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import { UploadedFloorPlanService } from '../uploaded-floor-plan.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; 
import { LoggerService } from '../logger.service';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css'],
  providers: [AuthService]
})

export class UserLoginComponent implements OnInit {
  username="";
  loginMsg="";
  loginFailed=false;
  public server = environment.server;

  constructor(private authService: AuthService, private http: HttpClient, private router: Router, private uploadedService: UploadedFloorPlanService,private logger : LoggerService) {}
  
  onSubmit(form: any): void {
    var that=this;
    if (this.validateEmail(form.email)){
		  this.authService.login(form.email, form.pass).subscribe(auth => {
		    if(auth) {
          that.router.navigate(['/dashboard']);
          that.loginFailed=false;
        }else{
          that.loginMsg="Sorry, you have entered an invalid username or password!"
          that.loginFailed=true;          
        }
      });
    }
  }
  
  ngOnInit() {
    if (sessionStorage.username) {
      this.router.navigate(['/dashboard']);					    
    }
  }
  
  validateEmail(mail) 
  {
   if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    {
    return (true)
    }
    alert("You have entered an invalid email address!")
    return (false)
  }
}