import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf';
import { NavigationControl } from 'mapbox-gl';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs';
import { feature } from '@turf/turf';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit {

  @ViewChild('screen')
  screen!: ElementRef;

  theme = "Light"
  i = 1;
  loc: object | undefined;
  map!: mapboxgl.Map;
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
  marker: any;
  to = [];
  from: any = [];
  distance = 0;
  instHidden = false;

  constructor() {
    (mapboxgl as any).accessToken = environment.mapbox.accessToken;
  }

  ngOnInit(): void {
    this.buildMap()
  }


  Toggle() {
    if (this.instHidden === false) {
      this.instHidden = true
    } else {
      this.instHidden = false
    }
    console.log(this.instHidden);

  }



  buildMap() {

    const navControl = new mapboxgl.NavigationControl({
      visualizePitch: true
    });

    const success = (pos: { coords: any; }) => {
      const crd = pos.coords;
      this.from.length = 0;
      this.from = [crd.longitude, crd.latitude]
      console.log(this.from);
      this.initial = this.from;
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
    const source = new mapboxgl.Marker({ color: '', draggable: true }).setLngLat([this.lat, this.lng]).addTo(this.map);
    var lnglat = source.getLngLat();
    console.log(`long: ${lnglat.lng}, latti: ${lnglat.lat}`)

    // this.map.on('load', () => {

    //   this.map.addSource('source1', {
    //     type: 'geojson',
    //     data: {
    //       type: 'Feature',
    //       properties: {},
    //       geometry: {
    //         type: 'LineString',
    //         coordinates: [[0, 0], [1, 1]]
    //       }

    //     }
    //   })
    //   this.map.addLayer({
    //     id: 'source1',
    //     type: 'line',
    //     source: 'source1',
    //     layout: {
    //       "line-cap": 'round',
    //       "line-join": 'round'
    //     },
    //     paint: {
    //       "line-color": 'green',
    //       "line-width": 8
    //     }
    //   })
    // })
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
    console.log(this.initial);

    const success = (pos: { coords: any; }) => {
      const crd = pos.coords;
      this.updatearr = [crd.longitude, crd.latitude];
    }

    function error(err: { code: any; message: any; }) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }

    this.map.flyTo({
      center: this.initial,
      zoom: 10
    })

    // create a point
    this.map.addSource('source1', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Point',
          coordinates: this.initial
        }

      }
    })
    this.map.addLayer({
      id: 'source1',
      type: 'circle',
      source: 'source1',
      layout: {
      },
      paint: {
        "circle-color": 'red',
        "circle-radius": 8
      }
    })

    setInterval(() => {
      navigator.geolocation.getCurrentPosition(success, error);

      this.distanceTraveled += turf.distance(this.initial, this.updatearr, {
        units: 'kilometers'
      });

      // add a line

      this.map.addSource(`${this.i}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [this.initial, this.updatearr]
          }

        }
      })
      this.map.addLayer({
        id: `${this.i}`,
        type: 'line',
        source: `${this.i}`,
        layout: {
          "line-cap": 'round',
          "line-join": 'round'
        },
        paint: {
          "line-color": 'black',
          "line-width": 8
        }
      })

      this.i++;
      this.initial = this.updatearr;
      console.log(this.updatearr);
      console.log(this.initial);
      console.log(this.distanceTraveled);


    }, 500)


  }

  addMarker(this: any) {
    this.map.once('click', (e: { lngLat: { toArray: () => any; }; }) => {
      this.loc = e.lngLat.toArray();
      this.marker = new mapboxgl.Marker({
        color: "red",
        draggable: true
      })
        .setLngLat(this.loc)
        .addTo(this.map);

      var lnglat = this.marker.getLngLat();
      this.loc = [lnglat.lng, lnglat.lat]

      this.to = this.loc;
      console.log(this.loc);
    });
  }

  viewDist(this: any) {

    var greenMarker = new mapboxgl.Marker({
      color: 'green', draggable: true
    })
      .setLngLat(this.to) // marker position using variable 'to'
      .addTo(this.map); //add marker to map
    const onDragEnd = () => {
      var lnglat = greenMarker.getLngLat();
      this.loc = [lnglat.lng, lnglat.lat]
      this.to = this.loc;
      calcDist();
      removeLine();
      createLine();
    }
    greenMarker.on('dragend', onDragEnd)

    // var purpleMarker = new mapboxgl.Marker({
    //   color: 'purple'
    // })
    //   .setLngLat(this.from) // marker position using variable 'from'
    //   .addTo(this.map); //add marker to map

    const calcDist = () => {
      this.distance = turf.distance(this.to, this.from, {
        units: 'kilometers'
      });
    }
    const createLine = () => {
      this.map.addSource('line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [this.to, this.from,]
          }

        }
      })
      this.map.addLayer({
        id: 'line',
        type: 'line',
        source: 'line',
        layout: {
          "line-cap": 'round',
          "line-join": 'round'
        },
        paint: {
          "line-color": 'black',
          "line-width": 2
        }
      })
    }
    const removeLine = () => {
      this.map.removeLayer('line')
      this.map.removeSource('line')
    }
    this.marker.remove();
    calcDist();
    createLine();
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
