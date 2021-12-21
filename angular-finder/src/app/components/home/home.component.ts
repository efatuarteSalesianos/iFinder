import { AuthService } from './../../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Category } from './../../models/interfaces/category.interface';
import { Observable, of } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MapGeocoder } from '@angular/google-maps';

const COLLECTION_LOST_OBJECTS = 'lost-objects';
const COLLECTION_FOUND_OBJECTS = 'found-objects';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  apiLoaded: Observable<boolean>;

  latlng!: google.maps.LatLngLiteral;

  markerOptions: google.maps.MarkerOptions = {
    draggable: true
  };

  address = '';
  lat!: number;
  lng!: number;

  categories!: Observable<Category[]>;
  geocoder!: google.maps.Geocoder;

  objectForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
    location: new FormControl('', Validators.required),
    radio: new FormControl(),
    category: new FormControl(),
    photo: new FormControl(),
    description: new FormControl('', [Validators.required, Validators.minLength(20), Validators.maxLength(200)]),
    estado: new FormControl('', Validators.required)
  });

  constructor(private firestore: AngularFirestore, private authService: AuthService, private httpClient: HttpClient) {
    this.apiLoaded = httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=AIzaSyByNlJfkMKkavCkpc9KMY0Wf5fASr4OOic&libraries=geometry', 'callback')
        .pipe(
          map(() => true),
          catchError(() => of(false)),
        );
   }

  ngOnInit(): void {
    this.geocoder = new google.maps.Geocoder();
    this.categories = this.firestore.collection<Category>('categories').valueChanges();
  }

  register() {
    if(this.authService.isLogged()){
      if(this.objectForm.get('estado')?.value) {
        this.firestore.collection(COLLECTION_LOST_OBJECTS).doc().set({
          name: this.objectForm.get('name')?.value,
          location: this.objectForm.get('location')?.value,
          radio: this.objectForm.get('radio')?.value,
          category: this.objectForm.get('category')?.value,
          photo: this.objectForm.get('photo')?.value,
          description: this.objectForm.get('description')?.value,
        })
    } else {
      this.firestore.collection(COLLECTION_FOUND_OBJECTS).doc().set({
        name: this.objectForm.get('name')?.value,
        location: this.objectForm.get('location')?.value,
        radio: this.objectForm.get('radio')?.value,
        category: this.objectForm.get('category')?.value,
        photo: this.objectForm.get('photo')?.value,
        description: this.objectForm.get('description')?.value,
      })
    }
    } else {
      this.authService.login();
    }

  }

  searchAddress() {
    this.geocoder.geocode({
      address: this.objectForm.get('location')?.value
    }, (results, status) => {
      if(status == "OK" && results && results.length > 0) {
        this.latlng = {lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()};
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  updateLocationMarker(event: google.maps.MapMouseEvent) {
    /*let location =  `${event.latLng?.lat()}, ${event.latLng?.lng()}`;
    this.geocoder.geocode({
      address: location
    }).subscribe(({results}) => {
      this.address = results[0].formatted_address;
      this.objectForm.get('location')?.setValue(this.address);
    });*/
  }

}
