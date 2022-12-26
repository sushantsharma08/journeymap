import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf';
import { environment } from 'src/environments/environment';
import { from } from 'rxjs';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  center: mapboxgl.GeolocateControl | undefined
  loc: object | undefined;
  map: mapboxgl.Map | undefined;
  style = 'mapbox://styles/mapbox/streets-v12';
  lat = 12;
  lng = 12;
  zoom = 3;
  options = {
    units: 'miles'
  };

  constructor() {
    (mapboxgl as any).accessToken = environment.mapbox.accessToken;
  }

  ngOnInit(): void {
    this.buildMap()
  }

  to = [];
  from = [0,0];

  buildMap() {


    const navControl = new mapboxgl.NavigationControl({
      visualizePitch: true
    });


    this.map = new mapboxgl.Map({
      container: 'map', // container ID
      style: this.style, // style URL
      center: [this.lng, this.lat], // starting position [lng, lat]
      zoom: this.zoom, // starting zoom
      attributionControl: false
    });

    this.map.addControl(navControl, 'top-right');
    this.map.addControl(this.center = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }))
    console.log(mapboxgl.GeolocateControl);

    // const geocoder = new mapboxgl.MapboxGeocoder({
    //   accessToken: mapboxgl.accessToken,
    //   mapboxgl: mapboxgl
    //   });

  }


  addMarker(this: any) {
    this.map.on('mousemove', (e: { lngLat: { toArray: () => any; }; }) => {
      this.loc = e.lngLat.toArray();
      // console.log(this.loc);

    });
    this.map.once('click', (e: { lngLat: { toArray: () => any; }; }) => {
      const marker = new mapboxgl.Marker({
        color: "red",
        draggable: true
      })
        .setLngLat(this.loc)
        .addTo(this.map);
      console.log(this.loc);
      this.to=this.loc;
    })
    console.log(this.to);
    console.log(this.from);
    
  }
  


  viewDist(this: any) {

    var greenMarker = new mapboxgl.Marker({
      color: 'green'
    })
      .setLngLat(this.to) // marker position using variable 'to'
      .addTo(this.map); //add marker to map
  
    var purpleMarker = new mapboxgl.Marker({
      color: 'purple'
    })
      .setLngLat(this.from) // marker position using variable 'from'
      .addTo(this.map); //add marker to map
  
    // units can be degrees, radians, miles, or kilometers, just be sure to change the units in the text box to match. 
  
    var distance = turf.distance(this.to, this.from, {
      units: 'kilometers'
    });
    console.log(distance);
  }

}



