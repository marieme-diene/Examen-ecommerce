import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { User, Address } from '../../models/user.model';
import { OrderService, OrderStatus } from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';
import { ProductService } from '../../../catalog/services/product.service';
import { Product } from '../../../catalog/models/product.model';
import { CartService } from '../../../cart/services/cart.service';

@Component({
  selector: 'app-account-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatDialogModule, MatIconModule],
  templateUrl: './account-home.html',
  styleUrl: './account-home.css'
})
export class AccountHome implements OnInit {
  user: User | null = null;
  editMode = false;
  name = '';
  email = '';
  orders: any[] = [];
  favorites: Product[] = [];
  isAdmin = false;
  message = '';
  addresses: Address[] = [];
  addressForm: Partial<Address> = {};
  editingAddressId: number | null = null;
  showAddressForm = false;

  constructor(
    private auth: AuthService,
    private orderService: OrderService,
    private router: Router,
    private notification: NotificationService,
    public dialog: MatDialog,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    if (this.user) {
      this.name = this.user.name;
      this.email = this.user.email;
      this.isAdmin = this.auth.isAdmin();
      this.addresses = this.auth.getAddressesForUser(this.user.id);
      
      if (this.isAdmin) {
        this.loadAdminData();
      } else {
        this.loadClientData();
      }
    }
  }

  enableEdit() {
    this.editMode = true;
    this.message = '';
  }

