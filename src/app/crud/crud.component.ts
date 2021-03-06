import { Component, OnInit, ViewChild, ElementRef, DoCheck, OnDestroy } from '@angular/core';
import { MealsService } from '../meals.service';
import { CrudService } from '../crud.service';
import { ResponseOptions } from '@angular/http';

import { CategoriesService } from '../categories/categories-service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgbPaginationConfig } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
import { Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { subscribeOn } from 'rxjs-compat/operator/subscribeOn';
import { resolve } from 'path';
import { RestaurantService } from '../restaurant.service';


@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.css']
})
export class CrudComponent implements OnInit, DoCheck, OnDestroy {
  term: string = '';
  edit: boolean = true;
  confirmBtn: boolean = false;
  editBtn: boolean = true;
  deleteBtn: boolean = true;

  addNewMeal: boolean = false;
  offset: number = 0;
  status: number;

  closeResult: string;

  modalName: string;
  modalDeleteId: any;
  page: number = 1;

  i: number = 0;
  a: number = 0;
  public data = [];
  newData: any = [];
  cate: any = [];
  pageNumToCompare: number = 1;
  currentPage: number;
  selectedFile: File = null;
  numberOfPages: number;
  uploadProgress: Observable<number>;
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  precentageOfUpload: any;
  uploadMsg: string;
  uploadSubscribe: Subscription;
  imageUrl: Observable<any>;
  linkOfImage: any;
  uploadImgEdit: boolean;
  @ViewChild('selectedRow') row: ElementRef;

  config = {
    displayKey:"name",
    search:true,
    height: '300px',
    placeholder:'Restoran',
    noResultsFound: 'Nema rezultata',
    searchPlaceholder:'Pretraga'
  };

  dataModel
  dataModelEdit
  dropdownOptions = [];  

  selectShow = false;

