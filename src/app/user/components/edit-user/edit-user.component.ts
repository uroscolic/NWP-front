import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { UserEditModel, UserViewModel } from '../../../model/user-model';
import { UserService } from '../../../service/user.service';
import { NavigationComponent } from '../../../components/navigation/navigation.component';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NavigationComponent
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.css'
})
export class EditUserComponent implements OnInit, OnDestroy {

  subscriptions: Subscription[] = [];

  editFailed: boolean = false;
  isReadChecked: boolean = false;
  isCreateChecked: boolean = false;
  isDeleteChecked: boolean = false;
  isUpdateChecked: boolean = false;

  editForm!: FormGroup;
  errorMessages = {
    email: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Enter a valid email' }
    ],
    firstname: [
      { type: 'required', message: 'First name is required' },
      { type: 'minlength', message: 'First name must be at least 2 characters long' }
    ],
    lastname: [
      { type: 'required', message: 'Last name is required' },
      { type: 'minlength', message: 'Last name must be at least 2 characters long' }
    ]
  };
  errorMessage!: string;
  id: number = 0;

  constructor(private formBuilder: FormBuilder, private userService: UserService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const user = history.state.user;
    this.editForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      can_create: [false],
      can_read: [false],
      can_update: [false],
      can_delete: [false]
    });
    this.editForm.valueChanges.subscribe(values => {
      if ((values.can_create || values.can_update || values.can_delete) && !values.can_read) {
        this.editForm.patchValue({ can_read: true });
      }
    });
    this.setUserForEdit(user);
    this.resetData();
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      const changeEmail = this.editForm.value.email;
      const changeFirstname = this.editForm.value.firstname;
      const changeLastname = this.editForm.value.lastname
      const can_read = this.editForm.value.can_read;
      const can_create = this.editForm.value.can_create;
      const can_delete = this.editForm.value.can_delete;
      const can_update = this.editForm.value.can_update;

      const changePost: UserEditModel = {
        id: this.id,
        firstname: changeFirstname,
        lastname: changeLastname,
        username: changeEmail,
        can_create: can_create,
        can_read: can_read,
        can_delete: can_delete,
        can_update: can_update
      };
      console.log("changepost", changePost);
      this.subscriptions.push(this.userService.editUser(changePost)
        .subscribe(
          response => {
            if (response) {
              this.editFailed = false;
              this.editForm.reset();
              this.router.navigate(['/users']);
            } else {
              this.editFailed = true;
            }
          },
          error => {
            console.error('Error during changing:', error);
            this.errorMessage = 'Error changing user. Try again!';
            this.editFailed = true;
          }
        ));
    } else {
      this.editFailed = true;
    }
  }

  resetData() {
    this.editFailed = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      if (sub && !sub.closed) {
        sub.unsubscribe();
      }
    });
  }

  setUserForEdit(user: UserViewModel): void {
    this.id = user.id;
    this.editForm.controls['email'].setValue(user.username);
    this.editForm.controls['firstname'].setValue(user.firstname);
    this.editForm.controls['lastname'].setValue(user.lastname);
    this.editForm.controls['can_create'].setValue(user.can_create);
    this.editForm.controls['can_read'].setValue(user.can_read);
    this.editForm.controls['can_delete'].setValue(user.can_delete);
    this.editForm.controls['can_update'].setValue(user.can_update);
  }


}

