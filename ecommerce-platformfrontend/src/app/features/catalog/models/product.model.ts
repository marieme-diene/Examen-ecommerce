export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[]; // Ajouté pour la galerie
  longDescription?: string; // Ajouté pour la fiche avancée
  category: string;
  stock: number;
  brand: string;
} 