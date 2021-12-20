import { AuthService } from './../../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Category } from './../../models/interfaces/category.interface';
import { Observable, of } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

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

  address: string = '';

  fundacionDonBoscoLatLng: google.maps.LatLngLiteral = {lat: 37.36133765325532, lng: -5.964321690581096};

  markerOptions: google.maps.MarkerOptions = {
    draggable: true
  };

  categories!: Observable<Category[]>;

  objectForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
    location: new FormControl('', Validators.required),
    category: new FormControl(),
    photo: new FormControl(),
    description: new FormControl('', [Validators.required, Validators.minLength(20), Validators.maxLength(200)]),
    estado: new FormControl('', Validators.required)
  });

  constructor(private firestore: AngularFirestore, private authService: AuthService, private httpClient: HttpClient) {
    this.apiLoaded = httpClient.jsonp('https://maps.googleapis.com/maps/api/js?key=AIzaSyByNlJfkMKkavCkpc9KMY0Wf5fASr4OOic', 'callback')
        .pipe(
          map(() => true),
          catchError(() => of(false)),
        );
   }

  ngOnInit(): void {
    this.categories = this.firestore.collection<Category>('categories').valueChanges();
  }

  register() {
    if(this.authService.isLogged()){
      if(this.objectForm.get('estado')?.value) {
        this.firestore.collection(COLLECTION_LOST_OBJECTS).doc().set({
          name: this.objectForm.get('name')?.value,
          location: this.objectForm.get('location')?.value,
          category: this.objectForm.get('category')?.value,
          photo: this.objectForm.get('photo')?.value,
          description: this.objectForm.get('description')?.value,
        })
    } else {
      this.firestore.collection(COLLECTION_FOUND_OBJECTS).doc().set({
        name: this.objectForm.get('name')?.value,
        location: this.objectForm.get('location')?.value,
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
    let addressSplited = this.objectForm.get('location')?.value.split(',');
    this.latlng = {lat: Number(addressSplited[0]), lng: Number(addressSplited[1])};
  }

  updateLocationMarker(event: google.maps.MapMouseEvent) {
    console.log(`${event.latLng?.lat()} , ${event.latLng?.lat()}`);
  }

}
