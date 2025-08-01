// src/app/shared/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    // Products
    getProducts() {
        return this.http.get(`${this.baseUrl}/products`);
    }

    // Categories
    getCategories() {
        return this.http.get(`${this.baseUrl}/categories`);
    }

    // Orders
    createOrder(orderData: any) {
        return this.http.post(`${this.baseUrl}/orders`, orderData);
    }

    // Auth
    login(credentials: any) {
        return this.http.post(`${this.baseUrl}/login`, credentials);
    }
}
