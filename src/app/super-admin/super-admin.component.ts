import { Component, NgModule,  OnInit, AfterViewInit,ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UploadedFloorPlanService } from '../uploaded-floor-plan.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; 
import * as $AB from 'jquery/dist/jquery.min.js';

import { MatTableDataSource, throwMatDuplicatedDrawerError } from '@angular/material';
import { MatPaginator } from '@angular/material';
import { MatSort } from '@angular/material';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-super-admin',
  templateUrl: './super-admin.component.html',
  styleUrls: ['./super-admin.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})

export class SuperAdminComponent implements OnInit  {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns = ["id","org","admin","selectedOptions","showGroups","beginEdits","isSuperUser"];  
  
  public ELEMENT_DATA: Element[] = [];
  dataSource = new MatTableDataSource(this.ELEMENT_DATA);
  model: any = {
    onColor: 'primary',
    offColor: 'secondary',
    onText: 'GRANTED',
    offText: 'DISABLED',
    disabled: true,
    size: '',
    value: true
  };
  public username:String = ""; 
  public all={};
  
  public selectedOptions=[];
  public checkLink = true;
  public currentOrganization;
  public currentIndex=0;
  public tempRow=[];
  public roleInfo=[];
  public beginEdits=[];
  public grps=[];            
  public clickedLink="";
  public beginGroupEdits=[];
  public allOrgs=[];
  public allOrgIds=[];
  public allOrgRoles={};
  public allOrgAdmins=[];
  public tempGrpEntry="";
  public showLBS:boolean=false;
  public showAccounts:boolean=false;
  public showST:boolean=false;
  public showAdmin:boolean=false;
  public filterVal="";
  public pageSize=5;
  public totalEntries=100;
  public pageSizeOptions=[5,20,50,100];
  
  public display="none";
  public displayBackDrop="none";
  public displayError="none";
  public errorMsg="";
  public isOperationSuccess=false;

  public server = environment.server;
  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private http: HttpClient,   
    private spinner: NgxSpinnerService,
    private uploadedService : UploadedFloorPlanService ) { };
    
    ngAfterViewInit() {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    
   ngOnInit() {
    this.username = sessionStorage.getItem('username');
  
    if (!this.uploadedService.getLoggedIn()) {
      this.router.navigate(['/login']);  
    }    
    
    this.dropdownList = [];
  
    this.http.post('http://'+this.server+'/listFeatures.php',  JSON.stringify({}), {
      responseType: 'json'
    }).map(response => {
       for (var each in response){
         var obj={};
         if (response[each]!="ADMIN" && response[each]!="SUPER USER"){
            obj["id"]=response[each];
            obj["itemName"]=response[each];
            this.dropdownList.push(obj);          
         }
       }
    }).subscribe(response => {
      console.log(response);
    });
  
    this.selectedItems = [       
    ];
    
    this.dropdownSettings = { 
          singleSelection: false,
          text:"Select Features",
          selectAllText:'Select All',
          unSelectAllText:'UnSelect All',
          enableSearchFilter: true,
          classes:"myclass custom-class"
    };
    
    if (!this.uploadedService.getLoggedIn()) {
      this.router.navigate(['/login']);  
    }
       
    this.showLBS  = JSON.parse(this.uploadedService.getLBS());
    this.showAccounts =  JSON.parse(this.uploadedService.getAccount());
    this.showAdmin =  JSON.parse(this.uploadedService.getAdmin());
    this.showST =  JSON.parse(this.uploadedService.getST());
    this.ELEMENT_DATA=[];    
    
    var that=this;
    this.spinner.show();
    this.http.post('http://'+this.server+'/listOrganizations.php',  JSON.stringify({}), {
      responseType: 'json'
    }).map(response => {
      this.spinner.hide();
      for (var k in response){
        if (response[k]["name"]=="Ruckus Wireless")
           continue;
        if (that.allOrgIds.indexOf(response[k]["id"])<0){
          that.allOrgs.push(response[k]["name"]);
          that.allOrgIds.push(response[k]["id"]);          
          that.allOrgAdmins.push(response[k]["admin"]);
        }
        if (!that.allOrgRoles.hasOwnProperty(response[k]["id"]))
          that.allOrgRoles[response[k]["id"]]=[];
        if (response[k]["feature"].toUpperCase()!="ADMIN")
          that.allOrgRoles[response[k]["id"]].push(response[k]["feature"]);                            
      }
      this.totalEntries = that.allOrgIds.length;
      for (var each in that.allOrgIds){
        var temp=[];
        var opts=[];
        var isSuperUser=false;
        for (var k in that.allOrgRoles[that.allOrgIds[each]]){
          if (that.allOrgRoles[that.allOrgIds[each]][k]!="SUPER USER"){
           var obj={};
           obj["id"]=that.allOrgRoles[that.allOrgIds[each]][k];
           obj["itemName"]=that.allOrgRoles[that.allOrgIds[each]][k];
           temp.push(obj);                     
           opts.push(that.allOrgRoles[that.allOrgIds[each]][k]);
          }
          else
             isSuperUser=true;             
        }
        
        var ele=new Object();
        if (opts.indexOf("SUBSCRIBER TRACING")>=0){
          ele["showGroups"]=true;
        }
        else{
          ele["showGroups"]=false;
        }
         
        this.beginEdits.push(false);
        this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);
        this.grps.push([]);
        this.tempRow.push([]);

        ele["id"]=that.allOrgIds[each];
        ele["isSuperUser"]=isSuperUser;  
        ele["beginEdits"]=false;
        ele["selectedOptions"]=opts;
        ele["selectedItems"]=temp;
        ele["org"]=that.allOrgs[each];
        ele["grps"]=[];
        ele["admin"]=that.allOrgAdmins[each];
        this.ELEMENT_DATA.push(ele as Element);
      }
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }).subscribe(response => {
      console.log(response);
    });

    let jQueryInstance=this;
    
    $AB(document).ready(function(){

      $AB("#logoutBtn a").off('mouseover').on('mouseover',function(){
        $AB(".logout").show();
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

      $AB(document).click(function(event){
        if (!$AB(event.target).hasClass('logout')) {
          $AB(".logout").hide();
        }
        if (!$AB(event.target).hasClass('.slide-menu')) {
          $AB(".slide-menu").hide();
        }
      });

      $AB('.first-level > a.test').on("click", function(e){
        $AB('.first-level > .dropdown-menu').hide();
      });     
      
      $AB('a').on('click', (e) => {
        e.preventDefault();        
        if (!$AB(e.target).hasClass('hamburger')) {
          if (jQueryInstance.checkLink==false){           
             jQueryInstance.openModal(e.target.getAttribute('data-link')||e.target.parentNode.getAttribute('data-link'));
          }
        }
      });

      $AB('.dropdown-submenu a.test').on("click", function(e){
        $AB("a.test").css("color","#888888");              
        $AB(this).css("color","#fff");
        $AB(this).next('ul').toggle();              
        e.stopPropagation();
        e.preventDefault();
      });     
      
    });

  }

  applyFilter(filterValue: string){
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase(); 
    this.filterVal = filterValue;
    this.dataSource.paginator = this.paginator;  
    this.dataSource.filter = filterValue;
    this.dataSource.sort = this.sort;
  }

  onItemSelect(item:any,i){    
    this.ELEMENT_DATA[i]["selectedOptions"]=[];
    for (var k in this.ELEMENT_DATA[i]["selectedItems"]){
       if (this.ELEMENT_DATA[i]["selectedItems"][k]["id"]=="SUPER USER")
          continue;
       else
          this.ELEMENT_DATA[i]["selectedOptions"].push(this.ELEMENT_DATA[i]["selectedItems"][k]["id"]);
    }
    this.ELEMENT_DATA[i]["showGroups"]=false;
    if (this.ELEMENT_DATA[i]["selectedOptions"].indexOf("SUBSCRIBER TRACING")>=0)
       this.ELEMENT_DATA[i]["showGroups"]=true;
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;  
    this.dataSource.filter = this.filterVal;
    this.dataSource.sort = this.sort;
  }

  OnItemDeSelect(item:any,i){    
    this.ELEMENT_DATA[i]["selectedOptions"]=[];
    for (var k in this.ELEMENT_DATA[i]["selectedItems"]){
      this.ELEMENT_DATA[i]["selectedOptions"].push(this.ELEMENT_DATA[i]["selectedItems"][k]["id"]);
    }    
    this.ELEMENT_DATA[i]["showGroups"]=false;
    if (this.ELEMENT_DATA[i]["selectedOptions"].indexOf("SUBSCRIBER TRACING")>=0)
      this.ELEMENT_DATA[i]["showGroups"]=true;
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;
    this.dataSource.filter = this.filterVal;
    this.dataSource.sort = this.sort;
  }

  onSelectAll(items: any, i){    
    this.ELEMENT_DATA[i]["selectedOptions"]=[];
    for (var k in this.ELEMENT_DATA[i]["selectedItems"]){
      this.ELEMENT_DATA[i]["selectedOptions"].push(this.ELEMENT_DATA[i]["selectedItems"][k]["id"]);
    }
    this.ELEMENT_DATA[i]["showGroups"]=true;    
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;   
    this.dataSource.filter = this.filterVal; 
    this.dataSource.sort = this.sort;
  }

  onDeSelectAll(items: any,i){
    this.ELEMENT_DATA[i]["selectedOptions"]=[];
    this.ELEMENT_DATA[i]["showGroups"]=false;    
    this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
    this.dataSource.paginator = this.paginator;    
    this.dataSource.filter = this.filterVal;
    this.dataSource.sort = this.sort;
  }

  saveChanges(){
    this.onCloseHandled();
    var element = this.ELEMENT_DATA[this.beginEdits.indexOf(true)];
    this.saveOrg(element);
  }

  continueWithoutSaving(){
    this.onCloseHandled();
    this.router.navigate([this.clickedLink]);
  }

  openModal(link){
    this.clickedLink=link;
    this.display="block";
    this.displayBackDrop="block";
  }
  
  showError(msg,isSuccess){
    this.errorMsg=msg;
    this.displayError="block";
    this.displayBackDrop="block";
    this.isOperationSuccess=isSuccess;
    this.spinner.hide();
  }

  onCloseHandled(){
    this.display="none";
    this.displayBackDrop="none";
  }
  
  onCloseHandledError(){
    this.displayError="none";
    this.displayBackDrop="none";
  }

  viewGroups(orgId,i){
    var that=this;
    this.currentIndex=i;    
    this.currentOrganization=orgId;
    that.grps[i]=[];
    that.beginGroupEdits=[];
    this.http.post('http://'+this.server+'/listGroups.php?org_id='+orgId,  JSON.stringify({}), {
      responseType: 'json'
    }).map(response => {                
        for (var each in response){               
          that.grps[i]=response[each];                            
        }            
        for (var each in that.grps[i]){
          that.beginGroupEdits.push(false);
        }
    }).subscribe(response => {
      console.log(response);
    });    
  }

  viewNewGroups(i){
    this.beginGroupEdits=[];    
    this.currentIndex=i;        
  }

  initAll(){
    this.roleInfo=[];
    this.allOrgs=[];    
    this.allOrgIds=[];        
    this.allOrgRoles=[];
    this.allOrgAdmins=[];
    this.beginEdits=[];
    this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);
    this.grps=[];
    this.clickedLink="";
  }

  addOrganization(event){
    if (this.allOrgIds.indexOf('')<0){
      this.allOrgIds.push('');
      this.beginEdits.push(true);
      this.grps.push([]);
      this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);      
      var ele =new Object();
      ele["id"]='';
      ele["isSuperUser"]=false;  
      ele["beginEdits"]=true;
      ele["selectedOptions"]=[];
      ele["selectedItems"]=[];
      ele["org"]='';
      ele["grps"]=[];
      ele["admin"]='';
      ele["showGroups"]=false;
      this.ELEMENT_DATA.push(ele as Element);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.paginator.lastPage();
    }
  }

  deleteOrg(event,count){
    var that=this;
    var ele = this.ELEMENT_DATA[count];
    
    if (ele["id"]=="") {
      this.ELEMENT_DATA.splice(count,1);
      this.allOrgIds.splice(count,1);
      this.beginEdits.splice(count,1);   
      this.grps.splice(count,1);
      this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    else {
      var sure = confirm("Are you sure you want to delete this organization and all associated users?");    
      if (sure==true)
      {
      this.spinner.show();          
      this.http.post('http://'+this.server+'/deleteOrganization.php', JSON.stringify({"id":that.allOrgIds[count]}), {
       responseType: 'json'
      }).map(response => {
       this.spinner.hide();
       if (response["success"]==1){
         that.showError("Organization deleted successfully.",true);
         that.initAll();
         that.ngOnInit();
       }else{
         that.showError(response["error"],false);
       }
      }).subscribe(response => {
       console.log(JSON.stringify(response));
      });
      }
    }
  }

  deleteGroupEntry(event,i){
    var that=this;
    if (this.beginGroupEdits[i]==false){     
     this.spinner.show();
     this.http.post('http://'+this.server+'/deleteGroup.php', JSON.stringify({"orgId":that.currentOrganization, "group":that.grps[this.currentIndex][i]}), {
      responseType: 'json'
     }).map(response => {
      this.spinner.hide();
      if (response["success"]=="1") {
        that.viewGroups(that.currentOrganization,that.currentIndex);
        console.log(response);     
      }else{
        alert(response["error"]);
      }
     }).subscribe(response => {
      console.log(JSON.stringify(response));
     });
    } else {
      that.grps[this.currentIndex].splice(i,1);
      that.beginGroupEdits.splice(i,1);
    }
  }

  cancelGroupEntryChanges(event,i){    
    this.beginGroupEdits[i]=!this.beginGroupEdits[i];   
    if (!this.grps[i]){
      this.deleteGroupEntry(event,i);
    }
    else{
      this.grps[i]=this.tempGrpEntry;   
    }
  }

  saveGroupEntry(i){
    var that=this;  
    this.spinner.show();
    this.http.post('http://'+this.server+'/createGroup.php', JSON.stringify({"orgId":that.currentOrganization, "group": this.grps[this.currentIndex][i]}), {
      responseType: 'json'
    }).map(response => {
      this.spinner.hide();
      if (response["success"]==1){
        that.viewGroups(that.currentOrganization,that.currentIndex);
      }
      else{        
        alert(response["error"]);
        console.log(response);           
      }
    }).subscribe(response => {
      console.log(JSON.stringify(response));
    });  
 }
  
  editGroupEntry(event,i){
    this.beginGroupEdits[i]=!this.beginGroupEdits[i];
    this.tempGrpEntry=this.grps[i];
  } 

  addGroupEntry(event){
    this.grps[this.currentIndex].push(''); 
    this.beginGroupEdits.push(true);
  }
  
  editOrg(event,i){     
     this.ELEMENT_DATA[i]["beginEdits"]=!this.ELEMENT_DATA[i]["beginEdits"];   
     this.beginEdits[i]=!this.beginEdits[i];
     var element = this.ELEMENT_DATA[i];
     this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);
     this.tempRow[i]=[];
     this.tempRow[i].push(element["id"]);
     this.tempRow[i].push(element["admin"]);
     this.tempRow[i].push(element["selectedOptions"]);
  }

  cancelChanges(event,i){         
    this.ELEMENT_DATA[i]["beginEdits"]=!this.ELEMENT_DATA[i]["beginEdits"];
    this.beginEdits[i]=!this.beginEdits[i];      
    this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);
    if (!this.allOrgIds[i]){
      this.deleteOrg(event,i);
    }
    else {
      this.ELEMENT_DATA[i]["id"]=this.tempRow[i][0];      
      this.ELEMENT_DATA[i]["admin"]=this.tempRow[i][1];
      this.ELEMENT_DATA[i]["selectedOptions"]=this.tempRow[i][2];
    }    
  }
  
  resetPassword(event,adminId){
    if (confirm("Are you sure you want to reset the password for "+adminId+"?")==true){
    var obj={};
    obj["email"] = adminId;
    this.spinner.show();
	  this.http.post('http://'+this.server+'/super_reset.php',JSON.stringify(obj), {
			responseType: 'json'
	  }).map(response => {
      this.spinner.hide();           
       if (response["success"]==1)
          alert("The password has been successfully reset to \"ruckus\" for "+adminId);
       else
          alert("The password could not be reset.");
	  }).subscribe(response => {
      console.log(response);
    });
    }
  }

  validateEmail(mail)
  {
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
      {
        return true;
      }     
      return false;
  }

  saveOrg(element){      
    var org="";
    var that=this;
          
    var count = this.ELEMENT_DATA.indexOf(element);

    org=element["org"];    

    if (element["id"]=="" && this.allOrgs.indexOf(org)>=0){
      alert("The tenant "+org+" already exists. Please provide a different name.");
      return;
    }

    if (org.trim()==""){
      alert("Please provide a name for the organization");
      return;
    }

    if (element["selectedOptions"].length==0){
      alert("Please select at least one feature to create an organization");
      return;
    }

    element["selectedOptions"].push('ADMIN');

    var features = element["selectedOptions"].join(); 
    
    var adminName =element["admin"];    
    
    if (adminName.trim()==""){
      alert("Please provide an admin email for the organization.");
      return;
    }
    
    if (this.validateEmail(adminName)==false){
      alert("Please provide a valid email for the admin.");
      return;
    }

    if (element["id"]=="") {
      this.spinner.show();           
      this.http.post('http://'+that.server+'/checkUserExists.php', JSON.stringify({"user": adminName}), {
        responseType: 'json'
        }).map(checkRes => {
          if (checkRes["exists"]==true){    
            that.showError("This user already exists",false);                      
          }
          else { 
      this.http.post('http://'+that.server+'/createOrganization.php', JSON.stringify({"name": org, "features":features}), {
      responseType: 'json'
      }).map(response => {
        if (response["success"]==1){            
          that.http.post('http://'+that.server+'/createUserWithPermissions.php', JSON.stringify({"user": adminName , "emailId":adminName, "orgId":response["org_id"]}), {
            responseType: 'json'
          }).map(resp => {
             if (resp["success"]=="1"){
              that.currentOrganization=response["org_id"];
              that.http.post('http://'+that.server+'/updateAdmin.php', JSON.stringify({"orgId": response["org_id"], "admin": adminName}), {
              responseType: 'json'
              }).map(res => {
               if (resp["success"]=="1"){
                 this.http.post('http://'+this.server+'/createRole.php', JSON.stringify({"orgId":response["org_id"], "roleName": "ADMIN", "feature":features, "access": "READ/WRITE"}), {
                  responseType: 'json'
                 }).map(output => {      
                  if (output["success"]==1){ 
                  var obj={};
                  obj["userId"]=resp["admin"];
                  obj["roleId"]=output["role_id"];    
                  this.http.post('http://'+this.server+'/updateUserRole.php', JSON.stringify(obj), {
                    responseType: 'json'
                  }).map(op => {      
                    this.spinner.hide();        
                    if (op["success"]=="1"){
                      that.showError("Organization created successfully",true);                      
                      for (var k in that.grps[count]){
                        that.saveGroupEntry(k);
                      } 
                      that.initAll();
                      that.ngOnInit();
                    }
                    else{                      
                      that.showError(op["error"],false);     
                      that.spinner.hide();                 
                    }
                  }).subscribe(r => {
                    console.log(JSON.stringify(r));
                  });  
                  }
                  else{                          
                  that.showError(output["error"],false);   
                  console.log(response);  
                  that.spinner.hide();         
                  }
                 }).subscribe(response => {
                  console.log(JSON.stringify(response));
                 });   
                 
                 var monFeatures=features.replace("ADMIN","");
                 monFeatures = monFeatures.substring(0,features.length-1);
                 this.spinner.show();
                 this.http.post('http://'+this.server+'/createRole.php', JSON.stringify({"orgId":response["org_id"], "roleName": "MONITOR", "feature":monFeatures, "access": "READ ONLY"}), {
                  responseType: 'json'
                 }).map(output => {
                  this.spinner.hide();      
                  if (output["success"]==1){  

                  }
                  else{                                            
                  that.showError(output["error"],false);                   
                  console.log(response);                           
                  }
                 }).subscribe(response => {
                  console.log(JSON.stringify(response));
                 });   
              }
              else{
                that.showError(resp["error"],false); 
                that.spinner.hide();
              }        
            }).subscribe(response => {
               console.log(JSON.stringify(response));
            });  
          }
          else{
            that.showError(resp["error"],false); 
            that.spinner.hide();
          }
          }).subscribe(response => {
            console.log(JSON.stringify(response));
          });           
        }else{          
          that.showError(response["error"],false);      
          that.spinner.hide();
        }
      }).subscribe(response => {
         console.log(JSON.stringify(response));
      });
    } 
  }).subscribe(response => {
    console.log(JSON.stringify(response));
 });
    }
    else {
      if (element["isSuperUser"]==true)
        features='LBS,SUBSCRIBER TRACING,SUPER USER,ADMIN';
      this.spinner.show();
      this.http.post('http://'+that.server+'/updateOrganization.php', JSON.stringify({"id":element["id"], "features":features}), {
         responseType: 'json'
      }).map(response => {
        if (response["success"]==1){
            that.http.post('http://'+that.server+'/updateAdmin.php', JSON.stringify({"orgId": element["id"], "admin":element["admin"]}), {
               responseType: 'json'
            }).map(res => {
               this.spinner.hide();
               that.showError("Organization updated successfully.",true);
               that.initAll();
               that.ngOnInit();
            }).subscribe(response => {
              console.log(JSON.stringify(response));
            });
        }else{          
          that.showError(response["error"],false);
        }
      }).subscribe(response => {
         console.log(JSON.stringify(response));
      });
    }
  }

  customTrackBy(index: number, obj: any): any {
    return index;
   }
}

export interface Element { 
  id:String;  
  isSuperUser:boolean;  
  beginEdits:boolean;
  selectedOptions:Array<String>; 
  selectedItems:Array<Object>;
  org:String;
  grps:Array<String>;
  admin:String;
  showGroups:boolean;
}
