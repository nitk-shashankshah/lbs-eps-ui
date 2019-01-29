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
import { LoggerService } from '../logger.service';

@Component({
  selector: 'app-subscriber-tracing',
  templateUrl: './subscriber-tracing.component.html',
  styleUrls: ['./subscriber-tracing.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})

export class SubscriberTracingComponent implements OnInit, AfterViewInit {  

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  public username:String = ""; 
  public group;
  public totalEntries=0;
  public pageSize=1;
  public pages = 1;
  public pageSizeOptions=[];
  public showLBS:boolean=false;
  public showRoles:boolean=false;
  public showAccounts:boolean=false;
  public showST:boolean=false;
  public showAdmin:boolean=false;
  public imsis = [];
  public currentPageIndex;
  public currentPageSize;
  public analysisIMSIs = [];
  public grps=[];
  public configuredGroup:String="select";
  public models=[];

  public noDataFound=false;
  public errorMsg="";

  public display="none";
  public displayBackDrop="none";
  public displayError="none";  
  public isOperationSuccess=false;

  private server = environment.server; 
  isExpansionDetailRow = (i: number, row: Object) => true;
  expandedElement: Element;
  displayedColumns = ['imsiid','subs_name','msisdn','status','isAnalysisAvailable','pcap','logs'];  
  
  userlist: any;

  dataSource = new MatTableDataSource(ELEMENT_DATA);
  model: any = {
    onColor: 'primary',
    offColor: 'secondary',
    onText: 'GRANTED',
    offText: 'DISABLED',
    disabled: true,
    size: '',
    value: true
  };
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
    }

    ngOnInit() {
    this.username = sessionStorage.getItem('username');
    this.group=this.uploadedService.getGroup();
       
    this.showLBS  = JSON.parse(this.uploadedService.getLBS());
    this.showAccounts =  JSON.parse(this.uploadedService.getAccount());
    this.showAdmin =  JSON.parse(this.uploadedService.getAdmin());
    this.showST =  JSON.parse(this.uploadedService.getST());

    var that=this;

    if (!this.uploadedService.getLoggedIn()) {
       this.router.navigate(['/login']);  
    }

    this.logger.info("subscriber-tracing.component","LIST GROUPS",this.username as string,new Date().toUTCString());            
  
    this.configuredGroup = this.uploadedService.getGroup();
 
    this.grps=[];        

    this.http.post('http://'+this.server+'/listGroups.php?org_id='+this.uploadedService.getOrgId(),  JSON.stringify({}), {
      responseType: 'json'
    }).map(response => {       
        this.logger.debug("subscriber-tracing.component","LIST GROUPS UCCESS",this.username as string,new Date().toUTCString());            
        for (var each in response){               
          that.grps=response[each];                            
        }                   
    }).subscribe(response => {
      console.log(response);
    });


    let jQueryInstance = this;

    $AB(document).ready(function(){
      $AB(".well").hide();
      $AB("#configure_group").show();
      $AB(".close").off('click').on('click',function(){
        $(this).parent().slideToggle();
      });
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
            
      $AB("#changeGrp").off('change').on('change',function(){
          jQueryInstance.configuredGroup = $AB(this).find("option:selected").html();
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
      
      $AB("#logoutBtn a").off('mouseover').on('mouseover',function(){
        $AB(".logout").show();
      });

      $AB(".filterLinks").off('click').on('click',function(){      
        $AB(".well").hide();
        $($(this).data("target")).slideToggle();
      });
      
      $AB('.first-level > a.test').on("click", function(e){
        $AB('.first-level > .dropdown-menu').hide();
      });
      $AB('.dropdown-submenu a.active').css("color","#fff");      

  
      $AB('.dropdown-submenu a.test').on("click", function(e){
        $AB("a.test").css("color","#888888");            
        $AB(".slide-menu").css('width','0px');  
        $AB(this).css("color","#fff");
        $AB(this).next('ul').css('width','150px');       
        $AB('.dropdown-submenu a.active').css("color","#fff");      
        e.stopPropagation();
        e.preventDefault();
      });         

    });

    //this.spinner.show(); 
    var that=this;
    var pages=1;
    this.logger.debug("subscriber-tracing.component","LIST ANALYSIS",this.username as string,new Date().toUTCString());            

    this.http.get('http://10.150.76.238:9999/st/api/getlist/imsi?page=1').map((response)  => {
    if (response!=null && !response.hasOwnProperty("ERROR")){
      this.noDataFound=false;
      pages=response["page-info"]["pages"];
      // this.spinner.hide();
      if (response["page-info"]["pages"]>1){
        for (var pg=2;pg<=response["page-info"]["pages"];pg++){        
          this.http.get('http://10.150.76.238:9999/st/api/getlist/imsi?page='+pg).map((re)  => {
            for (var k in re["imsi-list"]){
              that.analysisIMSIs.push(re["imsi-list"][k].toString());
            }      
          }).subscribe((data) => console.log(data)); 
        }
      }
      for (var k in response["imsi-list"]){
        that.analysisIMSIs.push(response["imsi-list"][k].toString());
      }
    }else{
      this.noDataFound=true;
      this.errorMsg=response["ERROR"];
    }
    }).subscribe((data) => console.log(data));
  }
  
  private extractData(x){
    var that=this;    
    if (that.expandedElement==x){
      that.expandedElement=null;
    }    
    else if (this.analysisIMSIs.indexOf(x.imsiid)>=0){
      this.spinner.show();
      this.http.get('http://10.150.76.238:9999/st/api/actions/imsi/'+x.imsiid+'/action/analysisreport').map((res)  => {
      this.spinner.hide();
      this.logger.debug("subscriber-tracing.component","EXTRACT DATA",this.username as string,new Date().toUTCString());         
      
      this.logger.log("EXTRACT IMSI ANALYSIS","SUBSCRIBER TRACING", new Date().toUTCString(),that.uploadedService.getGroup() as string,"SUCCESS",this.showAccounts,this.username as string,that.uploadedService.getRoleName() as string,"SUBS. TRACING > TRACE RESULTS",this.uploadedService.getOrgName() as string);

      x['msg']="<table class=\"table\"><thead><tr><th width=\"5%\">Code</th><th width=\"12%\">Procedure Name</th><th width=\"5%\">Status</th><th width=\"13%\">Failure Cause</th><th width=\"22%\">Possible Failure Cause</th><th width=\"13%\">Timestamp</th><th width=\"20%\">Messages</th><th width=\"5%\">PCAP</th></tr></thead><tbody>";
      for (var each in res["analysis-reports"]){               
        try{
          x['msg'] = x['msg'] +"<tr><td>"+res["analysis-reports"][each]["procedure"]["code"]+"</td><td>"+res["analysis-reports"][each]["procedure"]["name"]+"</td><td>"+(res["analysis-reports"][each]["report"]["is_success"]==true?"<span class=\"glyphicon glyphicon-check text-success\"></span>":"<span class=\"glyphicon glyphicon-remove text-danger\"></span>")+"</td><td>"+res["analysis-reports"][each]["failure_cause"]+"</td><td>"+res["analysis-reports"][each]["possible_failure_cause"].split(",").join("<br>")+"</td><td>"+new Date(parseInt(res["analysis-reports"][each]["procedure"]["timestamp-start"])).toLocaleDateString()+" "+ new Date(parseInt(res["analysis-reports"][each]["procedure"]["timestamp-start"])).toLocaleTimeString()+"</td><td>"+res["analysis-reports"][each]["report"]["messages"].join("<br>")+"</td><td> <a class='btn btn-primary' href=\"http://10.150.76.238:9999/st/api/actions/imsi/"+x.imsiid+"/action/download/pcap/timerange?start="+ res["analysis-reports"][each]["procedure"]["timestamp-start"]+"&stop="+ res["analysis-reports"][each]["procedure"]["timestamp-stop"]+"\"> <span class=\"glyphicon glyphicon-download-alt\"></span></a></td></tr>";
        }catch {         
           
        }
      }
      x['msg']=x['msg']+"</tbody></table>";
      that.expandedElement=x;
      }).subscribe((d) => console.log(d));   
    }
  }

  applyFilter(filterValue: string){
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    this.dataSource.filter = filterValue;
  }
  
  onToggle(event){
    return false;
  }
  
  showError(msg,isSuccess){
    this.errorMsg=msg;
    this.displayError="block";
    this.displayBackDrop="block";
    this.isOperationSuccess=isSuccess;
    this.spinner.hide();
  }
    
  onChange(event){
    var that=this;
    var state="";
    if (event.checked==true)
      state="GSP-STATUS-GRANTED";
    else if (event.checked==false)
      state="GSP-STATUS-DISABLED";

    ELEMENT_DATA = [];

    this.spinner.show();

    this.http.get('http://10.150.76.45:8080/hssImsiList?toggle=0&grp='+that.configuredGroup).map((response)  => {
    this.spinner.hide();
    if (response!=null && !response.hasOwnProperty("Error")){
      this.logger.log("CHANGE GROUP","SUBSCRIBER TRACING", new Date().toUTCString(),that.uploadedService.getGroup() as string,"SUCCESS",this.showAccounts,this.username as string,that.uploadedService.getRoleName() as string,"SUBS. TRACING > TRACING",this.uploadedService.getOrgName() as string);

      for (var k in response["IMSI_DATA"]){
        this.noDataFound=false;
        var temp=response["IMSI_DATA"][k];
        temp["msg"]="No msg";  
        temp["isAnalysisAvailable"]="";
        if (that.analysisIMSIs.indexOf(temp.imsiid.toString())>=0){
           temp["isAnalysisAvailable"]="Available";
           ELEMENT_DATA.push(temp);
        }
        that.totalEntries = response["PAGE_INFO"]["total_imsi"];
        that.pageSize = response["PAGE_INFO"]["imsi_per_page"];
        that.pages = response["PAGE_INFO"]["total_pages"];
      }
    }
    else{
      if (response.hasOwnProperty("Error")){
         this.noDataFound=true;
         this.errorMsg=response["Error"];
         this.showError(response["Error"],false);
      }
    }
    this.dataSource = new MatTableDataSource(ELEMENT_DATA);
    }).subscribe((data) => console.log(data));
  }

  changePage(event){   
    /*
    if (this.currentPageSize!=event.pageSize){
        let splicedData = Object.assign([], ELEMENT_DATA);    
        this.dataSource = new MatTableDataSource(splicedData.splice(0,event.pageSize));    
        this.currentPageSize=event.pageSize;
        this.paginator._pageIndex = this.currentPageIndex;
    }
    else if (this.currentPageIndex!=event.pageIndex){
        var that=this;
        this.spinner.show();
        this.http.get('http://10.150.76.45:8080/hssImsiList?toggle=0').map((response)  => {
          ELEMENT_DATA = [];
          this.spinner.hide();
          for (var k in response["IMSI_DATA"]){                   
              var temp=response["IMSI_DATA"][k];       
              temp["msg"]="No msg";       
              ELEMENT_DATA.push(temp);              
              that.totalEntries = response["PAGE_INFO"]["total_imsi"];
              that.pageSize = response["PAGE_INFO"]["imsi_per_page"];
              that.pages = response["PAGE_INFO"]["total_pages"];

              that.pageSizeOptions=[];
              if (that.pageSize%4==0)
               that.pageSizeOptions.push(that.pageSize/4);
              if (that.pageSize%3==0)
               that.pageSizeOptions.push(that.pageSize/3);
              if (that.pageSize%2==0)
               that.pageSizeOptions.push(that.pageSize/2);
               
              that.pageSizeOptions.push(that.pageSize);
              that.currentPageSize=that.pageSize;        
          }          
          this.currentPageIndex = event.pageIndex;
          let splicedData = Object.assign([], ELEMENT_DATA);
          this.dataSource = new MatTableDataSource(splicedData.splice(0,event.pageSize));        
          this.currentPageSize = event.pageSize;

          this.dataSource = new MatTableDataSource(ELEMENT_DATA);
        }).subscribe((data) => console.log(data));
    }*/
  }
}

export interface Element {  
  trace_node: number;
  feature_list: number;
  stFeatureEnabled : number;
	subscriptionFlag: number;
	grp_id: number;
	old_imsiid: number;
}

var ELEMENT_DATA: Element[] = [];