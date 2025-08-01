export interface User {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: 'admin' | 'client';
}

export interface Address {
  id: number;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
} 