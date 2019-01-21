import { Component, OnInit, Input,Output,EventEmitter,SimpleChanges} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ElementRef, NgZone, ViewChild } from '@angular/core';
import { } from '@types/googlemaps';
import { MapsAPILoader } from '@agm/core';
import { MouseEvent as AGMMouseEvent } from '@agm/core';
import { UploadedFloorPlanService } from '../uploaded-floor-plan.service';
import { Router } from '@angular/router';

declare var jquery:any;
declare var $ :any;
declare const google: any;

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.css']
})

export class GoogleMapComponent implements OnInit {
  lat: number = 34.8282;
  lng: number = -94.5795;  
  public latitude: number = 34.8282;
  public longitude: number = -94.5795; 
  public searchControl: FormControl;
  public zoom: number; 
  public username:String="";
  @Input() showMarkers: boolean;
  @Input() coordinateMapping: Object;
  markers: marker[] = [];
  @Output() valueChange = new EventEmitter();
  @Output() undoMarking = new EventEmitter();
  @Output() beginMarking = new EventEmitter();
  public allPoints =[];
  public allCoordinates=[];
  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private uploadedService : UploadedFloorPlanService,
    private router: Router
  ) {}

  ngOnChanges(coordinateMapping: SimpleChanges) {
      this.markers=[];
      for (var k in Object.keys(this.coordinateMapping)){
        this.markers.push({
          lat: parseFloat(this.coordinateMapping[Object.keys(this.coordinateMapping)[k]].split(",")[0]),
          lng: parseFloat(this.coordinateMapping[Object.keys(this.coordinateMapping)[k]].split(",")[1])
        });
      }
  }

  ngOnInit() {
    //set google maps defaults
    this.zoom = 4;
    this.latitude = 34.8282;
    this.longitude = -94.5795;
    //create search FormControl
    
    this.searchControl = new FormControl();
    
    //set current position
    //this.setCurrentPosition();

    this.username = sessionStorage.getItem('username');
        
    if(!this.uploadedService.getLoggedIn()) {
      this.router.navigate(['/login']);
    }

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });    
    });  
  }
  
  valueChanged() { // You can give any function name
    this.markers = [];
    this.coordinateMapping={};
    this.allCoordinates=[];
    this.allPoints=[];
    this.valueChange.emit({"markers":this.markers, "allPoints":this.allPoints,"allCoordinates":this.allCoordinates});
  }
  addMarkers(event) { // You can give any function name     
    var target = event.target || event.srcElement || event.currentTarget;
    this.showMarkers=!this.showMarkers;
    if (this.showMarkers==true)
      target.innerHTML="Stop Marking";
    else
      target.innerHTML="Add Markers";
    this.beginMarking.emit(this.showMarkers);
  }

  undoMarkers() { // You can give any function name
    this.undoMarking.emit(true);
  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }
  
  mapClicked($event: AGMMouseEvent) {

    if (this.showMarkers==true && Object.keys(this.coordinateMapping).length>0){
      
      if (this.coordinateMapping[Object.keys(this.coordinateMapping)[Object.keys(this.coordinateMapping).length-1]]!=1){
        this.markers.splice(this.markers.length-1,1);
      }

      this.markers.push({
        lat: $event.coords.lat,
        lng: $event.coords.lng
      });

      this.coordinateMapping[Object.keys(this.coordinateMapping)[Object.keys(this.coordinateMapping).length-1]]=$event.coords.lat+","+$event.coords.lng;
      
      this.allPoints=Object.keys(this.coordinateMapping);
      this.allCoordinates=[];
      for (var k in Object.keys(this.coordinateMapping)){
         this.allCoordinates.push(this.coordinateMapping[Object.keys(this.coordinateMapping)[k]]);
      }
      this.valueChange.emit({"markers":this.markers, "allPoints":this.allPoints,"allCoordinates":this.allCoordinates});
  
    }
  }
  
 }

interface marker {
	lat: number;
	lng: number;
}