import { Component, OnInit } from '@angular/core';
import { UploadedFloorPlanService } from '../uploaded-floor-plan.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment'; 
import * as $AB from 'jquery/dist/jquery.min.js';

@Component({
  selector: 'app-display-devices',
  templateUrl: './display-devices.component.html',
  styleUrls: ['./display-devices.component.css']
})
export class DisplayDevicesComponent implements OnInit {
  public username:String="";
  public dataURL:String="";
  public showLBS:boolean=false;
  public showAccounts:boolean=false;
  public showST:boolean=false;
  public showRoles:boolean=false;
  public showAdmin:boolean=false;
  public floorPlans=[];
  public server = environment.server;

  constructor(
    private uploadedService : UploadedFloorPlanService,
    private router: Router,
    private http: HttpClient,    
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.dataURL = this.uploadedService.getFileContent();

    this.username = sessionStorage.getItem('username');

    if (!this.uploadedService.getLoggedIn()) {
      this.router.navigate(['/login']);  
    }
    this.showLBS  = JSON.parse(this.uploadedService.getLBS());
    this.showAccounts =  JSON.parse(this.uploadedService.getAccount());
    this.showAdmin =  JSON.parse(this.uploadedService.getAdmin());
    this.showST =  JSON.parse(this.uploadedService.getST());
    
    var that=this;
    this.http.post('http://'+this.server+'/listAllFloorPlans.php', JSON.stringify({"username":this.username}), {
    responseType: 'json'
    }).map(result => {     
       //var result=JSON.parse(res.toString());
       for (var k in result){            
            for (var k2 in result[k]){
              var obj={};
              obj["name"]=k2;
              obj["content"]=result[k][k2];
              that.floorPlans.push(obj);
            }
       }
    }).subscribe(response => {
    console.log(response);
    });

    $AB(document).ready(function(){

      $AB("#logoutBtn a").off('mouseover').on('mouseover',function(){
        $AB(".logout").show();
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
  }

  loadMap($event){    
    var target = event.target || event.srcElement || event.currentTarget;     
    var listPoints = this.uploadedService.getAccessPointsLocation();
    var image = new Image();   
    
    var dataURL = (document.getElementById("floor_plan_select") as HTMLSelectElement).options[(document.getElementById("floor_plan_select") as HTMLSelectElement).selectedIndex].value.toString();

    image.src = dataURL;
       
    var that = this;
    image.onload = function () {
    var myCanvas = document.getElementById('displayDevicesCanvas');           
    
    myCanvas.style.background = "url("+dataURL+") no-repeat left top";
    (myCanvas as HTMLCanvasElement).width = (this as HTMLImageElement).width;
    (myCanvas as HTMLCanvasElement).height = (this as HTMLImageElement).height;
 
    var ctx = (myCanvas as HTMLCanvasElement).getContext('2d');
 
    for (var each in listPoints){
      ctx.beginPath();   
      var centerX= parseInt(listPoints[each].split(",")[0]);
      var centerY= parseInt(listPoints[each].split(",")[1]);    
      ctx.globalCompositeOperation = 'source-over';
      ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'red';
      ctx.fill();                
    }
    }
  }

  displayDevices(){    
      var mycanvas = document.getElementById("displayDevicesCanvas");    
      var context = (mycanvas as HTMLCanvasElement).getContext('2d');
      var centerX = parseInt(mycanvas.style.width)/2;
      var centerY = parseInt(mycanvas.style.height)/2;
      var radius = 4;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      context.fillStyle = 'red';
      context.shadowBlur=0;
      context.fill();     
  }

}
