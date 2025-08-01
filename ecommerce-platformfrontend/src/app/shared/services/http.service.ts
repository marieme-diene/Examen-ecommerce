// src/app/shared/services/http.service.ts
import { Injectable } from '@angular/core';
import { api } from './api.service';

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    constructor() {}

    async get(url: string) {
        try {
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async post(url: string, data: any) {
        try {
            const response = await api.post(url, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
    // Ajoutez d'autres méthodes HTTP selon vos besoins
}