  constructor(public meals: MealsService,
    public crud: CrudService,
    public responseOptions: ResponseOptions,
    public cat: CategoriesService,
    public tostr: ToastrService,
    private modalService: NgbModal,
    private afStorage: AngularFireStorage,
    private res: RestaurantService) {
  }
  ngOnInit() {   
    this.getRestaurants()

    this.meals.getMeals(this.offset)
      .subscribe(
        (res: Response[]) => {
          this.data = res;
          this.numberOfPages = this.data[0].numberOfMeals;
          console.log(res)
          for (let item of this.data) {
            if (item.piece == false) {
              item.piece = 'komad';
            }
            else if (item.piece == true) {
              item.piece = 'gram'
            }
          }
        },
        (err) => {
          alert("Nije mogce prikazati jela" + err)
        }
      )
    this.cat.getCategories()
      .subscribe(
        (res: Response) => {
          this.cate = res;
        },
        (error) => {
          this.tostr.error('Došlo je do greške!');
        }
      )
  }
  ngDoCheck() {
    this.currentPage = this.page;
  }
  onFileSelected(event, button: HTMLButtonElement) {
    console.log(button)
    this.uploadMsg = 'Slika se postavlja!';
    button.disabled = true;
    this.selectedFile = event.target.files[0];
    const id = Math.random().toString(36).substring(2);
    this.ref = this.afStorage.ref(id);
    this.task = this.ref.put(this.selectedFile);
    this.uploadProgress = this.task.percentageChanges();
    this.uploadSubscribe = this.uploadProgress
      .subscribe(
        (res) => {
          let num = Math.round(res);
          this.precentageOfUpload = num + "%";
          if (this.precentageOfUpload == '100%') {
            this.uploadMsg = 'Slika je uspešno postavljena!';
            this.imageUrl = this.ref.getDownloadURL();
            this.imageUrl
              .subscribe(
                (res) => {
                  this.linkOfImage = res;
                  console.log(this.linkOfImage)
                  button.disabled = false;
                },
                (error) => {
                  alert("Pokusajte ponovo!");
                }
              )
          }
        },
        (error) => {
          this.uploadMsg = 'Došlo je do greške, pokušajte ponovo!'
        })

  }
  pageNum() {
    setTimeout(() => {
      this.offset = this.page * 10;
      this.moreMeals()
    }, 50);
    // var now = event.toElement.innerText[0];
    // now = Number(now);
    // if (event.toElement.innerText == '«') {
    //   this.pageNumToCompare = this.pageNumToCompare - 1;
    //   this.offset = this.offset - 10;
    //   this.moreMeals();
    // }
    // if (event.toElement.innerText == '««') {
    //   this.pageNumToCompare = 1;
    //   this.offset = 0;
    //   this.moreMeals();
    // }
    // if (event.toElement.innerText == '»') {
    //   this.pageNumToCompare = this.pageNumToCompare + 1;
    //   this.offset = this.offset + 10;
    //   this.moreMeals();
    // }
    // if (event.toElement.innerText == '»»') {
    //   this.pageNumToCompare = this.numberOfPages;
    //   let e = this.numberOfPages / 10;
    //   let p = Math.round(e);
    //   this.pageNumToCompare = p + 1;
    //   this.offset = 10 * p;
    //   this.moreMeals();
    // }
    // else {
    //   if (now > this.pageNumToCompare) {
    //     this.pageNumToCompare = now;
    //     var temp = now - 1;
    //     this.offset = 10 * temp;
    //     this.moreMeals();
    //   } else if (now < this.pageNumToCompare) {
    //     var passed = this.pageNumToCompare - now;
    //     passed = 10 * passed;
    //     this.offset = this.offset - passed;
    //     this.pageNumToCompare = now;
    //     this.moreMeals();
    //   }
    //   else if (this.pageNumToCompare == now) {

    //   }
    // }
  }
  open(content, name, id) {
    this.modalName = name;
    this.modalDeleteId = id;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  openAdd(content) {
    this.modalService.open(content, { size: 'lg', ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
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
  addMeal() {
    this.i++;
    if (this.i <= 1) {
      this.addNewMeal = true;
    }
    else {
      this.addNewMeal = false;
      this.i = 0;

    }
  }
  editMeal(n: any, p: any, c: any, url: any, mes: any, na: any, pr: any, co: any, ur: any, me: any, res: any) {
    this.a++;
    if (this.a <= 1) {
      n.hidden = false;
      p.hidden = false;
      c.hidden = false;
      url.hidden = false;
      mes.hidden = false
      na.hidden = true;
      pr.hidden = true;
      co.hidden = true;
      ur.hidden = true;
      me.hidden = true;
      res.hidden = true;
      this.selectShow = true;
      this.confirmBtn = true;
      this.uploadImgEdit = true;
    }
    else {
      n.hidden = true;
      p.hidden = true;
      c.hidden = true;
      url.hidden = true;
      mes.hidden = true
      na.hidden = false;
      pr.hidden = false;
      co.hidden = false;
      ur.hidden = false;
      me.hidden = false;
      res.hidden = false;
      this.selectShow = false;
      this.confirmBtn = false;
      this.uploadImgEdit = false;
      this.a = 0;
    }

  }
  confirm(n: any, p: any, c: any, mes: any, id: any, url: any, na: any, pr: any, co: any, ur: any, me: any, res: any) {
    
    n.hidden = true;
    p.hidden = true;
    c.hidden = true;
    mes.hidden = true;
    url.hidden = true;
    na.hidden = false;
    pr.hidden = false;
    co.hidden = false;
    ur.hidden = false;
    me.hidden = false;
    res.hidden = false;
    this.selectShow = false;
    this.confirmBtn = false;
    this.crud.editMeal({
      category: {
        category_id: c.value
      },
      name: n.value,
      price: p.value,
      link: this.linkOfImage,
      piece: mes.value,
      restaurant: {
        id: this.dataModelEdit.id
      }
    }, id)
    this.uploadImgEdit = false;
    setTimeout(() => {
      this.dataModelEdit = null
    }, 200);
  }

  newMealData(name: any, price: any, category: any, url: any, measure: any) {
    if (name.value != "" && price.value != "", category.value != "" && this.linkOfImage != null && measure.value != "" && this.dataModel != null) {
      let data = {
        category: {
          category_id: category.value
        },
        name: name.value,
        price: price.value,
        link: this.linkOfImage,
        piece: measure.value,
        display: false,
        restaurant: {
          id: this.dataModel.id
        }
      }
      console.log(data)
      this.crud.postMeal(data)
      this.tostr.success('Jelo je dodato!');
      setTimeout(() => {
        this.dataModel = null
      }, 200);
    } else {
      this.tostr.error('Ispunite sva polja!');
    }
  }
  deleteMeal(id: any) {
    this.crud.deleteMeal(id)
  }
  moreMeals() {
    this.meals.getMeals(this.offset)
      .subscribe(
        (res: Response[]) => {
          if (res == [] && this.data.length > 0) {
            this.tostr.info('Prikazali ste sva jela!')
          }
          this.data = res;
          for (let item of this.data) {
            if (item.piece == false) {
              item.piece = 'komad';
            }
            else if (item.piece == true) {
              item.piece = 'gram'
            }
          }
        },
        (error) => {
          this.tostr.error('Nije moguce prikazati jela!');
        }
      )
  }

  getRestaurants(){
    this.res.getRestaurants().subscribe(
      res => {
        console.log(res)
        this.dropdownOptions = res
      },
      err => {
        console.log(err)
      }
    )
  }

  ngOnDestroy() {
    // this.uploadSubscribe.unsubscribe()
  }
}
