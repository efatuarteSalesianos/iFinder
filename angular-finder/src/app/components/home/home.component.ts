import { AuthService } from './../../services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Category } from './../../models/interfaces/category.interface';
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

const COLLECTION_LOST_OBJECTS = 'lost-objects';
const COLLECTION_FOUND_OBJECTS = 'found-objects';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  categories!: Observable<Category[]>;

  objectForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
    location: new FormControl('', Validators.required),
    category: new FormControl(),
    photo: new FormControl(),
    description: new FormControl('', [Validators.required, Validators.minLength(20), Validators.maxLength(200)]),
    estado: new FormControl('', Validators.required)
  });

  constructor(private firestore: AngularFirestore, private authService: AuthService) { }

  ngOnInit(): void {
    this.categories = this.firestore.collection<Category>('category').valueChanges();
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
}