import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class UploadedFloorPlanService {
  fl:String;
  loggedIn:Boolean=false;
  accessPoints: String[]=[];
  username: String = "";
  user: String="";
  group: String = "";
  floorPlanName: String="";
  orgId: Number=null;
  coordinateMapping={};
  lastLogin: String="";
  totalLogins: Number;
  showLBS:boolean=false;
  allowConf:boolean=false;
  showAccounts:boolean=false;
  showST:boolean=false;
  showAdmin:boolean=false;
  showRoles:boolean=false;

  constructor() {     
  }
  
  getOrgId(): String {
    //return this.orgId;
    return sessionStorage.getItem('orgId');
  }
 
  setOrgId(x): void {
    this.orgId=x;
    sessionStorage.setItem('orgId',x);
    return;      
  }
  
  getUser(): String {
    return sessionStorage.getItem('user');
    //return this.user;
  }
 
  setUser(x): void {
    this.user=x;         
    sessionStorage.setItem('user',x);
    return;      
  }
 
  getTotalLogins(): Number {
    //return this.totalLogins;
    return parseInt(sessionStorage.getItem('totalLogins'));
  }
 
  setTotalLogins(x): void {
    this.totalLogins=x;         
    sessionStorage.setItem('totalLogins',x);
    return;      
  }
  
  getLastLogin(): String {
    //return this.lastLogin;
    return sessionStorage.getItem('lastLogin');
  }
 
  setLastLogin(x): void {
    this.lastLogin=x;         
    sessionStorage.setItem('lastLogin',x);    
    return;      
  }

  getGroup(): String {
    return sessionStorage.getItem('group');
  }
 
  setGroup(x): void {
    this.group=x;         
    sessionStorage.setItem('group',x);
    return;      
  }

  getFileContent(): String {
    return this.fl;
  }
 
  setFileContent(x): void {
    this.fl=x;         
    return;      
  }
  
  setAccessPointsLocation(ap): void{
    this.accessPoints=ap;
  }

  getAccessPointsLocation(): String[] {
    return this.accessPoints;
  }

  saveCoordinates(ap): void{
    this.coordinateMapping=ap;
  }

  getCoordinates(): {} {
    return this.coordinateMapping;
  }

  setLoggedIn(logIn): void {    
    this.loggedIn=logIn;
  }

  getLoggedIn(): Boolean {
    if (sessionStorage.username) {
        this.username = sessionStorage.getItem('username');
        return true;
    }    
  }

  getLBS(){
		return sessionStorage.getItem('showLBS');
	}

  setShowLBS(x){    
    sessionStorage.setItem('showLBS',x);
  }
  
	getAdmin(){
		return sessionStorage.getItem('showAdmin');
	}
  
  setShowAdmin(x){    
    sessionStorage.setItem('showAdmin',x);
  }
  
	getST(){
		return sessionStorage.getItem('showST');
  }
  
  setShowST(x){    
    sessionStorage.setItem('showST',x);
	}

	getAccount(){    
    return sessionStorage.getItem('showAccounts');
  }

  setShowAccounts(x){
    sessionStorage.setItem('showAccounts',x);
  }

  getRoles(){
    return sessionStorage.getItem('showRoles');
  }
  setRoles(x){
    sessionStorage.setItem('showRoles',x);
  }

  getAllowConf(){
    return sessionStorage.getItem('allowConf');
  }

  setAllowConf(x){
    this.allowConf=x;
    sessionStorage.setItem('allowConf',x);
  }
}
