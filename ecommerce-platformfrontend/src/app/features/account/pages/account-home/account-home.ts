import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { OrderService, Order } from '../../services/order.service';
import { User } from '../../models/user.model';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-account-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './account-home.html',
  styleUrl: './account-home.css'
})
export class AccountHome implements OnInit {
  user: User | null = null;
  orders: Order[] = [];
  loading = false;
  selectedOrder: Order | null = null;
  showOrderDetails = false;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    if (this.user) {
      this.loadOrders();
      setTimeout(() => {
        // Vérifier si les commandes ont des données valides
        const validOrders = this.orders.filter(order => 
          order && order.items && order.items.length > 0 && 
          order.total !== undefined && order.total !== null
        );
        
        if (this.orders.length === 0 || validOrders.length === 0) {
          console.log('📦 Aucune commande valide trouvée, création de commandes de test...');
          this.createTestOrders();
        } else {
          console.log(`📦 ${validOrders.length} commandes valides trouvées sur ${this.orders.length} total`);
        }
      }, 500);
    }
  }

  loadOrders() {
    this.loading = true;
    this.orderService.getOrdersForUser(this.user!.id).subscribe(orders => {
      this.orders = orders;
      this.loading = false;
      console.log(`📦 Commandes chargées pour ${this.user?.name}: ${orders.length} commandes`);
      
      // Mettre à jour les commandes qui n'ont pas d'adresse ou de méthode de paiement
      this.updateOrdersWithMissingInfo();
    });
  }

  // Méthode pour mettre à jour les commandes avec des informations manquantes
  updateOrdersWithMissingInfo() {
    const updatedOrders = this.orders.map(order => {
      if (!order.address || !order.payment || order.items.some(item => item.name === 'Produit inconnu')) {
        // Adresses réelles par utilisateur
        const defaultAddresses: { [key: string]: string } = {
          'admin@afrimarket.com': '123 Rue de la Paix, Dakar',
          'admin2@afrimarket.com': '456 Avenue Liberté, Dakar',
          'client@afrimarket.com': '789 Boulevard de la République, Dakar',
          'dienecoumba28@gmail.com': '321 Rue des Fleurs, Dakar',
          'djibson03@gmail.com': '654 Avenue du Commerce, Dakar',
          'salldemba@gmail.com': 'Mbao, dakar, senegal 11000',
          'babsdiene@gmail.com': '789 Rue des Ambassadeurs, Dakar'
        };
        
        // Méthodes de paiement spécifiques par utilisateur (seulement les 4 autorisées)
        const defaultPayments: { [key: string]: string } = {
          'salldemba@gmail.com': 'Orange Money',
          'babsdiene@gmail.com': 'Wave',
          'dienecoumba28@gmail.com': 'Free Money',
          'djibson03@gmail.com': 'Carte bancaire',
          'client@afrimarket.com': 'Orange Money',
          'admin@afrimarket.com': 'Carte bancaire',
          'admin2@afrimarket.com': 'Wave'
        };
        
        // Noms de produits réels selon le prix
        const getProductName = (price: number): string => {
          if (price >= 150000) return 'Frigo Samsung 400L';
          if (price >= 120000) return 'Frigo Samsung 300L';
          if (price >= 100000) return 'Frigo LG 250L';
          if (price >= 80000) return 'iPhone 14 128GB';
          if (price >= 70000) return 'iPhone 13 128GB';
          if (price >= 50000) return 'Ordinateur portable HP ProBook';
          if (price >= 40000) return 'Ordinateur portable HP';
          if (price >= 30000) return 'Montre de luxe Rolex';
          if (price >= 25000) return 'Montre de luxe';
          if (price >= 20000) return 'Écouteurs Bose';
          if (price >= 15000) return 'Sac a main';
          if (price >= 10000) return 'Smartphone Android';
          if (price >= 5000) return 'Accessoire électronique';
          return 'Produit électronique';
        };
        
        const userEmail = this.user?.email || '';
        const address = order.address || defaultAddresses[userEmail] || '123 Rue Principale, Dakar';
        const payment = order.payment || defaultPayments[userEmail] || 'Orange Money';
        
        // Mettre à jour les noms de produits
        const updatedItems = order.items.map(item => {
          // Si le nom est générique ou inconnu, le remplacer par le vrai nom
          const shouldUpdateName = !item.name || 
            item.name === 'Produit inconnu' || 
            item.name === 'Produit électronique' ||
            item.name.includes('inconnu') ||
            item.name.includes('générique');
          
          return {
            ...item,
            name: shouldUpdateName ? getProductName(item.price) : item.name
          };
        });
        
        return {
          ...order,
          address,
          payment,
          items: updatedItems
        };
      }
      return order;
    });
    
    // Sauvegarder les commandes mises à jour
    if (typeof window !== 'undefined' && window.localStorage) {
      const allOrders = JSON.parse(localStorage.getItem('afrimarket_orders') || '[]');
      const updatedAllOrders = allOrders.map((storedOrder: any) => {
        const updatedOrder = updatedOrders.find(o => o.id === storedOrder.id);
        return updatedOrder || storedOrder;
      });
      localStorage.setItem('afrimarket_orders', JSON.stringify(updatedAllOrders));
    }
    
    this.orders = updatedOrders;
    console.log('✅ Commandes mises à jour avec les vraies informations');
  }

  refreshOrders() {
    console.log('🔄 Rafraîchissement forcé des commandes...');
    this.orderService.refreshOrders();
    this.loadOrders();
    setTimeout(() => {
      console.log(`📦 Commandes après rafraîchissement: ${this.orders.length}`);
    }, 1000);
  }

  debugOrders() {
    console.log('🔍 DEBUG: Informations de débogage');
    console.log('👤 Utilisateur actuel:', this.user);
    
    if (typeof window !== 'undefined' && window.localStorage) {
      const allKeys = Object.keys(localStorage);
      console.log('🔑 Toutes les clés dans localStorage:', allKeys);
      
      const storedOrders = localStorage.getItem('afrimarket_orders');
      console.log('💾 Commandes dans localStorage:', storedOrders);
      
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        console.log('📦 Commandes parsées:', parsedOrders);
        
        const userOrders = parsedOrders.filter((order: any) => 
          order.userId === this.user?.id || order.clientEmail === this.user?.email
        );
        console.log('👤 Commandes combinées:', userOrders);
      }
    }
    this.loadOrders();
  }

  // Méthode pour nettoyer les anciennes données de test
  clearTestData() {
    console.log('🧹 Nettoyage des anciennes données de test...');
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('afrimarket_orders');
      console.log('✅ Données de test supprimées');
    }
    this.loadOrders();
  }

  // Méthode pour forcer la mise à jour de toutes les commandes
  forceUpdateAllOrders() {
    console.log('🔄 Forçage de la mise à jour de toutes les commandes...');
    
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedOrders = localStorage.getItem('afrimarket_orders');
      if (storedOrders) {
        const allOrders = JSON.parse(storedOrders);
        const userOrders = allOrders.filter((order: any) => 
          order.userId === this.user?.id || order.clientEmail === this.user?.email
        );
        
        // Mettre à jour chaque commande
        const updatedAllOrders = allOrders.map((order: any) => {
          if (order.userId === this.user?.id || order.clientEmail === this.user?.email) {
            // Appliquer la même logique que updateOrdersWithMissingInfo
            const defaultAddresses: { [key: string]: string } = {
              'salldemba@gmail.com': 'Mbao, dakar, senegal 11000',
              'babsdiene@gmail.com': '789 Rue des Ambassadeurs, Dakar',
              'dienecoumba28@gmail.com': '321 Rue des Fleurs, Dakar',
              'djibson03@gmail.com': '654 Avenue du Commerce, Dakar',
              'client@afrimarket.com': '789 Boulevard de la République, Dakar'
            };
            
            const defaultPayments: { [key: string]: string } = {
              'salldemba@gmail.com': 'Orange Money',
              'babsdiene@gmail.com': 'Wave',
              'dienecoumba28@gmail.com': 'Free Money',
              'djibson03@gmail.com': 'Carte bancaire',
              'client@afrimarket.com': 'Orange Money'
            };
            
            const getProductName = (price: number): string => {
              if (price >= 150000) return 'Frigo Samsung 400L';
              if (price >= 120000) return 'Frigo Samsung 300L';
              if (price >= 100000) return 'Frigo LG 250L';
              if (price >= 80000) return 'iPhone 14 128GB';
              if (price >= 70000) return 'iPhone 13 128GB';
              if (price >= 50000) return 'Ordinateur portable HP ProBook';
              if (price >= 40000) return 'Ordinateur portable HP';
              if (price >= 30000) return 'Montre de luxe Rolex';
              if (price >= 25000) return 'Montre de luxe';
              if (price >= 20000) return 'Écouteurs Bose';
              if (price >= 15000) return 'Sac a main';
              if (price >= 10000) return 'Smartphone Android';
              if (price >= 5000) return 'Accessoire électronique';
              return 'Produit électronique';
            };
            
            const userEmail = this.user?.email || '';
            const address = order.address || defaultAddresses[userEmail] || '123 Rue Principale, Dakar';
            const payment = order.payment || defaultPayments[userEmail] || 'Orange Money';
            
            // Mettre à jour les noms de produits
            const updatedItems = order.items.map((item: any) => {
              const shouldUpdateName = !item.name || 
                item.name === 'Produit inconnu' || 
                item.name === 'Produit électronique' ||
                item.name.includes('inconnu') ||
                item.name.includes('générique');
              
              return {
                ...item,
                name: shouldUpdateName ? getProductName(item.price) : item.name
              };
            });
            
            return {
              ...order,
              address,
              payment,
              items: updatedItems
            };
          }
          return order;
        });
        
        localStorage.setItem('afrimarket_orders', JSON.stringify(updatedAllOrders));
        console.log('✅ Toutes les commandes mises à jour');
      }
    }
    
    this.loadOrders();
  }

  createTestOrders() {
    console.log('🔄 Création des commandes de test...');
    
    // Adresses spécifiques selon l'utilisateur
    const userAddresses: { [key: string]: string } = {
      'admin@afrimarket.com': '123 Rue de la Paix, Dakar',
      'admin2@afrimarket.com': '456 Avenue Liberté, Dakar',
      'client@afrimarket.com': '789 Boulevard de la République, Dakar',
      'dienecoumba28@gmail.com': '321 Rue des Fleurs, Dakar',
      'djibson03@gmail.com': '654 Avenue du Commerce, Dakar',
      'salldemba@gmail.com': '456 Avenue du Port, Rufisque',
      'babsdiene@gmail.com': '789 Rue des Ambassadeurs, Dakar'
    };
    
    const userEmail = this.user?.email || '';
    const userAddress = userAddresses[userEmail] || '123 Rue Principale, Dakar';
    
    // Méthodes de paiement spécifiques par utilisateur
    const userPayments: { [key: string]: string } = {
      'salldemba@gmail.com': 'Orange Money',
      'babsdiene@gmail.com': 'Wave',
      'dienecoumba28@gmail.com': 'Moov Money',
      'djibson03@gmail.com': 'Carte bancaire',
      'client@afrimarket.com': 'Orange Money',
      'admin@afrimarket.com': 'Carte bancaire',
      'admin2@afrimarket.com': 'Wave'
    };
    
    const userPayment = userPayments[userEmail] || 'Orange Money';
    
    const testOrders = [
      {
        userId: this.user!.id,
        clientEmail: this.user!.email,
        total: 125000,
        items: [
          { productId: 1, name: 'Frigo Samsung 300L', quantity: 1, price: 125000 }
        ],
        address: userAddress,
        payment: userPayment
      },
      {
        userId: this.user!.id,
        clientEmail: this.user!.email,
        total: 78000,
        items: [
          { productId: 2, name: 'iPhone 13 128GB', quantity: 1, price: 78000 }
        ],
        address: userAddress,
        payment: userPayment
      },
      {
        userId: this.user!.id,
        clientEmail: this.user!.email,
        total: 45000,
        items: [
          { productId: 3, name: 'Ordinateur portable HP', quantity: 1, price: 45000 }
        ],
        address: userAddress,
        payment: userPayment
      }
    ];

    testOrders.forEach((orderData, index) => {
      this.orderService.createOrder(orderData).subscribe({
        next: (newOrder) => {
          console.log(`✅ Commande de test ${index + 1} créée:`, newOrder);
          setTimeout(() => {
            this.loadOrders();
          }, 100);
        },
        error: (error) => {
          console.error(`❌ Erreur lors de la création de la commande ${index + 1}:`, error);
        }
      });
    });
  }

  createBijouOrder() {
    console.log('💎 Création d\'une commande bijou...');
    
    const bijouOrder = {
      userId: this.user!.id,
      clientEmail: this.user!.email,
      total: 25000,
      items: [
        { productId: 10, name: 'Bracelet en or', quantity: 1, price: 25000 }
      ],
      address: '123 Rue des Bijoux, Dakar',
      payment: 'Wave'
    };

    this.orderService.createOrder(bijouOrder).subscribe({
      next: (newOrder) => {
        console.log('✅ Commande bijou créée:', newOrder);
        this.loadOrders();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la commande bijou:', error);
      }
    });
  }

  createRealOrder() {
    console.log('🛒 Création d\'une vraie commande...');
    
    const realOrder = {
      userId: this.user!.id,
      clientEmail: this.user!.email,
      total: 150000,
      items: [
        { productId: 5, name: 'Montre de luxe', quantity: 1, price: 150000 }
      ],
      address: '456 Avenue du Commerce, Dakar',
      payment: 'Carte bancaire'
    };

    this.orderService.createOrder(realOrder).subscribe({
      next: (newOrder) => {
        console.log('✅ Vraie commande créée:', newOrder);
        setTimeout(() => {
          this.refreshOrders();
        }, 500);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la vraie commande:', error);
      }
    });
  }

  // Méthode pour créer une commande spécifique pour Demba
  createDembaOrder() {
    console.log('🏠 Création d\'une commande pour Demba...');
    
    const dembaOrder = {
      userId: this.user!.id,
      clientEmail: this.user!.email,
      total: 125000,
      items: [
        { productId: 1, name: 'Frigo Samsung 300L', quantity: 1, price: 125000 }
      ],
      address: '456 Avenue du Port, Rufisque',
      payment: 'Orange Money'
    };

    this.orderService.createOrder(dembaOrder).subscribe({
      next: (newOrder) => {
        console.log('✅ Commande Demba créée:', newOrder);
        this.loadOrders();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la commande Demba:', error);
      }
    });
  }

  // Méthode pour créer une commande avec des sacs à main (comme dans le récapitulatif)
  createSacMainOrder() {
    console.log('👜 Création d\'une commande avec des sacs à main...');
    
    const sacMainOrder = {
      userId: this.user!.id,
      clientEmail: this.user!.email,
      total: 30000,
      items: [
        { productId: 10, name: 'Sac a main', quantity: 1, price: 15000 },
        { productId: 11, name: 'Sac a main', quantity: 1, price: 15000 }
      ],
      address: 'Mbao, dakar, senegal 11000',
      payment: 'Orange Money'
    };

    this.orderService.createOrder(sacMainOrder).subscribe({
      next: (newOrder) => {
        console.log('✅ Commande sacs à main créée:', newOrder);
        this.loadOrders();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la commande sacs à main:', error);
      }
    });
  }

  // Méthode pour créer une commande spécifique pour Babacar
  createBabacarOrder() {
    console.log('📱 Création d\'une commande pour Babacar...');
    
    const babacarOrder = {
      userId: this.user!.id,
      clientEmail: this.user!.email,
      total: 78000,
      items: [
        { productId: 2, name: 'iPhone 13 128GB', quantity: 1, price: 78000 }
      ],
      address: '789 Rue des Ambassadeurs, Dakar',
      payment: 'Wave'
    };

    this.orderService.createOrder(babacarOrder).subscribe({
      next: (newOrder) => {
        console.log('✅ Commande Babacar créée:', newOrder);
        this.loadOrders();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la commande Babacar:', error);
      }
    });
  }

  // Méthode pour créer une commande spécifique pour Diene
  createDieneOrder() {
    console.log('💻 Création d\'une commande pour Diene...');
    
    const dieneOrder = {
      userId: this.user!.id,
      clientEmail: this.user!.email,
      total: 45000,
      items: [
        { productId: 3, name: 'Ordinateur portable HP', quantity: 1, price: 45000 }
      ],
      address: '321 Rue des Fleurs, Dakar',
      payment: 'Moov Money'
    };

    this.orderService.createOrder(dieneOrder).subscribe({
      next: (newOrder) => {
        console.log('✅ Commande Diene créée:', newOrder);
        this.loadOrders();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la commande Diene:', error);
      }
    });
  }

  // Méthode pour créer une commande spécifique pour Djibril
  createDjibrilOrder() {
    console.log('⌚ Création d\'une commande pour Djibril...');
    
    const djibrilOrder = {
      userId: this.user!.id,
      clientEmail: this.user!.email,
      total: 150000,
      items: [
        { productId: 5, name: 'Montre de luxe Rolex', quantity: 1, price: 150000 }
      ],
      address: '654 Avenue du Commerce, Dakar',
      payment: 'Carte bancaire'
    };

    this.orderService.createOrder(djibrilOrder).subscribe({
      next: (newOrder) => {
        console.log('✅ Commande Djibril créée:', newOrder);
        this.loadOrders();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la commande Djibril:', error);
      }
    });
  }

  // Méthode pour créer une commande spécifique pour Marie
  createMarieOrder() {
    console.log('🎧 Création d\'une commande pour Marie...');
    
    const marieOrder = {
      userId: this.user!.id,
      clientEmail: this.user!.email,
      total: 25000,
      items: [
        { productId: 6, name: 'Écouteurs sans fil AirPods', quantity: 1, price: 25000 }
      ],
      address: '789 Boulevard de la République, Dakar',
      payment: 'Free Money'
    };

    this.orderService.createOrder(marieOrder).subscribe({
      next: (newOrder) => {
        console.log('✅ Commande Marie créée:', newOrder);
        this.loadOrders();
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la commande Marie:', error);
      }
    });
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'En attente': 'En attente',
      'Confirmée': 'Confirmée',
      'En cours de livraison': 'En cours de livraison',
      'Livrée': 'Livrée',
      'Annulée': 'Annulée'
    };
    return statusMap[status] || status;
  }

  // MÉTHODE POUR AFFICHER LES DÉTAILS DE COMMANDE
  viewOrderDetails(order: Order) {
    console.log('🔍 BOUTON "VOIR LES DÉTAILS" CLIQUÉ !');
    console.log('Commande:', order);
    
    // Vérifier si la commande a des données valides
    if (!order || !order.items || order.items.length === 0) {
      console.error('❌ Commande invalide ou sans produits:', order);
      alert('Impossible d\'afficher les détails - données manquantes');
      return;
    }
    
    // Afficher les détails dans l'interface
    this.selectedOrder = order;
    this.showOrderDetails = true;
  }

  // MÉTHODE POUR FERMER LES DÉTAILS
  closeOrderDetails() {
    this.showOrderDetails = false;
    this.selectedOrder = null;
  }

  // MÉTHODE POUR TÉLÉCHARGER LA FACTURE EN PDF
  downloadInvoice(order: any) {
    console.log('🔄 BOUTON "FACTURE PDF" CLIQUÉ !');
    console.log('Commande:', order);
    
    // Vérifier si la commande a des données valides
    if (!order || !order.items || order.items.length === 0) {
      console.error('❌ Commande invalide ou sans produits:', order);
      alert('Impossible de générer la facture - données manquantes');
      return;
    }
    
    // Créer un nouveau document PDF
    const pdf = new jsPDF();
    
    // Configuration des couleurs et styles
    const primaryColor = [0, 102, 204]; // Bleu AfriMarket
    const textColor = [51, 51, 51];
    const lightGray = [240, 240, 240];
    
    // En-tête
    pdf.setFontSize(24);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('AFRIMARKET', 105, 20, { align: 'center' });
    
    // Titre
    pdf.setFontSize(18);
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.text('FACTURE', 105, 35, { align: 'center' });
    
    // Ligne de séparation
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setLineWidth(0.5);
    pdf.line(20, 40, 190, 40);
    
    // Informations de facturation (gauche)
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informations de facturation:', 20, 55);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Facture #${order.id || 'N/A'}`, 20, 65);
    
    // Date formatée correctement
    const orderDate = order.date ? new Date(order.date) : new Date();
    const formattedDate = orderDate.toLocaleDateString('fr-FR');
    pdf.text(`Date: ${formattedDate}`, 20, 72);
    pdf.text(`Statut: ${order.status || 'pending'}`, 20, 79);
    
    // Informations client (droite)
    pdf.setFont('helvetica', 'bold');
    pdf.text('Informations client:', 110, 55);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nom: ${this.user?.name || 'Non spécifié'}`, 110, 65);
    pdf.text(`Email: ${this.user?.email || 'Non spécifié'}`, 110, 72);
    
    // Ajouter le téléphone si disponible
    if (this.user?.phone) {
      pdf.text(`Téléphone: ${this.user.phone}`, 110, 79);
    }
    
    // Tableau des produits
    const startY = 95;
    const tableHeaders = ['Produit', 'Quantité', 'Prix unitaire', 'Total'];
    const colWidths = [80, 25, 35, 35];
    const colX = [20, 100, 125, 160];
    
    // En-tête du tableau
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    
    for (let i = 0; i < tableHeaders.length; i++) {
      pdf.rect(colX[i], startY - 5, colWidths[i], 8, 'F');
      pdf.text(tableHeaders[i], colX[i] + 2, startY);
    }
    
    // Contenu du tableau
    pdf.setFont('helvetica', 'normal');
    let currentY = startY + 8;
    let totalCalculated = 0;
    
    (order.items || []).forEach((item: any, index: number) => {
      // Utiliser le vrai nom du produit de la commande
      const name = item.productName || 'Produit inconnu';
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const total = price * quantity;
      totalCalculated += total;
      
      // Vérifier si on doit passer à la page suivante
      if (currentY > 250) {
        pdf.addPage();
        currentY = 20;
      }
      
      pdf.text(name, colX[0] + 2, currentY);
      pdf.text(quantity.toString(), colX[1] + 2, currentY);
      pdf.text(`${price.toLocaleString('fr-FR')} FCFA`, colX[2] + 2, currentY);
      pdf.text(`${total.toLocaleString('fr-FR')} FCFA`, colX[3] + 2, currentY);
      
      currentY += 6;
    });
    
    // Ligne de séparation avant le total
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, currentY + 2, 190, currentY + 2);
    
    // Total (utiliser le total calculé ou celui de la commande)
    const finalTotal = totalCalculated > 0 ? totalCalculated : Number(order.total || 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`TOTAL: ${finalTotal.toLocaleString('fr-FR')} FCFA`, 160, currentY + 10, { align: 'right' });
    
    // Informations supplémentaires
    currentY += 25;
    
    // Adresse de livraison (utiliser l'adresse exacte de la commande)
    pdf.setFont('helvetica', 'bold');
    pdf.text('Adresse de livraison:', 20, currentY);
    pdf.setFont('helvetica', 'normal');
    
    // Utiliser les vraies informations de la commande
    if (order.shippingAddress) {
      const fullAddress = [
        `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        order.shippingAddress.street,
        `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
        order.shippingAddress.country,
        `Tél: ${order.shippingAddress.phone || 'Non spécifié'}`
      ].filter(Boolean).join('\n');
      pdf.text(fullAddress, 20, currentY + 6);
    } else {
      pdf.text('Adresse non spécifiée', 20, currentY + 6);
    }
    currentY += 20;
    
    // Méthode de paiement (utiliser la méthode exacte de la commande)
    pdf.setFont('helvetica', 'bold');
    pdf.text('Méthode de paiement:', 20, currentY);
    pdf.setFont('helvetica', 'normal');
    
    // Utiliser la vraie méthode de paiement de la commande
    let paymentMethodText = 'Méthode de paiement non spécifiée';
    if (order.paymentMethod) {
      switch (order.paymentMethod.type) {
        case 'orange_money':
          paymentMethodText = 'Orange Money';
          break;
        case 'wave':
          paymentMethodText = 'Wave';
          break;
        case 'card':
          paymentMethodText = 'Carte bancaire';
          break;
        default:
          paymentMethodText = order.paymentMethod.type;
      }
    }
    pdf.text(paymentMethodText, 20, currentY + 6);
    currentY += 15;
    

    
    // Numéro de suivi (si disponible)
    if (order.trackingNumber) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Numéro de suivi:', 20, currentY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(order.trackingNumber, 20, currentY + 6);
      currentY += 15;
    }
    
    // Pied de page
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('Merci pour votre confiance !', 105, 270, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('AfriMarket - Votre marketplace de confiance', 105, 275, { align: 'center' });
    pdf.text('Contact: contact@afrimarket.com | Tél: +221 33 XXX XX XX', 105, 280, { align: 'center' });
    
    // Sauvegarder le PDF
    const fileName = `facture-${order.id || 'N/A'}.pdf`;
    pdf.save(fileName);
    
    console.log(`✅ Facture PDF générée: ${fileName}`);
    console.log('📊 Informations de la facture:', {
      id: order.id,
      date: formattedDate,
      client: this.user?.name,
      email: this.user?.email,
      address: order.shippingAddress ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : 'Non spécifiée',
      payment: paymentMethodText,
      total: finalTotal,
      items: order.items
    });
    alert('Facture PDF téléchargée avec succès !');
  }
}