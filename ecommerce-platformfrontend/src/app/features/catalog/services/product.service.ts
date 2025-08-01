import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable, of, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ReviewService } from './review.service';

// Vérification de l'environnement
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private storageKey = 'products';
  private products: Product[] = [];

  constructor(private reviewService: ReviewService) {
    if (isBrowser) {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.products = JSON.parse(saved);
      } else {
        this.initializeProducts();
      }
    } else {
      // Côté serveur, initialiser directement
      this.initializeProducts();
    }
  }

  private initializeProducts() {
    this.products = [
      { id: 1, name: 'Smartphone X', description: 'Un super smartphone.', price: 499, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80', images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'
      ], longDescription: 'Le Smartphone X est doté d\'un écran AMOLED 6,5", 128Go de stockage, double SIM, batterie 5000mAh, et appareil photo 48MP. Idéal pour tous vos usages quotidiens, il combine performance et élégance.' , category: 'Électronique', stock: 10, brand: 'Samsung' },
      { id: 2, name: 'T-shirt stylé', description: 'Pour être à la mode.', price: 29, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', images: [
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80'
      ], longDescription: 'T-shirt 100% coton, coupe moderne, disponible en plusieurs tailles et coloris. Parfait pour un look décontracté ou sportif.', category: 'Mode', stock: 25, brand: 'Nike' },
      { id: 3, name: 'Aspirateur Pro', description: 'Pour une maison propre.', price: 199, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'], longDescription: 'Pour une maison propre. Aspirateur puissant, silencieux, idéal pour tous types de sols et tapis. Facile à utiliser et à entretenir.', category: 'Maison', stock: 8, brand: 'Deska' },
      { id: 4, name: 'Crème visage', description: 'Prenez soin de vous.', price: 15, image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80'], longDescription: 'Prenez soin de vous. Crème hydratante pour tous types de peaux, idéale pour une routine beauté quotidienne.', category: 'Beauté', stock: 30, brand: 'Nivea' },
      { id: 5, name: 'Ballon de foot', description: 'Pour les sportifs.', price: 25, image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80'], longDescription: 'Pour les sportifs. Ballon de football résistant, parfait pour les matchs entre amis ou en club.', category: 'Sport', stock: 12, brand: 'Adidas' },
      { id: 6, name: 'Roman captivant', description: 'Un livre à ne pas manquer.', price: 12, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80'], longDescription: 'Un livre à ne pas manquer. Roman passionnant, idéal pour s\'évader et découvrir de nouvelles histoires.', category: 'Livres', stock: 20, brand: 'Gallimard' },
      { id: 7, name: 'Montre connectée', description: 'Restez à l\'heure.', price: 99, image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80'], longDescription: 'Restez à l\'heure. Montre connectée avec suivi d\'activité, notifications et design moderne.', category: 'Électronique', stock: 15, brand: 'Samsung' },
      { id: 8, name: 'Chaussures running', description: 'Pour courir plus vite.', price: 59, image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80'], longDescription: 'Pour courir plus vite. Chaussures légères et confortables, idéales pour la course à pied.', category: 'Sport', stock: 18, brand: 'Nike' },
      { id: 9, name: 'Chaussures femme élégantes', description: 'Pour toutes vos occasions.', price: 75, image: 'https://images.unsplash.com/photo-1519748771451-a94c596fad67?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1519748771451-a94c596fad67?auto=format&fit=crop&w=400&q=80'], longDescription: 'Pour toutes vos occasions. Chaussures élégantes et confortables, parfaites pour les soirées ou le quotidien.', category: 'Chaussures femme', stock: 22, brand: 'Zara' },
      { id: 10, name: 'Serviette de bain douce', description: 'Confort et douceur après la douche.', price: 18, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80'], longDescription: 'Confort et douceur après la douche. Serviette ultra douce, absorbante et résistante.', category: 'Serviette', stock: 40, brand: 'Ikea' },
      { id: 11, name: 'Collier en or', description: 'Bijoux raffiné pour toutes.', price: 250, image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80'], longDescription: 'Bijoux raffiné pour toutes. Collier en or véritable, élégant et intemporel, parfait pour offrir ou se faire plaisir.', category: 'Bijoux', stock: 5, brand: 'Swarovski' },
      { id: 12, name: 'Table en bois massif', description: 'Robuste et élégante.', price: 320, image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=400&q=80'], longDescription: 'Robuste et élégante. Table en bois massif, idéale pour la salle à manger ou le salon.', category: 'Table', stock: 7, brand: 'Ikea' },
      { id: 13, name: 'Boucles d\'oreilles perle', description: 'Élégance discrète.', price: 60, image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'], longDescription: 'Élégance discrète. Boucles d\'oreilles en perle, raffinées et faciles à porter au quotidien.', category: 'Bijoux', stock: 12, brand: 'Swarovski' },
      { id: 14, name: 'Sac à main cuir', description: 'Chic et pratique.', price: 120, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80'], longDescription: 'Chic et pratique. Sac à main en cuir véritable, spacieux et élégant.', category: 'Mode', stock: 10, brand: 'Zara' },
      { id: 15, name: 'Chaussures femme sport', description: 'Confort et style.', price: 80, image: 'https://images.unsplash.com/photo-1519748771451-a94c596fad67?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1519748771451-a94c596fad67?auto=format&fit=crop&w=400&q=80'], longDescription: 'Confort et style. Chaussures de sport pour femme, parfaites pour l\'activité physique et la vie quotidienne.', category: 'Chaussures femme', stock: 15, brand: 'Nike' },
      { id: 16, name: 'Table basse design', description: 'Pour un salon moderne.', price: 210, image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=400&q=80'], longDescription: 'Pour un salon moderne. Table basse design, pratique et esthétique.', category: 'Table', stock: 9, brand: 'Ikea' },
      { id: 17, name: 'Serviette plage XXL', description: 'Idéale pour l\'été.', price: 22, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80'], longDescription: 'Idéale pour l\'été. Serviette de plage XXL, douce et absorbante.', category: 'Serviette', stock: 25, brand: 'Ikea' },
      { id: 18, name: 'Bracelet argent', description: 'Bijoux tendance.', price: 45, image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80'], longDescription: 'Bijoux tendance. Bracelet en argent, moderne et élégant.', category: 'Bijoux', stock: 8, brand: 'Swarovski' },
      { id: 19, name: 'Robe d\'été', description: 'Légère et colorée.', price: 55, image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80'], longDescription: 'Légère et colorée. Robe d\'été confortable, idéale pour les journées chaudes.', category: 'Mode', stock: 13, brand: 'Zara' },
      { id: 20, name: 'Chaussures femme soirée', description: 'Pour briller en soirée.', price: 95, image: 'https://images.unsplash.com/photo-1519748771451-a94c596fad67?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1519748771451-a94c596fad67?auto=format&fit=crop&w=400&q=80'], longDescription: 'Pour briller en soirée. Chaussures élégantes pour femme, parfaites pour les grandes occasions.', category: 'Chaussures femme', stock: 8, brand: 'Nike' },
      // Produits Samsung avec URLs Unsplash valides
      { id: 21, name: 'Samsung Galaxy A16', description: 'RAM 8Go, 128Go', price: 114900, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80', images: [
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'
      ], longDescription: 'RAM 8Go, 128Go. Smartphone performant, idéal pour le multitâche et le stockage de vos fichiers.', category: 'Électronique', stock: 20, brand: 'Samsung' },
      { id: 22, name: 'Samsung Galaxy A06', description: '6.7" - RAM 4Go, 64Go', price: 59900, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'], longDescription: '6.7" - RAM 4Go, 64Go. Grand écran et bonne autonomie pour un usage quotidien.', category: 'Électronique', stock: 15, brand: 'Samsung' },
      { id: 23, name: 'Tecno Spark 10', description: '128Go, 8Go RAM', price: 89900, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80'], longDescription: '128Go, 8Go RAM. Smartphone abordable et puissant, parfait pour les jeunes.', category: 'Électronique', stock: 18, brand: 'Tecno' },
      { id: 24, name: 'Tecno Camon 20', description: '256Go, 8Go RAM', price: 129900, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'], longDescription: '256Go, 8Go RAM. Appareil photo haute résolution et grande capacité de stockage.', category: 'Électronique', stock: 10, brand: 'Tecno' },
      { id: 25, name: 'Smart Technology Congélateur', description: '320L', price: 156900, image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80'], longDescription: '320L. Congélateur grande capacité, idéal pour les familles.', category: 'Électroménager', stock: 8, brand: 'Smart Technology' },
      { id: 26, name: 'Smart TV 43"', description: 'Full HD, USB, HDMI', price: 100000, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80'], longDescription: 'Full HD, USB, HDMI. Télévision connectée pour une expérience multimédia complète.', category: 'Électronique', stock: 12, brand: 'Deska' },
      { id: 27, name: 'Deska TV LED 32"', description: '32 pouces', price: 48900, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80'], longDescription: '32 pouces. TV LED compacte, idéale pour les petits espaces.', category: 'Électronique', stock: 10, brand: 'Deska' },
      { id: 28, name: 'Smart TV 55"', description: 'Ultra HD, Smart', price: 210000, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80'], longDescription: 'Ultra HD, Smart. Grand écran et qualité d\'image exceptionnelle.', category: 'Électronique', stock: 7, brand: 'Smart Technology' },
      { id: 29, name: 'Deska Smart TV 43"', description: 'Full HD', price: 100000, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80'], longDescription: 'Full HD. Télévision intelligente, parfaite pour le streaming et les jeux.', category: 'Électronique', stock: 8, brand: 'Deska' },
      { id: 30, name: 'Tecno Pop 7', description: '64Go, 4Go RAM', price: 49900, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'], longDescription: '64Go, 4Go RAM. Smartphone d\'entrée de gamme, fiable et pratique.', category: 'Électronique', stock: 20, brand: 'Tecno' },
      // Nouveaux produits Design Bois
      { id: 31, name: 'Chaise en bois massif', description: 'Chaise élégante en chêne', price: 45000, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80', images: [
        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80'
      ], longDescription: 'Chaise élégante en chêne massif, design moderne et confortable. Parfaite pour la salle à manger ou le bureau. Finition soignée et durable.', category: 'Mobilier', stock: 15, brand: 'Design Bois' },
      { id: 32, name: 'Étagère bibliothèque', description: 'Étagère 5 niveaux en bois', price: 75000, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80'], longDescription: 'Étagère bibliothèque 5 niveaux en bois massif, idéale pour organiser vos livres et décorations. Design épuré et fonctionnel.', category: 'Mobilier', stock: 8, brand: 'Design Bois' },
      { id: 33, name: 'Bureau en bois', description: 'Bureau de travail moderne', price: 120000, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80'], longDescription: 'Bureau de travail moderne en bois massif, avec tiroirs intégrés et design ergonomique. Parfait pour le télétravail.', category: 'Mobilier', stock: 6, brand: 'Design Bois' },
      { id: 34, name: 'Lit en bois', description: 'Lit double en chêne', price: 180000, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80'], longDescription: 'Lit double en chêne massif, design épuré et élégant. Avec tête de lit intégrée et finition soignée.', category: 'Mobilier', stock: 4, brand: 'Design Bois' },
      { id: 35, name: 'Commode 3 tiroirs', description: 'Commode en bois massif', price: 85000, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80'], longDescription: 'Commode 3 tiroirs en bois massif, parfaite pour la chambre. Design classique et fonctionnel avec poignées en laiton.', category: 'Mobilier', stock: 10, brand: 'Design Bois' },
      { id: 36, name: 'Table de chevet', description: 'Table de chevet en bois', price: 35000, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80'], longDescription: 'Table de chevet en bois massif, design moderne avec tiroir intégré. Parfaite pour compléter votre chambre.', category: 'Mobilier', stock: 12, brand: 'Design Bois' },
      { id: 37, name: 'Armoire à vêtements', description: 'Armoire en bois massif', price: 250000, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80'], longDescription: 'Armoire à vêtements en bois massif, grande capacité de rangement. Design classique avec miroir intégré.', category: 'Mobilier', stock: 3, brand: 'Design Bois' },
      { id: 38, name: 'Tabouret de bar', description: 'Tabouret en bois tourné', price: 28000, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80'], longDescription: 'Tabouret de bar en bois tourné, design moderne et confortable. Parfait pour votre cuisine ou bar.', category: 'Mobilier', stock: 20, brand: 'Design Bois' },
      { id: 39, name: 'Coffre à jouets', description: 'Coffre en bois pour enfants', price: 55000, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80'], longDescription: 'Coffre à jouets en bois massif, design adapté aux enfants avec couvercle sécurisé. Idéal pour ranger les jouets.', category: 'Mobilier', stock: 7, brand: 'Design Bois' },
      { id: 40, name: 'Porte-manteau', description: 'Porte-manteau en bois', price: 22000, image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80', images: ['https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=400&q=80'], longDescription: 'Porte-manteau en bois massif, design épuré avec 5 patères. Parfait pour l\'entrée ou la chambre.', category: 'Mobilier', stock: 15, brand: 'Design Bois' }
    ];
    
    if (isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.products));
    }
  }

  private save() {
    if (isBrowser) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.products));
    }
  }

  getProducts(): Observable<Product[]> {
    return this.reviewService.getReviews().pipe(
      map(reviews => {
        return this.products.map(product => {
          const productReviews = reviews.filter(review => review.productId === product.id);
          const averageRating = productReviews.length > 0 
            ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
            : 0;
          
          return {
            ...product,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: productReviews.length
          };
        });
      })
    );
  }

  getProductById(id: number): Observable<Product | undefined> {
    return of(this.products.find(p => p.id === id));
  }

  addProduct(product: Product) {
    this.products.unshift(product);
    this.save();
  }

  updateProduct(product: Product) {
    this.products = this.products.map(p => p.id === product.id ? product : p);
    this.save();
  }

  deleteProduct(id: number) {
    this.products = this.products.filter(p => p.id !== id);
    this.save();
  }
} 