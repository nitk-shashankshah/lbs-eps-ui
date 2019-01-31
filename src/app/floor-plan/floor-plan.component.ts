import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UploadedFloorPlanService } from '../uploaded-floor-plan.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { PARAMETERS } from '@angular/core/src/util/decorators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 
import * as $AB from 'jquery/dist/jquery.min.js';
//import {RequestOptions, Request, RequestMethod} from '@angular/http';


@Component({
  selector: 'app-floor-plan',
  templateUrl: './floor-plan.component.html',
  styleUrls: ['./floor-plan.component.css']
})

export class FloorPlanComponent implements OnInit {
      constructor(private http: HttpClient,private authService: AuthService, private spinner: NgxSpinnerService, private uploadedService :UploadedFloorPlanService, private router: Router) { }
      public floor_plan: String = "";
      public fileName: String="";
      public flg: boolean = true;          
      public showMarkers : boolean = false;
      public coordinateMapping={};
      public allPoints =[];
      public allCoordinates=[];
      public showLBS:boolean=false;
      public showAccounts:boolean=false;
      public showST:boolean=false;
      public showAdmin:boolean=false;
      public showRoles:boolean=false;
      public server=environment.server;
      public username="";

      ngOnInit() {

        if(!this.uploadedService.getLoggedIn()) {
            this.router.navigate(['/login']);
        }
        this.username = sessionStorage.getItem('username');

        this.showLBS  = JSON.parse(this.uploadedService.getLBS());
        this.showAccounts =  JSON.parse(this.uploadedService.getAccount());
        this.showAdmin =  JSON.parse(this.uploadedService.getAdmin());
        this.showST =  JSON.parse(this.uploadedService.getST());
        
        this.coordinateMapping = this.uploadedService.getCoordinates();
        this.floor_plan = this.uploadedService.getFileContent();
        
        if (this.floor_plan!=""){
        this.allPoints=Object.keys(this.coordinateMapping);
        this.allCoordinates=[];
        for (var k in Object.keys(this.coordinateMapping)){
           this.allCoordinates.push(this.coordinateMapping[Object.keys(this.coordinateMapping)[k]]);
        }

        var image = new Image();    
        (image.src as String) = this.floor_plan;
        var that = this;
        image.onload = function () {
          var myCanvas = document.getElementById('myCanvas');           
    
          function getMousePos(canvas, evt) {
            var rect = canvas.getBoundingClientRect();
            return {
              x: evt.clientX - rect.left,
              y: evt.clientY - rect.top
            };
          }
          
          myCanvas.style.background = "url("+that.floor_plan+") no-repeat left top";
          (myCanvas as HTMLCanvasElement).width = (this as HTMLImageElement).width;
          (myCanvas as HTMLCanvasElement).height = (this as HTMLImageElement).height;
          var ctx = (myCanvas as HTMLCanvasElement).getContext('2d');
          
          for (var k in Object.keys(that.coordinateMapping)){
            ctx.beginPath();   
            ctx.globalCompositeOperation = 'source-over';
            ctx.arc(parseInt(Object.keys(that.coordinateMapping)[k].split(",")[0]), parseInt(Object.keys(that.coordinateMapping)[k].split(",")[1]), 10, 0, Math.PI*2, false);
            ctx.fillStyle = 'red';
            ctx.fill();     
          }

          myCanvas.addEventListener('click', function(evt) {
            var mousePos = getMousePos(myCanvas, evt);
            var ctx = (myCanvas as HTMLCanvasElement).getContext('2d');
            var centerX = mousePos.x;
            var centerY = mousePos.y;
            that.flg=true;
            if (that.showMarkers==true){
              for (var k in Object.keys(that.coordinateMapping)){
                  if (that.coordinateMapping[Object.keys(that.coordinateMapping)[k]]==1){
                     ctx.globalCompositeOperation = 'destination-out';
                     ctx.arc(parseInt(Object.keys(that.coordinateMapping)[k].split(",")[0]), parseInt(Object.keys(that.coordinateMapping)[k].split(",")[1]), 11, 0, Math.PI*2, false);
                     ctx.fill();
                     delete that.coordinateMapping[Object.keys(that.coordinateMapping)[k]];
                  }
              }
              that.coordinateMapping[centerX+","+centerY]=1;                  
              ctx.beginPath();   
              ctx.globalCompositeOperation = 'source-over';
              ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI, false);
              ctx.fillStyle = 'red';
              ctx.fill();                
            } 
          }, false);
        }
        }

