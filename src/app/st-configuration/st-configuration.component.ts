import { Component, NgModule, OnInit,ViewChild,AfterViewInit } from '@angular/core';
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
import {SelectionModel} from '@angular/cdk/collections';
import { LoggerService } from '../logger.service';


const initialSelection = [];
const allowMultiSelect = true;

@Component({
  selector: 'app-st-configuration',
  templateUrl: './st-configuration.component.html',
  styleUrls: ['./st-configuration.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})


export class StConfigurationComponent implements OnInit {
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public username:String = ""; 
  public group:String = ""; 
  public showLBS:boolean=false;
  public showRoles:boolean=false;
  public configuredGroup:String="Select";
  public showAccounts:boolean=false;
  public showST:boolean=false;
  public showAdmin:boolean=false;
  public allowConf:boolean=false;
  public grps=[];  
  public totalEntries=0;
  public pageSize=1;
  public pages = 1;
  public pageSizeOptions=[];
  
  public noDataFound=false;
  public errorMsg="";

  public display="none";
  public displayBackDrop="none";
  public displayError="none";  
  public isOperationSuccess=false;

  private server = environment.server; 
  public currentPageIndex;
  public currentPageSize;
  public analysisIMSIs = [];  

  isExpansionDetailRow = (i: number, row: Object) => true;
  expandedElement: Element;
  displayedColumns = ['select','imsiid','subs_name','msisdn','msg','CSG_id','stFeatureEnabled','status'];  
  selection = new SelectionModel<Element>(allowMultiSelect, initialSelection);

  userlist: any;

  dataSource = new MatTableDataSource(ELEMENT_DATA);
  
    /** Whether the number of selected elements matches the total number of rows. */
 
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private http: HttpClient,    
    private spinner: NgxSpinnerService,
    private logger: LoggerService,
    private uploadedService : UploadedFloorPlanService) {};
    device:number = 1;

    ngAfterViewInit() {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
    
    ngOnInit() {
    this.username = sessionStorage.getItem('username');       
    this.group = this.uploadedService.getGroup();
    this.showLBS  = JSON.parse(this.uploadedService.getLBS());
    this.showAccounts =  JSON.parse(this.uploadedService.getAccount());
    this.showAdmin =  JSON.parse(this.uploadedService.getAdmin());
    this.showST =  JSON.parse(this.uploadedService.getST());
    this.allowConf = JSON.parse(this.uploadedService.getAllowConf());
    
    var that=this;

    if (!this.uploadedService.getLoggedIn()) {
       this.router.navigate(['/login']);  
    }

    this.spinner.show();
    this.grps=[];
    this.configuredGroup = this.uploadedService.getGroup();
       
    this.http.post('http://'+this.server+'/listGroups.php?org_id='+this.uploadedService.getOrgId(),  JSON.stringify({}), {
      responseType: 'json'
    }).map(response => {
        this.spinner.hide();      
        this.logger.debug("st-configuration.component.ts","LIST GROUPS SUCCESS",this.username as string,new Date().toUTCString());            
        for (var each in response){                         
          that.grps=response[each];   
          if (this.allowConf==false)            
             this.configuredGroup=that.grps[0];             
          else
             this.configuredGroup = this.uploadedService.getGroup();
        }                   
    }).subscribe(response => {
      console.log(response);
    });

    let jQueryInstance = this;

    $AB(document).ready(function(){      
      $AB('.alert-info').hide();
            
      $AB("#changeGrp").off('change').on('change',function(){
        $AB('.alert-info').hide();                
        jQueryInstance.configuredGroup = $AB(this).find("option:selected").html();  
      });

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

      $AB(".close").off('click').on('click',function(){
        $(this).parent().slideToggle();
      });

      $AB('.close').off('click').on('click',function(e){
        e.preventDefault();        
        $AB('.alert-info').hide();
      });
      
      $AB('.first-level > a.test').on("click", function(e){
        $AB('.first-level > .dropdown-menu').hide();
      });

      $AB('.dropdown-submenu a.active').css("color","#fff");      

      $AB('.dropdown-submenu a.test').on("click", function(e){
        $AB("a.test").css("color","#888888");            
        $AB(".slide-menu").css('width','0px');  
        $AB(this).css("color","#fff");
        
        $AB('.dropdown-submenu a.active').css("color","#fff");      
      
        $AB(this).next('ul').css('width','150px');       
        e.stopPropagation();
        e.preventDefault();
      });
    });

    var that=this;

    if (that.configuredGroup!=""){
    this.spinner.show();    
        
    this.logger.log("LIST IMSI","SUBSCRIBER TRACING CONFIGURATION", new Date().toUTCString(),that.uploadedService.getGroup() as string,"SUCCESS",this.showAccounts,this.username as string,that.uploadedService.getRoleName() as string,"SUBS. TRACING > CONFIGURATION",this.uploadedService.getOrgName() as string);

    this.http.get('http://10.150.76.45:8080/hssImsiList?toggle=0&grp='+that.configuredGroup).map((response)  => {
    that.spinner.hide();
    ELEMENT_DATA = [];
    
    if (response!=null && !response.hasOwnProperty("Error")){
    this.noDataFound=false;
    this.logger.debug("st-configuration.component.ts","LIST IMSI SUCCESS",this.username as string,new Date().toUTCString());

    for (var k in response["IMSI_DATA"]){        
        var temp=response["IMSI_DATA"][k];
        temp["msg"]="No msg";         
        ELEMENT_DATA.push(temp);
        that.totalEntries = response["PAGE_INFO"]["total_imsi"];
        that.pageSize = response["PAGE_INFO"]["imsi_per_page"];
        that.pages = response["PAGE_INFO"]["total_pages"];
    }       
    }else{
      this.noDataFound=true;
      this.errorMsg=response["Error"];    
    }
    this.dataSource = new MatTableDataSource(ELEMENT_DATA);   
    }).subscribe((data) => console.log(data));     
    }   
  }
  
  showError(msg,isSuccess){
    this.errorMsg=msg;
    this.displayError="block";
    this.displayBackDrop="block";
    this.isOperationSuccess=isSuccess;
    this.spinner.hide();
  }
  
  onCloseHandledError(){
    this.displayError="none";
    this.displayBackDrop="none";
  }
  
  setGroupName(event){    
    this.uploadedService.setGroup(this.configuredGroup);    
    var that=this;    
    this.spinner.show();
    this.http.get('http://10.150.76.45:8080/hssImsiList?toggle=0&grp='+that.uploadedService.getGroup()).map((response)  => {
    this.spinner.hide();
    ELEMENT_DATA = [];    
    
    this.logger.log("GROUP CHANGE","SUBSCRIBER TRACING CONFIGURATION", new Date().toUTCString(),that.uploadedService.getGroup() as string,"SUCCESS",this.showAccounts,this.username as string,that.uploadedService.getRoleName() as string,"SUBS. TRACING > CONFIGURATION",this.uploadedService.getOrgName() as string);
    this.logger.debug("st-configuration.component.ts","CHANGE GROUP SUCCESS",this.username as string,new Date().toUTCString());

    if (response!=null && !response.hasOwnProperty("Error")){
    this.noDataFound=false;
    for (var k in response["IMSI_DATA"]){
        var temp=response["IMSI_DATA"][k];        
        ELEMENT_DATA.push(temp);
        that.totalEntries = response["PAGE_INFO"]["total_imsi"];
        that.pageSize = response["PAGE_INFO"]["imsi_per_page"];
        that.pages = response["PAGE_INFO"]["total_pages"];
    }   
    }else{
      this.noDataFound=true;      
      this.errorMsg=response["Error"];
      this.logger.debug("st-configuration.component.ts","CHANGE GROUP FAILED",this.username as string,new Date().toUTCString());
    }
    this.dataSource = new MatTableDataSource(ELEMENT_DATA);
    }).subscribe((data) => console.log(data));
  }

  applyFilter(filterValue: string){
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
 
  isAllSelected() {    
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  onChange(event,imsi){
    var that=this;
    var state="";
    if (event.checked==true)
      state="GSP-STATUS-GRANTED";
    else if (event.checked==false)
      state="GSP-STATUS-DISABLED";
    this.spinner.show();    
        
    /*this.selection.selected.forEach(row => function(){
      this.http.get('http://10.150.76.45:8080/hssImsiList?toggle=1&grp='+this.uploadedService.getGroup()+"&imsi="+row.imsiid+"&status="+state,{responseType:"text"}).map(res  => {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(res.toString().replace("\n","").replace("\r","").trim(),"text/xml");   
        this.spinner.hide();
        this.showError("Subscriber status change: "+xmlDoc.getElementsByTagName("status")[0].childNodes[0].nodeValue,true);        
      }).subscribe();
      }
    );*/
    
    this.logger.debug("st-configuration.component.ts","TOGGLE IMSI STATUS",this.username as string,new Date().toUTCString());

    this.http.get('http://10.150.76.45:8080/hssImsiList?toggle=1&grp='+this.uploadedService.getGroup()+"&imsi="+imsi+"&status="+state,{responseType:"text"}).map(res  => {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(res.toString().replace("\n","").replace("\r","").trim(),"text/xml");   
        this.spinner.hide();
        this.showError("Subscriber status change: "+xmlDoc.getElementsByTagName("status")[0].childNodes[0].nodeValue,true);        
        this.logger.debug("st-configuration.component.ts","TOGGLE IMSI STATUS SUCCESS",this.username as string,new Date().toUTCString());
        this.logger.log("IMSI STATUS CHANGE","SUBSCRIBER TRACING CONFIGURATION", new Date().toUTCString(),imsi as string,"SUCCESS",this.showAccounts,this.username as string,that.uploadedService.getRoleName() as string,"SUBS. TRACING > CONFIGURATION",this.uploadedService.getOrgName() as string);
    }).subscribe(
    );
  }
 
  changePage(event){

  }
}


export interface Element {  
  trace_node: number;
  feature_list: number;
  stFeatureEnabled : number;
	subscriptionFlag: number;
	grp_id: number;
	old_imsiid: number;
	mme_sgsn_number:string;
	odb: number;
	sgw_trace_event: number;
	mme_trace_intf: number;
	trace_depth: number;
	mme_host: number;
	imsFlag: number;
	subs_name: number;
	pgw_trace_intf: number;
	mme_trace_event: number;
	lte_auth_algo: number;
	profid: number;
	status: number;
  msisdn: string;  
  CSG_id:any;
	imei_prefix: number;
	trace_ipv6: string;
	sgw_trace_intf: number;
	pgw_trace_event: number;
	trace_id: number;
	imsiid: string;
  trace_ip: number;
  msg: string;
}

var ELEMENT_DATA: Element[] = [];