import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment'; 
import { LoggerService } from '../logger.service';
import { FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';
import { UploadedFloorPlanService } from '../uploaded-floor-plan.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-password',
  templateUrl: './confirm-password.component.html',
  styleUrls: ['./confirm-password.component.css']
})
export class ConfirmPasswordComponent implements OnInit {
  public output="";
  public q="";  
  public username="";
  public matched=true;
  public success=false;
  public server = environment.server;
  validatingForm: FormGroup;

  constructor(private http: HttpClient, private router: Router,private activatedRoute: ActivatedRoute,private uploadedService : UploadedFloorPlanService,private logger : LoggerService, private fb: FormBuilder) {
      this.activatedRoute.queryParams.subscribe(params => {
            this.q = params['q'];
            this.username = params['email'];
            console.log(this.q); // Print the parameter to the console. 
      });
      this.validatingForm = fb.group({
        'password': [null,Validators.required],
        'confirmPassword': [null,Validators.required]
      });
  }
  
  onSubmit(form: any): void {
    var obj={};    
    obj["email"] =	this.username;
    obj["password"] =	form.password;
    obj["confirmpassword"] =	form.confirmPassword;
    obj["q"] = ((this.q)?this.q:"");
    var that=this;
          
    if (obj["password"]==obj["confirmpassword"]){ 
      this.matched=true;
		  this.http.post('http://'+this.server+'/reset.php',JSON.stringify(obj), {
			responseType: 'text'
		  }).map(response => {      
      that.output=response;
      if (that.output.indexOf("success")>0){
         that.logger.log("RESET PASSWORD","CHANGE PASSWORD", new Date().toUTCString(),"#####","SUCCESS",JSON.parse(this.uploadedService.getAccount()),this.username as string,that.uploadedService.getRoleName() as string,"LOGIN > CHANGE PASSWORD",this.uploadedService.getOrgName() as string);
         that.success=true;
      }
      else{
         that.logger.log("RESET PASSWORD","CHANGE PASSWORD", new Date().toUTCString(),"#####","FAIL",JSON.parse(this.uploadedService.getAccount()),this.username as string,that.uploadedService.getRoleName() as string,"LOGIN > CHANGE PASSWORD",this.uploadedService.getOrgName() as string);
         that.success=false;
      }
		  }).subscribe(response => {
      console.log(response);
      });
    }
    else {
      this.matched=false;
      that.logger.log("RESET PASSWORD","CHANGE PASSWORD", new Date().toUTCString(),"#####","FAIL",JSON.parse(this.uploadedService.getAccount()),this.username as string,that.uploadedService.getRoleName() as string,"LOGIN > CHANGE PASSWORD",this.uploadedService.getOrgName() as string);     
    }
  }

  ngOnInit() {
    if (sessionStorage.getItem('username'))
      this.username = sessionStorage.getItem('username');
    
    if (!this.uploadedService.getLoggedIn()) {
       this.router.navigate(['/login']);  
    }

    sessionStorage.removeItem('showAdmin');
    sessionStorage.removeItem('showLBS');
    sessionStorage.removeItem('showST');
    sessionStorage.removeItem('showAccounts');
    sessionStorage.removeItem('showRoles');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('orgId');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('totalLogins');
    sessionStorage.removeItem('group');
    sessionStorage.removeItem('roleName');
    sessionStorage.removeItem('orgName');
    sessionStorage.removeItem('allowConf');
    sessionStorage.clear();
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
