import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf';
import { NavigationControl } from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  @ViewChild('screen')
  screen!: ElementRef;

  theme = "Light"

  loc: object | undefined;
  map: mapboxgl.Map | undefined;
  style = 'mapbox://styles/mapbox/streets-v12';
  lat = 12;
  lng = 12;
  zoom = 3;
  options = {
    units: 'miles'
  };
  distanceTraveled = 0;
  initial: any;
  updatearr: any[] | turf.helpers.Feature<turf.helpers.Point, turf.helpers.Properties> | turf.helpers.Point = [];

  constructor() {
    (mapboxgl as any).accessToken = environment.mapbox.accessToken;
  }

  ngOnInit(): void {
    this.buildMap()
  }

  to = [];
  from: any = [];
  distance = 0;

  buildMap() {

    const navControl = new mapboxgl.NavigationControl({
      visualizePitch: true
    });
    const success = (pos: { coords: any; }) => {
      const crd = pos.coords;

      // console.log('Your current position is:');
      // console.log(`Latitude : ${crd.latitude}`);
      // console.log(`Longitude: ${crd.longitude}`);
      // console.log(`More or less ${crd.accuracy} meters.`);
      this.from.length = 0;
      this.from = [crd.longitude, crd.latitude]
      console.log(this.from);

    }

    function error(err: { code: any; message: any; }) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }


    this.map = new mapboxgl.Map({
      container: 'map', // container ID
      style: this.style, // style URL
      center: [this.lng, this.lat], // starting position [lng, lat]
      zoom: this.zoom, // starting zoom
      attributionControl: false
    });

    this.map.addControl(navControl, 'top-right');

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true,
    })
    this.map.addControl(geolocate);

    navigator.geolocation.getCurrentPosition(success, error)
    geolocate.on('geolocate', () => {
      console.log(`geolocate clicked`);


    })
  }

  testLocUpdate() {

    this.initial = this.from;
    console.log(this.initial);

    const success = (pos: { coords: any; }) => {
      const crd = pos.coords;
      this.updatearr = [crd.longitude, crd.latitude];
      console.log(typeof this.updatearr);
    }

    function error(err: { code: any; message: any; }) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    setInterval(() => {
      navigator.geolocation.getCurrentPosition(success, error);
      this.distanceTraveled = turf.distance(this.initial, this.updatearr, {
        units: 'kilometers'
      });
      console.log(this.updatearr);
      console.log(this.initial);
      console.log(this.distanceTraveled);
    }, 500)
  }

  addMarker(this: any) {
    this.map.on('mousemove', (e: { lngLat: { toArray: () => any; }; }) => {
      this.loc = e.lngLat.toArray();
      // console.log(this.loc);

    });
    this.map.once('click', (e: { lngLat: { toArray: () => any; }; }) => {
      const marker = new mapboxgl.Marker({
        color: "red",
        draggable: false
      })
        .setLngLat(this.loc)
        .addTo(this.map);
      this.to = this.loc;
      console.log(this.loc);
    })
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

    this.distance = turf.distance(this.to, this.from, {
      units: 'kilometers'
    });
    console.log(this.to);
    console.log(this.from);
    console.log(this.distance);
  }

  changeTheme() {

    if (this.theme === 'Light') {
      this.theme = "dark"
      this.screen.nativeElement.style.backgroundColor = "#21222d";
      this.screen.nativeElement.style.color = "#b8b8b8";
    } else {
      this.theme = 'Light'
      this.screen.nativeElement.style.backgroundColor = "White";
      this.screen.nativeElement.style.color = "black";
    }
  }
}
