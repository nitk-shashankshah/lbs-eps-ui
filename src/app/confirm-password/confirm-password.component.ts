import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment'; 

@Component({
  selector: 'app-confirm-password',
  templateUrl: './confirm-password.component.html',
  styleUrls: ['./confirm-password.component.css']
})
export class ConfirmPasswordComponent implements OnInit {
  public output="";
  public q="";  
  public username="";
  public server = environment.server;
  constructor(private http: HttpClient,private activatedRoute: ActivatedRoute) {
      this.activatedRoute.queryParams.subscribe(params => {
            this.q = params['q'];
            this.username = params['email'];
            console.log(this.q); // Print the parameter to the console. 
        });
  }
  
  onSubmit(form: any): void {
    var obj={};    
    obj["email"] =	this.username;
    obj["password"] =	form.password;
    obj["confirmpassword"] =	form.confirmpassword;
    obj["q"] = this.q;
    var that=this;
    
    if (obj["password"]=="")
       alert("Please enter your password."); 
       
    if (obj["password"]==obj["confirmpassword"]){     
		  this.http.post('http://'+this.server+'/reset.php',JSON.stringify(obj), {
			responseType: 'text'
		  }).map(response => {
      that.output="&nbsp;&nbsp;&nbsp;&nbsp;"+response +"<br><br>&nbsp;&nbsp;&nbsp; <a routerLink='/login'>Login again</a>";
     
		  }).subscribe(response => {
      console.log(response);
      });
    }
    else {
      alert("Your passwords do not match.");
    }
  }

  ngOnInit() {
    if (sessionStorage.getItem('username'))
      this.username = sessionStorage.getItem('username');

    sessionStorage.removeItem('showAdmin');
    sessionStorage.removeItem('showLBS');
    sessionStorage.removeItem('showST');
    sessionStorage.removeItem('showAccounts');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('orgId');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('totalLogins');
    sessionStorage.removeItem('group');
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