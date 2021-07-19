import {Component, OnDestroy, OnInit} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';
@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authStatusSub: Subscription;

  constructor(public authService: AuthService ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false; // if authStatus switches to false, set loader to false
      }
    );
  }
  onSignup(form: NgForm){
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createNewUser(form.value.email, form.value.password);
  }
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
