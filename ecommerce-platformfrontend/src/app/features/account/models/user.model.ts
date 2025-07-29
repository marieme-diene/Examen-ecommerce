export interface User {
  id: number;
  name: string;
  email: string;
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