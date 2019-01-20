import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { UploadedFloorPlanService } from '../uploaded-floor-plan.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment'; 
import * as $AB from 'jquery/dist/jquery.min.js';

@Component({
  selector: 'app-config-access-points',
  templateUrl: './config-access-points.component.html',
  styleUrls: ['./config-access-points.component.css']
})
export class ConfigAccessPointsComponent implements OnInit {
  
  public showMarkers : boolean = false;
  public listPoints = [];
  public username:String = ""; 
  public showLBS:boolean=false;
  public showAccounts:boolean=false;
  public showST:boolean=false;
  public showAdmin:boolean=false;
  public showRoles:boolean=false;
  public server = environment.server;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private uploadedService : UploadedFloorPlanService
  ) {}

  addMarkers(event) { // You can give any function name     
    var target = event.target || event.srcElement || event.currentTarget;
    this.showMarkers=!this.showMarkers;
    if (this.showMarkers==true)
      target.innerHTML="Stop Marking";
    else
      target.innerHTML="Add Points";
  }

  saveMarkers(){
    this.uploadedService.setAccessPointsLocation(this.listPoints);
  }

  undoMarkers() { // You can give any function name  
   var top =  this.listPoints.pop();
   var myCanvas = document.getElementById('configAccessCanvas');            
   var ctx = (myCanvas as HTMLCanvasElement).getContext('2d');          
   ctx.beginPath();
   ctx.globalCompositeOperation = 'destination-out';
   ctx.arc(parseFloat(top.split(",")[0]), parseFloat(top.split(",")[1]), 11, 0, Math.PI*2, false);
   ctx.fill();  
  }

  clearMarkers(val){
    var myCanvas = document.getElementById('configAccessCanvas');            
    var ctx = (myCanvas as HTMLCanvasElement).getContext('2d');
    ctx.clearRect(0, 0,  (myCanvas as HTMLCanvasElement).width,  (myCanvas as HTMLCanvasElement).height);
    this.listPoints = [];
  }

  deleteRow(event){        
    var target = event.target || event.srcElement || event.currentTarget;                    
    var pixels=target.getAttribute("data-pointvalue");                    
    var ind = this.listPoints.indexOf(pixels);       
    var myCanvas = document.getElementById('configAccessCanvas');            
    var ctx = (myCanvas as HTMLCanvasElement).getContext('2d');   
    ctx.beginPath();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.arc(parseFloat(pixels.split(",")[0]), parseFloat(pixels.split(",")[1]), 11, 0, Math.PI*2, false);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    this.listPoints.splice(ind,1);
  }

  ngOnInit() {
    //this.fl= this.uploadedService.getFileContent();//.subscribe(fl => this.fl =fl);   
    var dataURL = this.uploadedService.getFileContent();
    var image = new Image();    

    this.username = sessionStorage.getItem('username');

    if (!this.uploadedService.getLoggedIn()) {
      this.router.navigate(['/login']);  
    }
    
    this.showLBS  = JSON.parse(this.uploadedService.getLBS());
    this.showAccounts =  JSON.parse(this.uploadedService.getAccount());
    this.showAdmin =  JSON.parse(this.uploadedService.getAdmin());
    this.showST =  JSON.parse(this.uploadedService.getST());
    this.showRoles = JSON.parse(this.uploadedService.getRoles());
    
    if (dataURL)
      image.src = dataURL.toString();

    var that = this;
    image.onload = function () {
      var myCanvas = document.getElementById('configAccessCanvas');           

      function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }
      that.listPoints = that.uploadedService.getAccessPointsLocation();

      myCanvas.style.background = "url("+dataURL+") no-repeat left top";
      (myCanvas as HTMLCanvasElement).width = (this as HTMLImageElement).width;
      (myCanvas as HTMLCanvasElement).height = (this as HTMLImageElement).height;
      
      for (var each in that.listPoints){
         var centerX = parseInt(that.listPoints[each].split(",")[0]);
         var centerY = parseInt(that.listPoints[each].split(",")[1]);
         
         var ctx = (myCanvas as HTMLCanvasElement).getContext('2d');
         ctx.beginPath();   
         ctx.globalCompositeOperation = 'source-over';
         ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI, false);
         ctx.fillStyle = 'red';
         ctx.fill();      
      }        

      //var myCanvas = document.getElementById('configAccessCanvas');
      myCanvas.addEventListener('click', function(evt) {
      var mousePos = getMousePos(myCanvas, evt);              
      var ctx = (myCanvas as HTMLCanvasElement).getContext('2d');
      var centerX = mousePos.x;
      var centerY = mousePos.y;
      if (that.showMarkers==true){        
        ctx.beginPath();   
        that.listPoints.push(centerX+","+centerY);
        ctx.globalCompositeOperation = 'source-over';
        ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'red';
        ctx.fill();                
      } 
      }, false);
    }

    $AB(document).ready(function(){
      $AB('.first-level > a.test').on("click", function(e){
        $AB('.first-level > .dropdown-menu').hide();
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
      
      $AB(document).click(function(event){
        if (!$AB(event.target).hasClass('logout')) {
          $AB(".logout").hide();
        }

        if (!$AB(event.target).hasClass('.slide-menu')) {          
          $AB(".slide-menu").css('width','0px!important');
          $AB('.dropdown-submenu a.test').css('color','#888888');
          $AB('.dropdown-submenu a.active').css("color","#fff");    
        }
      });

      $AB('.dropdown-submenu a.active').css("color","#fff");      

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
}
