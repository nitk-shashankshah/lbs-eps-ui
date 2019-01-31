import { Component, OnInit,AfterViewInit,ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UploadedFloorPlanService } from '../uploaded-floor-plan.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import * as $AB from 'jquery/dist/jquery.min.js';
import { NgxSpinnerService } from 'ngx-spinner';
import { LoggerService } from '../logger.service';
import { MatTableDataSource, throwMatDuplicatedDrawerError } from '@angular/material';
import { MatPaginator } from '@angular/material';
import { MatSort } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-roles-panel',
  templateUrl: './roles-panel.component.html',
  styleUrls: ['./roles-panel.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class RolesPanelComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = ["id","email","selectedOptions","beginEdits"];  
  
  public username:String = "";
  public allEmails=[];
  public userIdValues=[];
  public allUserRoles=[];  
  public beginEdits=[];
  public allRoleIds=[];
  public checkLink=true;
  public clickedLink="";
  public tempRow=[];
  public showLBS:boolean=false;
  public showAccounts:boolean=false;
  public showRoles:boolean=false;
  public showST:boolean=false;
  public showAdmin:boolean=false;
  private server = environment.server;
  public free=true;
  public dropdownList = [];

  public display="none";
  public displayBackDrop="none";
  public displayError="none";
  public errorMsg="";
  public isOperationSuccess=false;
  public filterVal = "";
  
  public pageSize=5;
  public totalEntries=100;
  public pageSizeOptions=[5,20,50,100];
  
  public ELEMENT_DATA: Element[] = [];
  
  dataSource = new MatTableDataSource(this.ELEMENT_DATA);

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private logger: LoggerService,
    private uploadedService : UploadedFloorPlanService) {};

  ngOnInit() {
    this.username = sessionStorage.getItem('username');

    if (!this.uploadedService.getLoggedIn()) {
      this.router.navigate(['/login']);
    }
       
    this.showLBS  = JSON.parse(this.uploadedService.getLBS());
    this.showAccounts =  JSON.parse(this.uploadedService.getAccount());
    this.showAdmin =  JSON.parse(this.uploadedService.getAdmin());
    this.showST =  JSON.parse(this.uploadedService.getST());    

    var that=this;

    this.logger.info("roles-panel.component.ts","LIST ROLES",this.username as string,new Date().toUTCString());            

    this.spinner.show();    
    this.http.post('http://'+this.server+'/listRoles.php?org_id='+this.uploadedService.getOrgId(),  JSON.stringify({}), {
      responseType: 'json'
    }).map(response => {
      var roleDict={};     
      this.logger.debug("roles-panel.component.ts","LIST ROLES SUCCESS:"+JSON.stringify(response),this.username as string,new Date().toUTCString());
      for (var each in response){
        for (var k in response[each]){                    
          roleDict[k]=response[each][k];
          //if (response[each][k]=="ADMIN")
          //   continue;
          var obj={};
          obj["id"]=k;
          obj["itemName"]=response[each][k];
          that.dropdownList.push(obj);
        }
      }            

      that.http.post('http://'+this.server+'/listUsers.php?org_id='+this.uploadedService.getOrgId(),  JSON.stringify({}), {
        responseType: 'json'
      }).map(response => {
        this.spinner.hide(); 
        var dict={};
        this.logger.debug("roles-panel.component.ts","LIST USERS SUCCESS:"+JSON.stringify(response),this.username as string,new Date().toUTCString());            

        for (var ind in response){
            if (!dict.hasOwnProperty(response[ind]["user_id"]))
               dict[response[ind]["user_id"]]={};
            
            var temp=dict[response[ind]["user_id"]];
            temp["user_name"]=response[ind]["user_name"];
            temp["email_addr"]=response[ind]["email_addr"];
             
            if (!temp.hasOwnProperty("role_id"))
               temp["role_id"]=[response[ind]["role_id"]];
            else
               temp["role_id"].push(response[ind]["role_id"]);             
            dict[response[ind]["user_id"]]=temp;
        }

        for (var k in dict){
          var opts=[];
          var itms=[];
          var roleNames=[];
          for (var each in dict[k]["role_id"]){
            var obj={};
            obj["id"]=dict[k]["role_id"][each];
            obj["itemName"]=roleDict[dict[k]["role_id"][each]];
            opts.push(dict[k]["role_id"][each]);
            roleNames.push(roleDict[dict[k]["role_id"][each]]);
            itms.push(obj);
          }

          var ele=new Object();             
          this.beginEdits.push(false);
          this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);
          ele["id"]= k;
          ele["beginEdits"]=false;
          ele["selectedOptions"]=opts;
          ele["selectedItems"]=itms;
          ele["roleNames"]=roleNames;
          ele["email"]=dict[k]["email_addr"];
          this.ELEMENT_DATA.push(ele as Element);   
          this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
                    
          this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);
          that.tempRow.push([]);
        }
      }).subscribe(response => {
        //console.log(response);
      });  
    }).subscribe(response => {
      //console.log(response);
    });

    let jQueryInstance=this;
    
    $AB(document).ready(function(){
      $AB('.first-level > a.test').on("click", function(e){
        $AB('.first-level > .dropdown-menu').hide();
      });
      
      $AB(".hamburger").off('click').on('click',function(e){
        e.preventDefault();       
        if ($AB(".panel-body").css("padding-left")=="100px"){
          $AB(".sideMenu").slideToggle(function(){
              $AB(".panel-body").css("padding-left","10px");
          });
        }
        else{              
          $AB(".panel-body").css("padding-left","100px");                
          $AB(".sideMenu").slideToggle();              
        }
      });

      $AB("#logoutBtn a").off('mouseover').on('mouseover',function(){
        $AB(".logout").show();
      });
      
      $AB(document).click(function(event) {
        if (!$(event.target).hasClass('logout')) {
             $(".logout").hide();
        }
        if (!$(event.target).hasClass('.slide-menu')) {
          $AB(".slide-menu").css('width','0px');
          $AB('.dropdown-submenu a.test').css('color','#888888');
          $AB('.dropdown-submenu a.active').css("color","#fff");    
        }
      });

      $AB('a').on('click', (e) => {
        e.preventDefault();        
        if (!$AB(e.target).hasClass('hamburger') && !$AB(e.target).hasClass('glyphicon-menu-hamburger') && !$AB(e.target).hasClass('test')) {
          if (jQueryInstance.checkLink==false){
            jQueryInstance.openModal(e.target.getAttribute('data-link')||e.target.parentNode.getAttribute('data-link'));
          }        
        }
      });
      
      $AB('.dropdown-submenu a.test').on("click", function(e){
        $AB("a.test").css("color","#888888");            
        $AB(".slide-menu").css('width','0px');  
        $AB(this).css("color","#fff");
        $AB(this).next('ul').css('width','150px');       
        e.stopPropagation();
        e.preventDefault();
      });
       
    });
  }

  onCloseHandled(){
    this.display="none";
    this.displayBackDrop="none";
  }
  
  onCloseHandledError(){
    this.displayError="none";
    this.displayBackDrop="none";
  }

  saveChanges(){
    this.onCloseHandled();
    this.beginEdits.indexOf(true)
    this.saveNewUser(this.beginEdits.indexOf(true));
  }

  continueWithoutSaving(){
    this.onCloseHandled();
    this.router.navigate([this.clickedLink]);
  }

  openModal(link){
    this.clickedLink=link;
    this.display="block";
  }
  
  showError(msg,isSuccess){
    this.errorMsg=msg;
    this.displayError="block";
    this.displayBackDrop="block";
    this.isOperationSuccess=isSuccess;
    this.spinner.hide();
  }

  validateEmail(mail)
  {
     if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
      {
        return true;
      }
        alert("You have entered an invalid email address!")
        return false;
  }
  
  onItemSelect(item:any,i){
    this.ELEMENT_DATA[i]["selectedOptions"]=[];
    for (var k in this.ELEMENT_DATA[i]["selectedItems"]){
      this.ELEMENT_DATA[i]["selectedOptions"].push(this.ELEMENT_DATA[i]["selectedItems"][k]["id"]);
    }    
    
    var dict={};
    var obj={};  
    this.free=true;
    for (var j in this.ELEMENT_DATA[i]["selectedItems"]){
      this.search('http://'+this.server+'/getRoleDetails.php?orgId='+this.uploadedService.getOrgId()+'&roleId='+this.ELEMENT_DATA[i]["selectedItems"][j]["id"],dict,obj,i,j);
    }
  }

  OnItemDeSelect(item:any,i){
    this.ELEMENT_DATA[i]["selectedOptions"]=[];
    for (var k in this.ELEMENT_DATA[i]["selectedItems"]){
      this.ELEMENT_DATA[i]["selectedOptions"].push(this.ELEMENT_DATA[i]["selectedItems"][k]["id"]);
    }    
    var dict={};
    var obj={};  
    this.free=true;        
    for (var j in this.ELEMENT_DATA[i]["selectedItems"]){
      this.search('http://'+this.server+'/getRoleDetails.php?orgId='+this.uploadedService.getOrgId()+'&roleId='+this.ELEMENT_DATA[i]["selectedItems"][j]["id"],dict,obj,i,j);
    }    
  }

  onSelectAll(items: any, i){
    this.ELEMENT_DATA[i]["selectedOptions"]=[];
    for (var k in this.ELEMENT_DATA[i]["selectedItems"]){
      this.ELEMENT_DATA[i]["selectedOptions"].push(this.ELEMENT_DATA[i]["selectedItems"][k]["id"]);
    }
    var dict={};
    var obj={};  
    this.free=true;        
    for (var j in this.ELEMENT_DATA[i]["selectedItems"]){    
      this.search('http://'+this.server+'/getRoleDetails.php?orgId='+this.uploadedService.getOrgId()+'&roleId='+this.ELEMENT_DATA[i]["selectedItems"][j]["id"],dict,obj,i,j);
    }
  }

  onDeSelectAll(items: any,i){
    console.log(items);
    this.ELEMENT_DATA[i]["selectedOptions"]=[];
  }

  saveNewUser(i){
        var that=this;
        var ele=this.ELEMENT_DATA[i];
        if (ele["email"].trim()==""){
          alert("Please provide an email Id.");
          return;
        }
    
        if (this.validateEmail(ele["email"])==false){
          return;
        }  

        if (ele["selectedOptions"].length==0){
          alert("Please select at least one role.");
          return;
        }

        if (that.free==true){
        if (ele["id"]==''){
           this.spinner.show(); 
           this.http.post('http://'+this.server+'/createUserWithPermissions.php', JSON.stringify({"user": ele["email"].split("@")[0], "emailId":ele["email"], "orgId":that.uploadedService.getOrgId()}), {
             responseType: 'json'
           }).map(response => { 
            if (response["success"]=="1") 
            {
            var obj={};
            this.logger.log("CREATE","USER", new Date().toUTCString(),ele["email"] as string,"SUCCESS",this.showAccounts,this.username as string,that.uploadedService.getRoleName() as string,"ADMIN > USERS",this.uploadedService.getOrgName() as string);
            obj["userId"]=response["admin"];
            obj["roleId"]= ele["selectedOptions"].join();            
            this.http.post('http://'+this.server+'/updateUserRole.php', JSON.stringify(obj), {
              responseType: 'json'
            }).map(resp => {         
              this.spinner.hide();                        
              if (resp["success"]=="1") {
                that.showError("User "+ele["email"]+" created successfully.",true);
                this.logger.debug("roles-panel.component.ts","CREATE USER SUCCESS",this.username as string,new Date().toUTCString());
                that.initAll();
                that.ngOnInit();
              }else{                
                that.showError(resp["error"],false);
                this.logger.error("roles-panel.component.ts","CREATE USER ERROR:"+resp["error"],this.username as string,new Date().toUTCString());                           
              }
            }).subscribe(r => {
              console.log(JSON.stringify(r));
            });
            }
            else{
              this.spinner.hide(); 
              that.showError(response["error"],false);
              this.logger.log("CREATE","USER", new Date().toUTCString(),ele["email"] as string,"FAIL",this.showAccounts,this.username as string,that.uploadedService.getRoleName() as string,"ADMIN > USERS",this.uploadedService.getOrgName() as string);
            }
           }).subscribe(res => {
             console.log(JSON.stringify(res));
           });
        }
        else {
          var obj={};
          obj["userId"]=ele["id"];                           
          obj["roleId"]= ele["selectedOptions"].join();
          this.spinner.show();                        
          this.http.post('http://'+this.server+'/updateUserRole.php', JSON.stringify(obj), {
            responseType: 'json'
          }).map(resp => {
              that.beginEdits[i]=false; 
              this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);    
              var temp={};
              temp["userId"]=ele["id"];
              temp["emailId"]=ele["email"];       
              this.http.post('http://'+this.server+'/updateUserEmail.php', JSON.stringify(temp), {
                responseType: 'json'
              }).map(op => {
                this.spinner.hide();                    
                that.showError("User "+ele["email"]+" updated successfully.",true);
                this.logger.log("UPDATE","USER", new Date().toUTCString(),ele["email"] as string,"SUCCESS",this.showAccounts,this.username as string,that.uploadedService.getRoleName() as string,"ADMIN > USERS",this.uploadedService.getOrgName() as string);
                this.logger.debug("roles-panel.component.ts","UPDATE USER SUCCESS",this.username as string,new Date().toUTCString());            
                that.initAll();
                that.ngOnInit();
              }).subscribe(r => {
                console.log(JSON.stringify(r));
              });                          
          }).subscribe(r => {
            console.log(JSON.stringify(r));
          });
        }      
      }
  }
      
  initAll(){    
    this.beginEdits=[];
    this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);        
    this.dropdownList=[];
    this.free=true;
    this.display="none";
    this.clickedLink="";
    this.ELEMENT_DATA=[];
  }
  
  applyFilter(filterValue: string){
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase(); 
    this.filterVal = filterValue;
    this.dataSource.paginator = this.paginator;  
    this.dataSource.filter = filterValue;
  }
  
  search(apiUrl,dict,obj,i,j) {
    var that=this;
    let promise = new Promise((resolve, reject) => {

      this.http.get(apiUrl)
        .toPromise()
        .then(
          response => {
            for (var each in response){
              if (dict.hasOwnProperty(response[each]["feature"])){
                  obj=dict[response[each]["feature"]];
                  for (var k in obj){
                    if (k!=response[each]["access"]){
                      if (this.free==true){                        
                        that.showError("You have a conflict in the selected roles - "+obj[k]+", "+this.ELEMENT_DATA[i]["selectedItems"][j]["itemName"]+". They both have a feature "+response[each]["feature"]+" with different access permissions.",false);
                        this.logger.warn("roles-panel.component.ts","CONFLICT IN SELECTED ROLES",this.username as string,new Date().toUTCString());            
                        that.free=false;
                      }
                    }
                  }
              }
              else{
                obj={};
                obj[response[each]["access"]]= this.ELEMENT_DATA[i]["selectedItems"][j]["itemName"];
                dict[response[each]["feature"]]=obj;
              }          
           }       
           resolve();
          },
          msg => { // Error
          reject(msg);
          }
        );
     
    });
    return promise;
  }  

  deleteUser(event,i){
    var that= this;
    var target = event.target || event.srcElement || event.currentTarget;    
    if (this.ELEMENT_DATA[i]["id"]!=''){
      this.spinner.show();
      this.http.post('http://'+this.server+'/deleteUser.php',  JSON.stringify({"user": this.ELEMENT_DATA[i]["id"]}), {
        responseType: 'json'
      }).map(resp => {
        this.spinner.hide();
        if (resp["success"]==1){
          that.showError("User "+this.ELEMENT_DATA[i]["email"]+" deleted successfully.",true);
          this.logger.log("DELETE","USER", new Date().toUTCString(),this.ELEMENT_DATA[i]["email"] as string,"SUCCESS",this.showAccounts,this.username as string,that.uploadedService.getRoleName() as string,"ADMIN > USERS",this.uploadedService.getOrgName() as string);
          that.initAll();
          that.ngOnInit();
          this.logger.debug("roles-panel.component.ts","DELETE USER SUCCESS",this.username as string,new Date().toUTCString());            
        }else{
          that.showError(resp["error"],false);
          this.logger.log("DELETE","USER", new Date().toUTCString(),this.ELEMENT_DATA[i]["email"] as string,"FAIL",this.showAccounts,this.username as string,that.uploadedService.getRoleName() as string,"ADMIN > USERS",this.uploadedService.getOrgName() as string);
          this.logger.debug("roles-panel.component.ts","DELETE USER FAILED",this.username as string,new Date().toUTCString());            
        }
      }).subscribe(response => {
        console.log(response);
      });
    }
    else {
      this.beginEdits.splice(i,1);
      this.ELEMENT_DATA.splice(i,1);
      this.tempRow.splice(i,1);
      this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);       
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.dataSource.paginator = this.paginator;  
      this.dataSource.filter = this.filterVal;
      this.dataSource.sort = this.sort;   
    }
  }

  addUser(event){
    if (this.ELEMENT_DATA[0]["id"]!=""){
    var element = new Object();
    element["id"]='';
    element["roleNames"]=[];
    element["beginEdits"]=true;      
    element["selectedOptions"]=[];
    element["selectedItems"]=[];
    
    this.tempRow.unshift([]);
    this.beginEdits.unshift(true);
    this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);      
    this.ELEMENT_DATA.unshift(element as Element);
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.paginator.firstPage();
    }
  }

  editUser(event,i){
    this.beginEdits[i]=!this.beginEdits[i];  
    this.ELEMENT_DATA[i]["beginEdits"]=!this.ELEMENT_DATA[i]["beginEdits"]; 
    this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);    
    this.tempRow[i][0]=this.ELEMENT_DATA[i]["email"];
    this.tempRow[i][1]=this.ELEMENT_DATA[i]["roleNames"];
    this.tempRow[i][2]=this.ELEMENT_DATA[i]["selectedOptions"];
   } 
  
  cancelChanges(event,i){
    this.beginEdits[i]=!this.beginEdits[i];       
    this.ELEMENT_DATA[i]["beginEdits"]=!this.ELEMENT_DATA[i]["beginEdits"]; 
    this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);    
    if (this.ELEMENT_DATA[i]["id"]==''){
      this.deleteUser(event,i);
    }
    else{
      this.ELEMENT_DATA[i]["email"]=this.tempRow[i][0];   
      this.ELEMENT_DATA[i]["roleNames"]=this.tempRow[i][1];   
      this.ELEMENT_DATA[i]["selectedOptions"]=this.tempRow[i][2];   
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.paginator.firstPage();
    }
   }

  customTrackBy(index: number, obj: any): any {
        return index;
  }

}

export interface Element {
  id:String;
  beginEdits:boolean;
  selectedOptions:Array<String>; 
  selectedItems:Array<Object>;
  email:String;    
  roleNames: Array<String>; 
}
