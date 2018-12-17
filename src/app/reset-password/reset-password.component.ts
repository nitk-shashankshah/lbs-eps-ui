import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; 

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  public isReset:number=1;
  constructor(private http: HttpClient) {}
  public server = environment.server;
  resetLink(){    
    this.isReset=1;
  }
  onSubmit(form: any): void {
		var obj={};
    obj["email"] =	form.email;
    if (this.validateEmail(form.email)){
      var that=this;          
	  	this.http.post('http://'+this.server+'/change.php',JSON.stringify(obj), {
			responseType: 'text'
	  	}).map(response => {        
				if(response== "1") {
          that.isReset=2;
				} else {					
					that.isReset=3;
				}
	   	}).subscribe(response => {
       console.log(response);
      });
    }
  }

  ngOnInit() {

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
