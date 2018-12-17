import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'app-user-logout',
  templateUrl: './user-logout.component.html',
  styleUrls: ['./user-logout.component.css'],
  providers: [AuthService]
})

export class UserLogoutComponent implements OnInit {

  public username:String="";
  
  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.logout();
    this.username="";
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

}