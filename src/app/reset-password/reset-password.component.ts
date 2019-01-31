import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; 
import { LoggerService } from '../logger.service';
import { UploadedFloorPlanService } from '../uploaded-floor-plan.service';
import { FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})

export class ResetPasswordComponent implements OnInit {
  public isReset:number=1;
  validatingForm: FormGroup;

  constructor(private http: HttpClient, private spinner: NgxSpinnerService, private uploadedService: UploadedFloorPlanService,private logger : LoggerService,private fb: FormBuilder) {
    this.validatingForm = fb.group({
      'email': [null,[Validators.required, Validators.email]],  
    });
  }

  public server = environment.server;
  
  resetLink(){
    this.isReset=1;
  }
 
  onSubmit(form: any): void {
		var obj={};
    obj["email"] =	form.email;
    var that=this;          

    if (form.email==null){
      this.isReset=0;
      return;
    }
    this.spinner.show();

    this.logger.debug("reset-password.component.ts","RESET "+form.email+" PASSWORD",form.email as string,new Date().toUTCString());   
    
  	this.http.post('http://'+this.server+'/'+environment.rbacRoot+'/change.php',JSON.stringify(obj), {
		   responseType: 'text'
  	}).map(response => {
        this.spinner.hide();        
				if(response== "1") {
          that.isReset=2;
          that.logger.log("RESET PASSWORD","CHANGE PASSWORD", new Date().toUTCString(),"#####","SUCCESS",JSON.parse(this.uploadedService.getAccount()),form.email as string,that.uploadedService.getRoleName() as string,"LOGIN > CHANGE PASSWORD",this.uploadedService.getOrgName() as string);     
          this.logger.debug("reset-password.component.ts","RESET "+form.email+" PASSWORD SUCCESS",form.email as string,new Date().toUTCString());   
				} else {					
          that.isReset=3;
          that.logger.log("RESET PASSWORD","CHANGE PASSWORD", new Date().toUTCString(),"#####","FAIL",JSON.parse(this.uploadedService.getAccount()),form.email as string,that.uploadedService.getRoleName() as string,"LOGIN > CHANGE PASSWORD",this.uploadedService.getOrgName() as string);
          this.logger.error("reset-password.component.ts","RESET "+form.email+" PASSWORD FAILED",form.email as string,new Date().toUTCString());   
				}
   	}).subscribe(response => {
       console.log(response);
    });    
  }
  ngOnInit() {

  }
}