        $AB(document).ready(function(){          
          
          $AB("#logoutBtn a").off('mouseover').on('mouseover',function(){
            $AB(".logout").show();
          });     
          
          $AB(document).click(function(event) {
            if (!$(event.target).hasClass('logout')) {
                 $(".logout").hide();
            }
             if (!$AB(event.target).hasClass('.slide-menu')) {
              $AB(".slide-menu").css('width','0px');
              $AB('.dropdown-submenu a.test').css('color','#888888');
              $AB('.dropdown-submenu a.active').css("color","#fff");    
            }
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
      
      saveCoordinates(event){
        this.uploadedService.saveCoordinates(this.coordinateMapping);    
        this.uploadedService.setFileContent(this.floor_plan);
        var that=this;
        that.fileName=that.fileName.split(".")[0];
        this.http.post('http://'+this.server+'/'+environment.rbacRoot+'/floorPlan.php',  JSON.stringify({"dataURL": that.floor_plan,"name":that.fileName.toString(),"username":that.username}), {
          responseType: 'text'
        }).map(res => {     
          console.log(res);  
        }).subscribe(response => {
          console.log(response);
        });
      }

      undoMarkers(event) {
      if (Object.keys(this.coordinateMapping).length>0){
        var myCanvas = document.getElementById('myCanvas');            
        var ctx = (myCanvas as HTMLCanvasElement).getContext('2d');
       
        ctx.beginPath();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.arc(parseFloat(Object.keys(this.coordinateMapping)[Object.keys(this.coordinateMapping).length-1].split(",")[0]), parseFloat(Object.keys(this.coordinateMapping)[Object.keys(this.coordinateMapping).length-1].split(",")[1]), 11, 0, Math.PI*2, false);
        ctx.fill();
        
        delete this.coordinateMapping[Object.keys(this.coordinateMapping)[Object.keys(this.coordinateMapping).length-1]];

        this.allPoints=Object.keys(this.coordinateMapping);
        this.allCoordinates=[];
        for (var k in Object.keys(this.coordinateMapping)){
           this.allCoordinates.push(this.coordinateMapping[Object.keys(this.coordinateMapping)[k]]);
        }
        this.coordinateMapping = Object.assign({},  this.coordinateMapping);
      }
      }

      addMarkers(val) {
         this.showMarkers=val;
      }
      
      deleteRow(event){        
        var target = event.target || event.srcElement || event.currentTarget;                
        
        var pixels=target.getAttribute("data-pointvalue");                
        delete this.coordinateMapping[pixels];            
       
        var myCanvas = document.getElementById('myCanvas');            
        var ctx = (myCanvas as HTMLCanvasElement).getContext('2d');
       
        ctx.beginPath();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.arc(parseFloat(pixels.split(",")[0]), parseFloat(pixels.split(",")[1]), 11, 0, Math.PI*2, false);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
              
        this.allPoints=Object.keys(this.coordinateMapping);
        this.allCoordinates=[];
        for (var k in Object.keys(this.coordinateMapping)){
           this.allCoordinates.push(this.coordinateMapping[Object.keys(this.coordinateMapping)[k]]);
        }

        this.coordinateMapping = Object.assign({},  this.coordinateMapping);
      }

      clearMarkers(val){
        if (val.allPoints.length==0){
             this.coordinateMapping={};         
             var myCanvas = document.getElementById('myCanvas');            
             var ctx = (myCanvas as HTMLCanvasElement).getContext('2d');
             ctx.clearRect(0, 0,  (myCanvas as HTMLCanvasElement).width,  (myCanvas as HTMLCanvasElement).height);
        }
        this.allPoints=val.allPoints;
        this.allCoordinates=val.allCoordinates;
      }

      onFileChange(event) {
      let input = event.target;      
      this.fileName  = input.value.split("\\")[input.value.split("\\").length-1];
      this.spinner.show();
      var that = this;
      for (var index = 0; index < input.files.length; index++) {
        let reader = new FileReader();
        reader.onload = () => {
            var dataURL = reader.result;       
            this.floor_plan = dataURL;
            var image = new Image();
            this.spinner.hide();
            image.src = dataURL;
            
            image.onload = function () {
            var myCanvas = document.getElementById('myCanvas');            
            myCanvas.style.background = "url("+dataURL+") no-repeat left top";            
            (myCanvas as HTMLCanvasElement).width = (this as HTMLImageElement).width;
            (myCanvas as HTMLCanvasElement).height = (this as HTMLImageElement).height;
            var myCanvas = document.getElementById('myCanvas');
            function getMousePos(canvas, evt) {
              var rect = canvas.getBoundingClientRect();
              return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
              };
            }
            
            myCanvas.addEventListener('click', function(evt) {
              var mousePos = getMousePos(myCanvas, evt);              
              var ctx = (myCanvas as HTMLCanvasElement).getContext('2d');
              var centerX = mousePos.x;
              var centerY = mousePos.y;
              that.flg=true;
              if (that.showMarkers==true){
                for (var k in Object.keys(that.coordinateMapping)){
                    if (that.coordinateMapping[Object.keys(that.coordinateMapping)[k]]==1){
                       ctx.globalCompositeOperation = 'destination-out';
                       ctx.arc(parseInt(Object.keys(that.coordinateMapping)[k].split(",")[0]), parseInt(Object.keys(that.coordinateMapping)[k].split(",")[1]), 11, 0, Math.PI*2, false);
                       ctx.fill();
                       delete that.coordinateMapping[Object.keys(that.coordinateMapping)[k]];
                    }
                }
                that.coordinateMapping[centerX+","+centerY]=1;                  
                ctx.beginPath();   
                ctx.globalCompositeOperation = 'source-over';
                ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'red';
                ctx.fill();                
              } 
            }, false);
            }                       
        }
        reader.readAsDataURL(input.files[index]);
      }
      this.spinner.hide();     
     };

}
