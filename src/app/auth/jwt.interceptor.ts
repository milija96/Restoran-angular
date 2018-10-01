import {HttpRequest, HttpInterceptor, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import 'rxjs/add/operator/do';
import { AuthService } from "./auth.service";

import { Observable } from "rxjs";
import { Router } from "@angular/router";
export class JwtInteceptor implements HttpInterceptor{
    constructor(public auth: AuthService,
                public router: Router){}

    intercept(request: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>>{
        console.log("DSA")
        return next.handle(request).do((event: HttpEvent<any>) =>{
            if(event instanceof HttpRequest) {
               console.log("jwt intexte")
            }
        },(err: any) => {
            if(err instanceof HttpErrorResponse){
                if(err.status === 401){
                    console.log("jwt interceptor")
                    this.router.navigate(['/login'])
                }
            }
        });
    }
}