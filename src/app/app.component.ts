import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {AuthService} from './auth.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']  
})

export class AppComponent implements OnInit {
  title = 'Ruckus Network Services';
  public username: string = "";

  constructor(private http: HttpClient, private authService: AuthService) {};	
  ngOnInit(){
    if (localStorage.username){
       this.username=localStorage.getItem('username');                 
    }
 
  }
}