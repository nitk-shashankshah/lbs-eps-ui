import { Component, OnInit, AfterViewInit,ViewChild } from '@angular/core';
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
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})

export class AdminPanelComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  displayedColumns = ["id","name","selectedOptions","permission","beginEdits"];  
  
  public ELEMENT_DATA: Element[] = [];

  dataSource = new MatTableDataSource(this.ELEMENT_DATA);

  public username:String = ""; 
  public features=[];
  public accessTypes=[];  
  
  public checkLink=true;
  public display="none";
  public displayBackDrop="none";
  public displayError="none";
  public errorMsg="";        
  public isOperationSuccess=false;
  public clickedLink="";
  public beginEdits=[];
  public showLBS:boolean=false;
  public showRoles:boolean=false;
  public showAccounts:boolean=false;
  public showST:boolean=false;
  public showAdmin:boolean=false;
  private server = environment.server; 
  public tempRow= [];
  public filterVal="";
  
  public pageSize=5;
  public totalEntries=100;
  public pageSizeOptions=[5,20,50,100];

  public selectedPermission=[];
  dropdownList = [];
  dropdownSettings = {};

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private uploadedService : UploadedFloorPlanService) {};

  ngOnInit() {

    this.username = sessionStorage.getItem('username');
    var that=this;

    this.showLBS  = JSON.parse(this.uploadedService.getLBS());
    this.showAccounts =  JSON.parse(this.uploadedService.getAccount());
    this.showAdmin =  JSON.parse(this.uploadedService.getAdmin());
    this.showST =  JSON.parse(this.uploadedService.getST());

    var that=this;

    if (!this.uploadedService.getLoggedIn()) {
      this.router.navigate(['/login']);  
    }

    this.http.post('http://'+this.server+'/listAccessTypes.php',  JSON.stringify({}), {
      responseType: 'text'
    }).map(response => {
      that.accessTypes=JSON.parse(response);
    }).subscribe(response => {
      console.log(response);
    });
    

    this.dropdownList = [];

    
    this.dropdownSettings = { 
          singleSelection: false,
          text:"Select Features",
          selectAllText:'Select All',
          unSelectAllText:'UnSelect All',
          enableSearchFilter: true,
          classes:"myclass custom-class"
    };
    
    this.features=[];
    this.spinner.show();
    this.http.post('http://'+this.server+'/listOrgPermissions.php?org_id='+this.uploadedService.getOrgId(),  JSON.stringify({}), {
      responseType: 'json'
    }).map(response => {
         this.spinner.hide();      
         for (var each in response){
           var obj={};           
           if (response[each]!="SUPER USER" && response[each]!="ADMIN"){
             obj["id"]=response[each];
             obj["itemName"]=response[each];
             this.dropdownList.push(obj);
             this.features.push(response[each]);
           }          
         }    
    }).subscribe(response => {
      console.log(response);
    });

    this.fillRoles('http://'+this.server+'/listRoles.php?org_id='+this.uploadedService.getOrgId());
    
    let jQueryInstance = this;
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

      $AB(document).click(function(event) {
        if (!$AB(event.target).hasClass('logout')) {
             $AB(".logout").hide();
        }
        if (!$AB(event.target).hasClass('.slide-menu')) {
          $AB(".slide-menu").hide();
        }
      });

      $AB('a').on('click', (e) => {
        e.preventDefault();
        if (!$AB(e.target).hasClass('hamburger')) {
          if (jQueryInstance.checkLink==false){           
            jQueryInstance.openModal(e.target.getAttribute('data-link')||e.target.parentNode.getAttribute('data-link'));
          }
        }
      });

      $AB("#logoutBtn a").off('mouseover').on('mouseover',function(){
        $AB(".logout").show();
      });

      $AB('.dropdown-submenu a.test').on("click", function(e){                
        $AB(this).next('ul').toggle();        
        e.stopPropagation();
        e.preventDefault();        
      });    

    });       
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

  applyFilter(filterValue: string){
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase(); 
    this.filterVal = filterValue;
    this.dataSource.paginator = this.paginator;  
    this.dataSource.filter = filterValue;
  }
  
  fillRoles(apiUrl){  
    var that=this;
    let promise = new Promise((resolve, reject) => {
    this.http.get(apiUrl)
        .toPromise()
        .then(res => {          
          for (var each in res){
            for (var k in res[each]){           
              that.fillRoleDetails('http://'+that.server+'/getRoleDetails.php?orgId='+that.uploadedService.getOrgId()+'&roleId='+k,k,res[each][k]);                         
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

  fillRoleDetails(apiUrl,roleId,roleName){
    var that=this;
    let promise = new Promise((resolve, reject) => {
    this.http.get(apiUrl)
        .toPromise()
        .then(response => {
            var opts=[];
            var temp=[];           
            for (var each in response)
            {
             if (response[each]["feature"]!="SUPER USER" && response[each]["feature"]!="ADMIN"){
               opts.push(response[each]["feature"]);
               var obj={};
               obj["id"]=response[each]["feature"];
               obj["itemName"]=response[each]["feature"];
               temp.push(obj); 
             }
            }            
            that.tempRow.push("");       
            
            var ele=new Object();
             
            this.beginEdits.push(false);
            this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);
            
            ele["id"]=roleId;
            ele["beginEdits"]=false;
            ele["selectedOptions"]=opts;
            ele["selectedItems"]=temp;
            ele["name"]=roleName;
            ele["permission"]=response[each]["access"];
            this.selectedPermission.push(response[each]["access"]);
            this.ELEMENT_DATA.push(ele as Element);   
            this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            resolve();
          },
          msg => { // Error
          reject(msg);
          }
        );     
    });
    return promise;
  }

  deleteRole(event,i){
    var that=this;
    var element = this.ELEMENT_DATA[i];
    if (element.id!=""){
    this.spinner.show();    
    this.http.post('http://'+this.server+'/deleteRole.php', JSON.stringify({"orgId":this.uploadedService.getOrgId(), "role": element.id}), {
      responseType: 'json'
    }).map(response => {
      this.spinner.hide();      
      if (response["success"]==1){
        that.showError("Role deleted successfully.",true);
        that.initAll();
        that.ngOnInit();   
        //that.router.navigate(['/roles']);  
      }else{        
        that.showError(response["error"],false);     
      }
    }).subscribe(response => {
      console.log(JSON.stringify(response));
    });
    }
    else {
      this.ELEMENT_DATA.splice(i,1);         
      that.beginEdits.splice(i,1);      
      this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.dataSource.paginator = this.paginator;  
      this.dataSource.filter = this.filterVal;
      this.dataSource.sort = this.sort;
    }
    
  }
  
  onChange(event,ele){
    ele["permission"]=this.selectedPermission[this.ELEMENT_DATA.indexOf(ele)];
  }

  saveRole(i){
    var that=this;    
    
    var ele = this.ELEMENT_DATA[i];

    if (ele["name"].trim()==""){
      alert("Please provide a role name.");
      return;
    }

    if (ele["selectedOptions"].length==0){
      alert("Please select at least one feature.");
      return;
    }

    if (ele["permission"]=="" || ele["permission"]==undefined){
      alert("Please select the access type.");
      return;
    }

    if (ele["id"]=="")
    {    
    this.spinner.show();
    this.http.post('http://'+this.server+'/createRole.php', JSON.stringify({"orgId":this.uploadedService.getOrgId(), "roleName": ele["name"], "feature":ele["selectedOptions"].join(), "access": ele["permission"]}), {
      responseType: 'json'
    }).map(response => {
      this.spinner.hide();
      if (response["success"]==1){
        that.showError("Role created successfully.",true);
        that.initAll();
        that.ngOnInit();
      }
      else{        
        that.showError(response["error"],false);     
        console.log(response);           
      }
    }).subscribe(response => {
      console.log(JSON.stringify(response));
    });  
    }
    else
    {
    this.spinner.show();
    this.http.post('http://'+this.server+'/updateRole.php', JSON.stringify({"roleName": ele["name"],"roleId":ele["id"]}), {
      responseType: 'json'
    }).map(response => {
        this.spinner.hide();
        if (response["success"]==1){             
          //that.showError("Role updated successfully.",true);
        }        
        else{
          if (response.hasOwnProperty("error") && response["error"]!="")             
             that.showError(response["error"],false);           
        }
    }).subscribe(response => {
      console.log(JSON.stringify(response));
    });  

    if (ele["selectedOptions"].length>0){
      this.spinner.show();    
      
      this.http.post('http://'+this.server+'/saveRole.php', JSON.stringify({"orgId":that.uploadedService.getOrgId(), "role_id": ele["id"], "features": that.features.join(), "selectedfeatures":ele["selectedOptions"].join(), "access": ele["permission"]}), {
      responseType: 'json'
      }).map(response => {
        this.spinner.hide();
      if (response["success"]==1){        
        that.initAll();
        that.ngOnInit();        
        that.showError("Role saved successfully.",true);               
      }    
      else{            
        that.showError(response["error"],false);               
      }
      }).subscribe(response => {
      console.log(JSON.stringify(response));
      });
    }
    else {
      alert("Please select atleast one feature");
    }

    }
  }
  
  addRole(event){
    if (this.ELEMENT_DATA[this.ELEMENT_DATA.length-1]["id"]!=""){
      var element = new Object();
      element["id"]='';
      element["name"]='';
      element["beginEdits"]=true;      
      element["selectedOptions"]=[];
      element["selectedItems"]=[];
      element["permission"]="READ ONLY";
      this.selectedPermission.push("READ ONLY");
      this.beginEdits.push(true);
      this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);      
      this.ELEMENT_DATA.push(element as Element);
      this.dataSource = new MatTableDataSource(this.ELEMENT_DATA);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.paginator.lastPage();
    }
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
    this.saveRole(this.beginEdits.indexOf(true));
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

  initAll(){    
    this.beginEdits=[];
    this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);
    this.features=[];    
    this.checkLink=false;
    this.dropdownList = [];
    this.dropdownSettings = {};
    this.display="none";
    this.clickedLink="";
    this.ELEMENT_DATA=[];
  }

  editRole(event,i){    
    this.beginEdits[i]=!this.beginEdits[i];
    this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);        
    var element = this.ELEMENT_DATA[i];
    element["beginEdits"]=!element["beginEdits"];   
    this.selectedPermission[i] = element["permission"];    
    this.tempRow[i]=element["name"];
 }

 cancelChanges(event,i){    
  this.beginEdits[i]=!this.beginEdits[i];       
  this.ELEMENT_DATA[i]["beginEdits"]=!this.ELEMENT_DATA[i]["beginEdits"];   
   
  this.checkLink = (this.beginEdits.indexOf(true)>=0?false:true);
  if (this.ELEMENT_DATA[i]["id"]==''){
    this.deleteRole(event,i);
  }
  else{
    this.ELEMENT_DATA[i]["name"]=this.tempRow[i];
  }
 }

 customTrackBy(index: number, obj: any): any {
	return index;
 }

 onItemSelect(item:any,i){
  this.ELEMENT_DATA[i]["selectedOptions"]=[];
  for (var k in this.ELEMENT_DATA[i]["selectedItems"]){    
    this.ELEMENT_DATA[i]["selectedOptions"].push(this.ELEMENT_DATA[i]["selectedItems"][k]["id"]);
  }
}

OnItemDeSelect(item:any,i){
  this.ELEMENT_DATA[i]["selectedOptions"]=[];
  for (var k in this.ELEMENT_DATA[i]["selectedItems"]){
    this.ELEMENT_DATA[i]["selectedOptions"].push(this.ELEMENT_DATA[i]["selectedItems"][k]["id"]);
  }    
}

onSelectAll(items: any, i){
  this.ELEMENT_DATA[i]["selectedOptions"]=[];
  for (var k in this.ELEMENT_DATA[i]["selectedItems"]){
    this.ELEMENT_DATA[i]["selectedOptions"].push(this.ELEMENT_DATA[i]["selectedItems"][k]["id"]);
  }        
}

onDeSelectAll(items: any,i){
  this.ELEMENT_DATA[i]["selectedOptions"]=[];
}
}

export interface Element {
  id:String;
  beginEdits:boolean;
  selectedOptions:Array<String>; 
  selectedItems:Array<Object>;
  name:String;  
  permission:String;  
}
