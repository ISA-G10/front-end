import { Component, OnInit } from '@angular/core';
import { Customer } from '../model/customer.model';
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import {
  CancelationModel,
  Reservation,
  ReservationStatus,
} from '../../reservation/model/reservation.model';
import { ReservationService } from '../../reservation/reservation.service';
import { ApplicationRef } from '@angular/core';
import { Role } from 'src/app/infrastructure/auth/model/user.model';

interface ExtendedReservation extends Reservation {
  isPast? : boolean;
  isCancelEnabled?: boolean;
  isCurrentReservation?: boolean;
}

@Component({
  selector: 'xp-customer-profile',
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css'],
})
export class CustomerProfileComponent implements OnInit {
  customer: Customer;
  userId: number;
  reservations: Reservation[] = [];
  sortReservationCriterium: string = '';
  reservationTypeSelected: string = '';
  role: Role;
  isCustomer: boolean = false;
  pastReservations: ExtendedReservation[] = [];
  futureReservations: ExtendedReservation[] = [];
  allReservations: ExtendedReservation[] = [];
  isCurrentReservation: boolean = false;
  shouldRenderForm: boolean = false;

  //shouldRenderUpdateForm: boolean = false;
  constructor(
    private service: UserService,
    private router: Router,
    private authService: AuthService,
    private reservationService: ReservationService,
    private appRef: ApplicationRef
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.user$.getValue().id;

    this.role = this.authService.user$.getValue().role;
    if (this.role.roles[0] == "ROLE_CUSTOMER"){
      this.isCustomer = true;
    }

    this.getReservations();
    this.userId = this.authService.user$.getValue().id;
    this.service.getCustomerById(this.userId).subscribe({
      next: (c: Customer) => {
        this.customer = c;
        this.reservationService.getUserReservations(this.userId).subscribe({
          next: (result: Reservation[]) => {
            this.reservations = result;
          },
        });
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  editProfile(): void {
    this.router.navigate(['/updateCustomerProfile/1']);
  }

  
  getReservations(): void {
    this.reservationService.getPastUserReservations(this.userId).subscribe({
      next: (reservations: ExtendedReservation[]) => {
        this.pastReservations = reservations;
        this.pastReservations.forEach(res => {
          res.isPast = true;
          res.isCancelEnabled = true;
        });
        this.combineReservations();
      }
    })
    this.reservationService.getUserReservations(this.userId).subscribe({
      next: (reservations: ExtendedReservation[]) => {
        this.futureReservations = reservations;
        this.futureReservations.forEach(res => {
          res.isPast = false;
          const reservationDate = this.parseDateTime(res.dateTime);
          const currentDate = new Date();

          if (reservationDate.getMonth() == currentDate.getMonth() && reservationDate.getDay() == currentDate.getDay() && reservationDate.getHours() <= currentDate.getHours() && currentDate.getHours() <= reservationDate.getHours()+res.duration){ //&& reservationDate.getHours() <= currentDate.getHours() && currentDate.getHours() <= reservationDate.getHours()+res.duration){
            res.isCurrentReservation = true;
          }
          const timeDifferenceInHours = (reservationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);
          
          if (timeDifferenceInHours <= 24) {
            res.isCancelEnabled = false;
          }
          else {
            res.isCancelEnabled = true;
          }
        });
        this.combineReservations();
      }
    })
  }


  private combineReservations(): void {
    if (this.pastReservations && this.futureReservations) {
      this.allReservations = this.pastReservations.concat(this.futureReservations);
      // Alternatively: this.allReservations = [...this.pastReservations, ...this.futureReservations];
    }
  }

  formatDateAndTime(localDateTime: string | object): {
    date: string;
    time: string;
  } {
    if (typeof localDateTime === 'object' && localDateTime !== null) {
      localDateTime = localDateTime.toString();
    }

    const dateTimeParts = localDateTime.split(',');

    const [year, month, day, hours, minutes] = dateTimeParts;
    const dateString = `${year}-${month}-${day}`;
    var timeString = '';
    timeString = `${hours}:${minutes}`;

    return { date: dateString, time: timeString };
  }
  
  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }
  
  


  parseDateTime(localDateTime: string | object): Date {
    if (typeof localDateTime === 'object' && localDateTime !== null) {
        localDateTime = localDateTime.toString(); 
    }
    const dateArray = localDateTime.split(',').map(Number);
    const parsedDate = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3], dateArray[4]);
    return parsedDate;
}

  onSortReservationChange(): void{
    switch (this.sortReservationCriterium) {
      case 'sortDateN':
        this.allReservations.sort((a, b) => {
          const dateA = this.parseDateTime(a.dateTime);
          const dateB = this.parseDateTime(b.dateTime);
  
          return dateB.getTime() - dateA.getTime();
      });
      break;

      case 'sortDateO':
        this.allReservations.sort((a, b) => {
          const dateA = this.parseDateTime(a.dateTime);
          const dateB = this.parseDateTime(b.dateTime);
  
          return dateA.getTime() - dateB.getTime();
      });
      break;
   
      case 'sortPriceH':
        //this.pastReservations.sort((a, b) => a.grade - b.grade);
        break;
      case 'sortPriceL':
        //this.pastReservations.sort((a, b) => a. - b.someNumber);
        break;
      case 'sortDurationS':
        this.allReservations.sort((a, b) => a.duration - b.duration);
        break;
      case 'sortDurationL':
        this.allReservations.sort((a, b) => b.duration - a.duration);
        break;
      default:
        break;
    }
  }

  onTypeReservationChange() : void {
    switch (this.reservationTypeSelected) {
      case 'past':
        this.allReservations = this.pastReservations;
        break;
      case 'incoming':
        this.allReservations = this.futureReservations;
        break;
      case 'both':
        this.combineReservations();
        break;
      default:
        break;
    }
  }

  compareDates(dateA: Date, dateB: Date): number {
    const timeA = dateA.getTime();
    const timeB = dateB.getTime();
  
    return timeA - timeB;
  }


  cancelReservation(reservation: Reservation): void {
    const confirmCancel = confirm(
      'Are you sure you want to cancel this reservation?'
    );

    if (confirmCancel) {
      this.reservationService.cancelReservation(reservation).subscribe({
        next: (result: CancelationModel) => {
          console.log(result);
          this.customer.penaltyPoints = result.updatedPoints;
          const index = this.reservations.findIndex(
            (r) => r.id === result.reservationId
          );
          if (index !== -1) {
            this.reservations[index].status = ReservationStatus.Cancelled;
            this.appRef.tick();
          }
        },
        error: (error: any) => {
          console.error('Error canceling reservation:', error);
        },
      });
    }
  }

  closeForm(): void{
    this.shouldRenderForm = false;
  }

  apply(): void {
    //this.router.navigate(['/apply/', this.competitionId]);
    this.shouldRenderForm = true;
  }
}