  saveProfile() {
    if (this.user) {
      this.user.name = this.name;
      this.user.email = this.email;
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(this.user));
      }
      this.auth['userSubject'].next(this.user); // force update
      this.editMode = false;
      this.message = 'Profil mis à jour !';
      // Note: NotificationService might not have a 'show' method, using message instead
      this.message = 'Profil mis à jour !';
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/account/login']);
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
    this.notification.showMessage(`${product.name} ajouté au panier !`, 'success');
  }

  async downloadInvoice(order: any) {
    try {
      // Import dynamique de jsPDF pour éviter les erreurs SSR
      const { jsPDF } = await import('jspdf');
      
      if (typeof window === 'undefined') {
        console.log('jsPDF ne peut pas être utilisé côté serveur');
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      let yPosition = 20;

      // En-tête
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('AFRIMARKET', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Facture', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Informations client
      doc.setFont('helvetica', 'bold');
      doc.text('Informations client:', margin, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`Nom: ${this.user?.name || 'N/A'}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Email: ${this.user?.email || 'N/A'}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Date: ${new Date(order.date).toLocaleDateString('fr-FR')}`, margin, yPosition);
      yPosition += 15;

      // Adresse de livraison
      if (order.address) {
        doc.setFont('helvetica', 'bold');
        doc.text('Adresse de livraison:', margin, yPosition);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        const addressLines = this.splitTextToFit(order.address, contentWidth);
        addressLines.forEach(line => {
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });
        yPosition += 10;
      }

      // Méthode de paiement
      if (order.payment) {
        doc.setFont('helvetica', 'bold');
        doc.text('Méthode de paiement:', margin, yPosition);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(order.payment, margin, yPosition);
        yPosition += 15;
      }

      // Tableau des produits
      doc.setFont('helvetica', 'bold');
      doc.text('Produits commandés:', margin, yPosition);
      yPosition += 10;

      // En-têtes du tableau
      const colWidths = [80, 30, 40, 40];
      const colX = [margin, margin + 80, margin + 110, margin + 150];
      
      doc.setFontSize(10);
      doc.text('Produit', colX[0], yPosition);
      doc.text('Qté', colX[1], yPosition);
      doc.text('Prix unit.', colX[2], yPosition);
      doc.text('Total', colX[3], yPosition);
      yPosition += 8;

      // Ligne de séparation
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Produits
      doc.setFont('helvetica', 'normal');
      order.items.forEach((item: any) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        const productName = this.splitTextToFit(item.name, colWidths[0]);
        doc.text(productName[0], colX[0], yPosition);
        doc.text(item.quantity.toString(), colX[1], yPosition);
        doc.text(`${item.price.toLocaleString('fr-FR')} FCFA`, colX[2], yPosition);
        doc.text(`${(item.quantity * item.price).toLocaleString('fr-FR')} FCFA`, colX[3], yPosition);
        yPosition += 8;
      });

      // Ligne de séparation
      yPosition += 5;
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Total
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${order.total.toLocaleString('fr-FR')} FCFA`, margin + 110, yPosition);
      yPosition += 20;

      // Pied de page
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Merci pour votre confiance !', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
      doc.text('AfriMarket - Votre marketplace africaine', pageWidth / 2, yPosition, { align: 'center' });

      // Générer un nom de fichier unique
      const timestamp = new Date().getTime();
      const filename = `facture_${order.id}_${timestamp}.pdf`;

      // Télécharger le PDF
      doc.save(filename);
      
      this.notification.showMessage('Facture téléchargée avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la génération de la facture:', error);
      this.notification.showMessage('Erreur lors de la génération de la facture', 'error');
    }
  }

  // Fonction utilitaire pour diviser le texte en lignes
  private splitTextToFit(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (testLine.length * 2.5 <= maxWidth) { // Estimation approximative
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  async testInvoiceGeneration() {
    try {
      // Import dynamique de jsPDF pour éviter les erreurs SSR
      const { jsPDF } = await import('jspdf');
      
      if (typeof window === 'undefined') {
        console.log('jsPDF ne peut pas être utilisé côté serveur');
        return;
      }

      // Simuler une commande de test
      const testOrder = {
        id: 999,
        date: new Date(),
        status: 'Test',
        total: 50000,
        items: [
          { name: 'Produit de test 1', quantity: 2, price: 15000 },
          { name: 'Produit de test 2', quantity: 1, price: 20000 }
        ],
        address: '123 Rue de Test, Ville Test, 12345',
        payment: 'Carte bancaire'
      };

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 20;

      // En-tête
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('AFRIMARKET - TEST', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Facture de test', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Informations
      doc.setFont('helvetica', 'bold');
      doc.text('Commande de test:', margin, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`ID: ${testOrder.id}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Date: ${testOrder.date.toLocaleDateString('fr-FR')}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Total: ${testOrder.total.toLocaleString('fr-FR')} FCFA`, margin, yPosition);
      yPosition += 15;

      // Produits
      doc.setFont('helvetica', 'bold');
      doc.text('Produits:', margin, yPosition);
      yPosition += 10;
      doc.setFont('helvetica', 'normal');
      
      testOrder.items.forEach((item: any) => {
        doc.text(`${item.name} - Qté: ${item.quantity} - Prix: ${item.price.toLocaleString('fr-FR')} FCFA`, margin, yPosition);
        yPosition += 8;
      });

      // Pied de page
      yPosition += 20;
      doc.setFontSize(8);
      doc.text('Ceci est une facture de test', pageWidth / 2, yPosition, { align: 'center' });

      // Télécharger
      const filename = `test_facture_${new Date().getTime()}.pdf`;
      doc.save(filename);
      
      this.notification.showMessage('Facture de test générée avec succès !', 'success');
    } catch (error) {
      console.error('Erreur lors de la génération de la facture de test:', error);
      this.notification.showMessage('Erreur lors de la génération de la facture de test', 'error');
    }
  }

  public openOrderDetail(order: any) {
    this.dialog.open(OrderDetailDialog, {
      width: '600px',
      data: { order, user: this.user }
    });
  }

  startAddAddress() {
    this.addressForm = {};
    this.editingAddressId = null;
    this.showAddressForm = true;
  }

  startEditAddress(addr: Address) {
    this.addressForm = { ...addr };
    this.editingAddressId = addr.id;
    this.showAddressForm = true;
  }

  saveAddress() {
    if (!this.user) return;
    const addr: Address = {
      id: this.editingAddressId ?? Date.now(),
      name: this.addressForm.name || '',
      street: this.addressForm.street || '',
      city: this.addressForm.city || '',
      postalCode: this.addressForm.postalCode || '',
      country: this.addressForm.country || '',
      phone: this.addressForm.phone || ''
    };
    if (this.editingAddressId) {
      this.auth.updateAddress(this.user.id, this.editingAddressId, addr);
    } else {
      this.auth.addAddress(this.user.id, addr);
    }
    this.addresses = this.auth.getAddressesForUser(this.user.id);
    this.addressForm = {};
    this.editingAddressId = null;
    this.showAddressForm = false;
  }

  cancelAddressForm() {
    this.addressForm = {};
    this.editingAddressId = null;
    this.showAddressForm = false;
  }

  deleteAddress(addrId: number) {
    if (!this.user) return;
    this.auth.deleteAddress(this.user.id, addrId);
    this.addresses = this.auth.getAddressesForUser(this.user.id);
  }

  // Admin methods
  updateOrderStatus(orderId: number, status: OrderStatus) {
    if (!this.user) return;
    this.orderService.updateOrderStatus(this.user.id, orderId, status).subscribe(() => {
      this.loadAdminData();
    });
  }

  cancelOrder(orderId: number) {
    if (!this.user) return;
    this.orderService.cancelOrder(orderId).subscribe(() => {
      this.loadAdminData();
    });
  }

  // Méthodes de test pour la navigation admin
  testAdminNavigation(route: string) {
    console.log('Tentative de navigation vers:', route);
    console.log('Utilisateur actuel:', this.user);
    console.log('Est admin:', this.isAdmin);
    
    this.router.navigate([route]).then(() => {
      console.log('Navigation réussie vers:', route);
    }).catch(err => {
      console.error('Erreur de navigation vers', route, ':', err);
    });
  }

  navigateToProducts() {
    this.testAdminNavigation('/admin/products');
  }

  navigateToCategories() {
    this.testAdminNavigation('/admin/categories');
  }

  navigateToUsers() {
    this.testAdminNavigation('/admin/users');
  }

  navigateToStats() {
    this.testAdminNavigation('/admin/stats');
  }

  loadClientData() {
    if (!this.user) return;
    
    // Charger les vraies commandes de l'utilisateur connecté
    this.orderService.getOrdersForUser(this.user.id).subscribe(orders => {
      this.orders = orders;
      console.log('Commandes chargées pour l\'utilisateur:', this.user?.id, orders);
      
      // Si aucune commande, afficher un message
      if (orders.length === 0) {
        this.notification.showMessage('Aucune commande trouvée. Vous pouvez maintenant créer vos propres commandes !', 'info');
      }
    });

    // Simuler les favoris du client
    this.productService.getProducts().subscribe(products => {
      this.favorites = products.slice(0, 3); // 3 premiers produits comme favoris
    });
  }

  loadAdminData() {
    // Les admins voient les données de gestion
    this.loadAllOrders();
  }

  loadAllOrders() {
    // Charger toutes les vraies commandes du site
    this.orderService.getAllOrders().subscribe(orders => {
      this.orders = orders;
      console.log('Toutes les commandes chargées:', orders);
    });
  }

  // Méthodes de test
  createTestOrder() {
    if (!this.user) return;
    
    const testOrder = {
      userId: this.user.id,
      clientEmail: this.user.email,
      total: 25000,
      items: [
        { productId: 1, name: 'Produit de test', quantity: 2, price: 12500 }
      ],
      address: 'Adresse de test',
      payment: 'Paiement à la livraison'
    };

    this.orderService.createOrder(testOrder).subscribe(newOrder => {
      console.log('Commande de test créée:', newOrder);
      this.loadClientData(); // Recharger les commandes
      this.notification.showMessage('Commande de test créée avec succès!', 'success');
    });
  }

  clearAllOrders() {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les commandes ?')) {
      this.orderService.ultraForceCleanup();
      this.loadClientData();
      this.notification.showMessage('Toutes les commandes ont été supprimées', 'info');
    }
  }

  cleanupOldOrders() {
    if (confirm('Voulez-vous nettoyer les anciennes commandes par défaut ?')) {
      try {
        // Récupérer toutes les commandes du localStorage
        const savedOrders = localStorage.getItem('afrimarket_orders');
        if (savedOrders) {
          const allOrders = JSON.parse(savedOrders);
          
          // Filtrer pour garder seulement les commandes qui ne sont pas userId: 2
          const filteredOrders = allOrders.filter((order: any) => order.userId !== 2);
          
          // Sauvegarder les commandes filtrées
          localStorage.setItem('afrimarket_orders', JSON.stringify(filteredOrders));
          
          console.log(`Nettoyage effectué: ${allOrders.length - filteredOrders.length} anciennes commandes supprimées`);
          
          // Recharger les données
          this.loadClientData();
          
          this.notification.showMessage(`Nettoyage réussi ! ${allOrders.length - filteredOrders.length} anciennes commandes supprimées.`, 'success');
        } else {
          this.notification.showMessage('Aucune commande trouvée dans le stockage.', 'info');
        }
      } catch (error) {
        console.error('Erreur lors du nettoyage:', error);
        this.notification.showMessage('Erreur lors du nettoyage des commandes', 'error');
      }
    }
  }

  debugOrders() {
    try {
      const savedOrders = localStorage.getItem('afrimarket_orders');
      if (savedOrders) {
        const allOrders = JSON.parse(savedOrders);
        console.log('=== DEBUG COMMANDES ===');
        console.log('Toutes les commandes dans localStorage:', allOrders);
        console.log('Commandes avec userId: 2 (anciennes):', allOrders.filter((order: any) => order.userId === 2));
        console.log('Commandes avec userId: 1 (votre compte):', allOrders.filter((order: any) => order.userId === 1));
        console.log('Commandes actuelles dans le composant:', this.orders);
        console.log('Utilisateur actuel:', this.user);
        console.log('========================');
        
        alert(`Debug terminé ! Vérifiez la console.\nTotal commandes: ${allOrders.length}\nAnciennes (userId: 2): ${allOrders.filter((order: any) => order.userId === 2).length}`);
      } else {
        alert('Aucune commande trouvée dans localStorage');
      }
    } catch (error) {
      console.error('Erreur debug:', error);
      alert('Erreur lors du debug');
    }
  }

  // Méthode pour supprimer TOUTES les commandes et repartir de zéro
  resetAllOrders() {
    if (confirm('ATTENTION ! Cela va supprimer TOUTES les commandes et repartir de zéro. Êtes-vous sûr ?')) {
      try {
        // Supprimer complètement les commandes du localStorage
        localStorage.removeItem('afrimarket_orders');
        
        // Vider le tableau des commandes
        this.orders = [];
        
        console.log('Toutes les commandes ont été supprimées !');
        
        this.notification.showMessage('Toutes les commandes supprimées ! Vous pouvez maintenant créer vos propres commandes.', 'success');
        
        // Recharger la page après 2 secondes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        this.notification.showMessage('Erreur lors de la suppression', 'error');
      }
    }
  }

  // Méthode de nettoyage forcé
  forceCleanup() {
    if (confirm('🚨 ATTENTION ! Cela va supprimer TOUTES les commandes et forcer un nettoyage complet. Êtes-vous sûr ?')) {
      try {
        // Appeler le nettoyage ultra-agressif du service
        this.orderService.ultraForceCleanup();
        
        // Vider aussi le tableau local
        this.orders = [];
        
        // Recharger les données
        this.loadClientData();
        
        console.log('🧹 NETTOYAGE FORCÉ EFFECTUÉ');
        this.notification.showMessage('Nettoyage forcé effectué ! Toutes les anciennes commandes supprimées.', 'success');
        
        // Recharger la page après 2 secondes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } catch (error) {
        console.error('Erreur lors du nettoyage forcé:', error);
        this.notification.showMessage('Erreur lors du nettoyage forcé', 'error');
      }
    }
  }

  // Méthode de nettoyage nucléaire
  nuclearCleanup() {
    if (confirm('💥 ATTENTION NUCLÉAIRE ! Cela va supprimer TOUTES les données de commandes de votre navigateur. Êtes-vous sûr ?')) {
      try {
        // Appeler le nettoyage ultra-agressif du service
        this.orderService.ultraForceCleanup();
        
        // Nettoyage manuel supplémentaire
        const allKeys = Object.keys(localStorage);
        const orderKeys = allKeys.filter(key => 
          key.toLowerCase().includes('order') || 
          key.toLowerCase().includes('commande') ||
          key.toLowerCase().includes('afrimarket')
        );
        
        orderKeys.forEach(key => {
          localStorage.removeItem(key);
          console.log(`💥 NUCLÉAIRE: Supprimé ${key}`);
        });
        
        // Vider le tableau local
        this.orders = [];
        
        console.log('💥 NETTOYAGE NUCLÉAIRE EFFECTUÉ');
        this.notification.showMessage('Nettoyage nucléaire effectué ! Toutes les anciennes commandes supprimées.', 'success');
        
        // Recharger la page après 2 secondes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
      } catch (error) {
        console.error('Erreur lors du nettoyage nucléaire:', error);
        this.notification.showMessage('Erreur lors du nettoyage nucléaire', 'error');
      }
    }
  }
}

@Component({
  selector: 'order-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Détails de la commande #{{ data.order.id }}</h2>
    <mat-dialog-content>
      <p><strong>Date:</strong> {{ data.order.date | date:'dd/MM/yyyy' }}</p>
      <p><strong>Statut:</strong> {{ data.order.status }}</p>
      <p><strong>Total:</strong> {{ data.order.total | currency:'FCFA':'symbol':'1.0-0':'fr' }}</p>
      <h3>Produits:</h3>
      <ul>
        <li *ngFor="let item of data.order.items">
          {{ item.name }} - Qté: {{ item.quantity }} - {{ item.price | currency:'FCFA':'symbol':'1.0-0':'fr' }}
        </li>
      </ul>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </mat-dialog-actions>
  `
})
export class OrderDetailDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<OrderDetailDialog>
  ) {}
}