import { Component, OnInit, Input, OnDestroy, DoCheck, ElementRef } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataService } from '../data.service';
import { Observable } from "rxjs";
import { MealsService } from '../meals.service';
import { ToastrService } from 'ngx-toastr';
import { isNumeric } from 'rxjs/internal-compatibility';
@Component({
  selector: 'app-carth',
  templateUrl: './carth.component.html',
  styleUrls: ['./carth.component.css']
})
export class CarthComponent implements OnInit{

  closeResult: string;
  public carth: any;
  public menu$: Observable<any>;
  dat: any = [];
  public changed: any = [];
  public show: boolean = false;
  constructor(private modalService: NgbModal,
    private dataService: DataService,
    private meals: MealsService,
    private tostr: ToastrService,
    config: NgbTooltipConfig) { 
      
    }

  ngOnInit() {
  this.menu$ = this.dataService.getData();
  this.dat = this.menu$;
  }
  open(content) {
    this.modalService.open(content, { centered: true, ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  submit(data: any) {
    var state;
    console.log(data[0].amount)
    for(let item of data){
      console.log(isNaN(item.amount))
      if(item.amount == ''){
        state = 'empty';
      }
      
    }
    if(state == 'empty'){
      this.tostr.error("Porudzbina nije prosledjena", "Ispunite polje Količina")
    }
    else {
      this.meals.postOrder(data)
      .subscribe(
        () => {
          this.tostr.success("Porudzbina je uspešno prosledjena!")
        },
        (error) => {
         if(error.status == 401){
          this.tostr.error("Porudzbina nije prosledjena", "Prijavite se ponovo!")
         }else{
          this.tostr.error("Porudzbina nije prosledjena", "Došlo je do greške!")
         }
        }
      )
    }

  }

  emptyItem(id, element: HTMLTableRowElement){
    console.log(id)
    element.remove()
    this.dataService.deleteData(id)
  } 
  getIt(data: any, amount: HTMLInputElement){
    console.log(amount.accessKey)
    if(data.amount == ''){
      this.tostr.error("Unesite količinu jela")
    }
    else {
      var i = JSON.parse(data.position);
    var local = localStorage.getItem('cartItems');
    var parsed = JSON.parse(local);
    parsed[i].amount = data.amount;
    this.menu$ = parsed;
    localStorage.setItem('cartItems', JSON.stringify(parsed))
    this.show = false;
    this.tostr.success("Izmenili ste količinu jela: "+ data.name)
    }
    
  }
  showConfirm(elem: HTMLTableRowElement){
    this.show = true;
  }
  check(data, elem: HTMLInputElement){
    if(isNumeric(data.key) || data.key == 'Backspace'){
    }
    else{
      this.tostr.error("Količina mora biti broj")
    }
  }
  testIfNum(){
    console.log()
  }
}
