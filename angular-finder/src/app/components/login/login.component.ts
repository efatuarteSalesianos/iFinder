import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { User } from 'src/app/models/interfaces/user.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  userList!: Observable<User[]>;

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  login() {
    this.authService.login();
  }

}
