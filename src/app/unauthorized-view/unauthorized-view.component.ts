import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UploadedFloorPlanService } from '../uploaded-floor-plan.service';
import { environment } from '../../environments/environment'; 
import * as $AB from 'jquery/dist/jquery.min.js';

@Component({
  selector: 'app-unauthorized-view',
  templateUrl: './unauthorized-view.component.html',
  styleUrls: ['./unauthorized-view.component.css']
})

export class UnauthorizedViewComponent implements OnInit {
  public username="";
  public showLBS:boolean=false;
  public showAccounts:boolean=false;
  public showST:boolean=false;
  public allowConf:boolean=false;
  public showAdmin:boolean=false;
  public lastLogin:String;
  public server = environment.server;
  public allAccounts=0;
  public orgId:String="";
  public orgName:String="";
  public totalLogins:Number=0;
  public barChartOptions:any = {
    scaleShowVerticalLines: false,
    responsive: true,    
    scales: {           
      yAxes: [{
        type: "linear",
        display: true,
        position: "left",
        id: "y-axis-1",
        gridLines: {
          display: false
        },
        scaleLabel: {
          display: true,
          labelString: 'Number of Users'
        },
        labels: {
          show: true
        },
        ticks: {
          beginAtZero: true,
          userCallback: function(label, index, labels) {
            if (Math.floor(label) === label) {
              return label;
            }

          },
        }
      }],
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Number of Logins'
        }
      }]
    }
  };
  public barChartOptions1:any = {
    scaleShowVerticalLines: false,
    responsive: true,    
    scales: {           
      yAxes: [{
        type: "linear",
        display: true,
        position: "left",
        id: "y-axis-1",
        gridLines: {
          display: false
        },
        scaleLabel: {
          display: true,
          labelString: 'Number of Users'
        },
        labels: {
          show: true
        },
        ticks: {
          beginAtZero: true,
          userCallback: function(label, index, labels) {
            if (Math.floor(label) === label) {
              return label;
            }

          },
        }
      }],
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Last Activity'
        }
      }]
    }
  };
  
  public org_options=[];
  public barChartLabels:string[] = [];
  public barChartType:string = 'bar';
  public barChartLegend:boolean = true;
  public barChartData = [];  
 
  public barChartLabels1:string[] = [];
  public barChartType1:string = 'bar';
  public barChartLegend1:boolean = true;
  
  public barChartData1:any[] = [
    {data: [], label: ''}
  ];

  public barChartLabels2:string[] = [];
  public barChartType2:string = 'bar';
  public barChartLegend2:boolean = true;
 
  public barChartData2:any[] = [
    {data: [], label: ''}
  ];

  public doughnutChartLabels:string[] = ['', ''];
  public doughnutChartData:number[] = [];
  public doughnutChartType:string = 'doughnut';
 
  public doughnutChartColors: any[] = [{ backgroundColor: ["#ff8605", "#7aad02", "#a4c73c", "#a4add3"] }];

  public chartClicked(e:any):void {
    console.log(e);
    console.log(event);
  }
   
  public chartHovered(e:any):void {
    console.log(e);
  }

  public populateData():void {
    let that=this;
    that.org_options=[];
    var url='http://'+that.server+'/AccountUsers.php';

    var obj={};
    
    if (this.showAccounts!=true)
      obj["orgId"]=this.uploadedService.getOrgId();    
    
    this.orgId = this.uploadedService.getOrgId();    

    that.http.post(url,  JSON.stringify(obj), {
      responseType: 'json'
    }).map(response => {
        //var data=[];   
        for (var each in response){            
            if (response[each]["organization"]=="Ruckus Wireless"){
              this.orgName = response[each]["organization"];
              continue;
            }
            that.barChartLabels.push(response[each]["organization"]);
            that.org_options.push([response[each]["id"],response[each]["organization"]]);
            that.barChartData.push(parseInt(response[each]["users"]));
        }        
    }).subscribe(re => {
      console.log(re);
    });
    
    if (this.showAccounts==true){
      that.http.post('http://'+that.server+'/listOrganizations.php',  JSON.stringify({}), {
        responseType: 'json'
      }).map(response => {
        var obj={};
        var allIds={};
        for (var k in response){
          allIds[response[k]["id"]]=1;  
          if (response[k]["feature"]=="ADMIN")
             continue;
          else
          {
          if (obj.hasOwnProperty(response[k]["feature"])){
             if (obj[response[k]["feature"]].indexOf(response[k]["id"])<0){
                obj[response[k]["feature"]].push(response[k]["id"]);       
             }   
          }
          else{
             obj[response[k]["feature"]]=[response[k]["id"]];          
          }
          }
        }  

        that.allAccounts=Object.keys(allIds).length-1;

        let clone = JSON.parse(JSON.stringify(this.doughnutChartData));
        var ind=0;
        for (var k in obj){
          if (k=="SUPER USER")
            continue;
          that.doughnutChartLabels[ind]=k;
          clone.push(obj[k].length-1);
          ind++;
        }      
        that.doughnutChartData=clone;
      }).subscribe(res => {
        console.log(res);
      });
    }
  }

  constructor(private uploadedService :UploadedFloorPlanService,private http: HttpClient,private authService: AuthService, private spinner: NgxSpinnerService, private router: Router) { }
  
  ngOnInit() {
    this.username = sessionStorage.getItem('username');

    if (!this.uploadedService.getLoggedIn()) {
      this.router.navigate(['/login']);
    }
    
    this.lastLogin = this.uploadedService.getLastLogin().toString();

    this.totalLogins = this.uploadedService.getTotalLogins();
    
    if (this.totalLogins==0) {
      this.router.navigate(['/confirm']);
    }

    var that=this;

    that.uploadedService.setShowAdmin(false);
    that.uploadedService.setShowLBS(false);
    that.uploadedService.setShowST(false);
    that.uploadedService.setShowAccounts(false);
    that.uploadedService.setAllowConf(false);
    this.spinner.show();
    that.http.post('http://'+that.server+'/listUserPermissions.php?user_id='+that.uploadedService.getUser(),  JSON.stringify({}), {
        responseType: 'json'
      }).map(response => {
          this.spinner.hide();
          for (var each in response){
            for (var k in response[each]){                              
                if (k=="ADMIN"){
                  that.uploadedService.setShowAdmin(true);
                  that.showAdmin=true;
                }
                else if (k=="LBS"){
                  that.uploadedService.setShowLBS(true);
                  that.showLBS=true;      
                }
                else if (k=="SUBSCRIBER TRACING"){             
                  that.uploadedService.setShowST(true);
                  that.showST=true;
                  if (response[each][k]=="READ ONLY")
                      that.allowConf=false;
                  else if (response[each][k]=="READ/WRITE")
                      that.allowConf=true;
                  that.uploadedService.setAllowConf(that.allowConf);
                }
                else if (k=="SUPER USER"){
                  that.uploadedService.setShowAccounts(true);
                  that.showAccounts=true;                    
                }              
            }
          }      
          
          that.populateData();    
          let jQueryInstance=this;
    
          $AB(document).ready(function(){

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
                $(".slide-menu").hide();
              }
            });                        

            $AB('.first-level > a.test').on("click", function(e){
              $AB('.first-level > .dropdown-menu').hide();
            });

            $AB("#logoutBtn a").off('mouseover').on('mouseover',function(){
              $AB(".logout").show();
            });
            
            that.fillGraphData(that.uploadedService.getOrgId());            

            $AB("#loginAttempts").css("display","block");
            $AB("#lastActivityChart").css("display","block");
        
            $AB("#listOrganizations").off('change').on('change',function(){
              that.spinner.show();
              that.fillGraphData($AB(this).find("option:selected").data('row'));
            });


            $AB('.dropdown-submenu a.test').on("click", function(e){
              $AB("a.test").css("color","#888888");              
              $AB(this).css("color","#fff");
              $AB(this).next('ul').toggle();              
              e.stopPropagation();
              e.preventDefault();
            });     
                  
            $AB('a.dropdown-toggle').off('click').on('click',function(e){        
              $AB("a.test").next(".dropdown-menu").hide();
            });

          });
      }).subscribe(response => {
        console.log(response);
      });      
  }
  
  fillGraphData(orgId){
    var that=this;    
    that.http.post('http://'+that.server+'/listUsers.php?org_id='+orgId,  JSON.stringify({}), {
      responseType: 'json'
    }).map(response => {
        that.spinner.hide();
        var no_of_times={};
        var last_activity_obj={};

         var counter_dict={};
         var last_activity_dict={};
         for (var ind in response){
          counter_dict[response[ind]["email_addr"]]=response[ind]["counter"];       
          last_activity_dict[response[ind]["email_addr"]]=response[ind]["last_activity"]; 
         }


        for (var each in counter_dict){
            if (no_of_times.hasOwnProperty(counter_dict[each])){
              no_of_times[counter_dict[each]]=no_of_times[counter_dict[each]]+1;
            } else{
              no_of_times[counter_dict[each]]=1;
            }

            if (last_activity_obj.hasOwnProperty(last_activity_dict[each])){
              last_activity_obj[last_activity_dict[each]]=last_activity_obj[last_activity_dict[each]]+1;
            } else{
              last_activity_obj[last_activity_dict[each]]=1;
            }
        }                                        
        var data=[];
        var i=0;
        for (var k in no_of_times){
            that.barChartLabels1[i]=k;
            data.push(parseInt(no_of_times[k]));
            i++;
        }
        that.barChartLabels1.splice(i,that.barChartLabels1.length);
        
        let clone = JSON.parse(JSON.stringify(that.barChartData1));
        clone[0].data = data;
        that.barChartData1 = clone;

        var data=[];
        var i=0;
        for (var k in last_activity_obj){
            that.barChartLabels2[i]=k;
            data.push(parseInt(last_activity_obj[k]));
            i++;
        }
        that.barChartLabels2.splice(i,that.barChartLabels2.length);
        clone = JSON.parse(JSON.stringify(that.barChartData2));
        clone[0].data = data;
        that.barChartData2 = clone;

    }).subscribe(re => {
      console.log(re);
    });
  }


}