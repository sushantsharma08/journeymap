import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl'
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {
  
  loc:object | undefined;
  map: mapboxgl.Map | undefined;
  style = 'mapbox://styles/mapbox/streets-v12';
  lat = 0;
  lng = 0;
  zoom = 9;


  constructor() {
    (mapboxgl as any).accessToken = environment.mapbox.accessToken;
  }

  ngOnInit(): void {
    this.buildMap()
  }
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
    this.map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }))
    
  }
  
  
  addMarker(this: any) {
      this.map.once('click', (e: { lngLat: { toArray: () => any; }; }) => {
      this.loc=e.lngLat.toArray();
      console.log(this.loc);
      // this.arrayOfLoc.push(this.loc.lat)
      // this.arrayOfLoc.push(this.loc.lng)


      const marker = new mapboxgl.Marker({
        color: "red",
        draggable: true
      })
      .setLngLat(this.loc)
      .addTo(this.map);
      console.log(marker.getLngLat());
      
      });


      
  }

}

