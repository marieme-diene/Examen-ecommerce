import { Injectable } from '@angular/core';
import { Product } from '../../features/catalog/models/product.model';
import { User } from '../../features/admin/user.service';
import { Order } from '../../features/account/services/order.service';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DataValidatorService {

  constructor() { }

  /**
   * Valide la cohérence des données des produits
   */
  validateProducts(products: Product[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    products.forEach((product, index) => {
      // Validation du nom
      if (!product.name || product.name.trim().length < 2) {
        errors.push(`Produit ${index + 1}: Nom trop court ou manquant`);
      }

      // Validation du prix
      if (!product.price || product.price <= 0) {
        errors.push(`Produit ${product.name}: Prix invalide (${product.price})`);
      }

      // Validation du stock
      if (product.stock < 0) {
        errors.push(`Produit ${product.name}: Stock négatif (${product.stock})`);
      }

      // Validation des images
      if (!product.image) {
        errors.push(`Produit ${product.name}: Image principale manquante`);
      } else if (!this.isValidImageUrl(product.image)) {
        warnings.push(`Produit ${product.name}: URL d'image principale suspecte`);
      }

      // Validation des images multiples
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, imgIndex) => {
          if (!this.isValidImageUrl(img)) {
            warnings.push(`Produit ${product.name}: URL d'image ${imgIndex + 1} suspecte`);
          }
        });
      }

      // Validation de la description
      if (!product.description || product.description.trim().length < 5) {
        warnings.push(`Produit ${product.name}: Description courte`);
      }

      // Validation de la catégorie
      if (!product.category || product.category.trim().length === 0) {
        errors.push(`Produit ${product.name}: Catégorie manquante`);
      }

      // Validation de la marque
      if (!product.brand || product.brand.trim().length === 0) {
        errors.push(`Produit ${product.name}: Marque manquante`);
      }

      // Vérification du stock faible
      if (product.stock < 5 && product.stock > 0) {
        warnings.push(`Produit ${product.name}: Stock faible (${product.stock})`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valide la cohérence des données utilisateurs
   */
  validateUsers(users: User[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    users.forEach((user, index) => {
      // Validation du nom
      if (!user.name || user.name.trim().length < 2) {
        errors.push(`Utilisateur ${index + 1}: Nom trop court ou manquant`);
      }

      // Validation de l'email
      if (!user.email || !this.isValidEmail(user.email)) {
        errors.push(`Utilisateur ${user.name}: Email invalide (${user.email})`);
      }

      // Validation de la date d'inscription
      if (user.registrationDate && !this.isValidDate(user.registrationDate)) {
        warnings.push(`Utilisateur ${user.name}: Date d'inscription invalide`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valide la cohérence des commandes
   */
  validateOrders(orders: Order[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    orders.forEach((order, index) => {
      // Validation du total
      if (!order.total || order.total <= 0) {
        errors.push(`Commande ${order.id}: Total invalide (${order.total})`);
      }

      // Validation des items
      if (!order.items || order.items.length === 0) {
        errors.push(`Commande ${order.id}: Aucun produit dans la commande`);
      } else {
        order.items.forEach((item, itemIndex) => {
          if (!item.product || !item.quantity || item.quantity <= 0) {
            errors.push(`Commande ${order.id}: Item ${itemIndex + 1} invalide`);
          }
        });
      }

      // Validation de la date
      if (!order.date || !this.isValidDate(order.date)) {
        warnings.push(`Commande ${order.id}: Date invalide`);
      }

      // Validation du statut
      const validStatuses = ['En cours', 'Expédiée', 'Livrée', 'Annulée'];
      if (!order.status || !validStatuses.includes(order.status)) {
        warnings.push(`Commande ${order.id}: Statut suspect (${order.status})`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Vérifie si une URL d'image est valide
   */
  private isValidImageUrl(url: string): boolean {
    if (!url) return false;
    
    // Vérification basique des URLs Unsplash
    if (url.includes('unsplash.com')) {
      return url.includes('auto=format') && url.includes('fit=crop');
    }
    
    // Vérification des autres URLs
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Vérifie si un email est valide
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Vérifie si une date est valide
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Génère un rapport de validation complet
   */
  generateValidationReport(products: Product[], users: User[], orders: Order[]): string {
    const productValidation = this.validateProducts(products);
    const userValidation = this.validateUsers(users);
    const orderValidation = this.validateOrders(orders);

    let report = '=== RAPPORT DE VALIDATION DES DONNÉES ===\n\n';

    // Résumé
    report += `📊 RÉSUMÉ:\n`;
    report += `- Produits: ${productValidation.isValid ? '✅' : '❌'} (${productValidation.errors.length} erreurs, ${productValidation.warnings.length} avertissements)\n`;
    report += `- Utilisateurs: ${userValidation.isValid ? '✅' : '❌'} (${userValidation.errors.length} erreurs, ${userValidation.warnings.length} avertissements)\n`;
    report += `- Commandes: ${orderValidation.isValid ? '✅' : '❌'} (${orderValidation.errors.length} erreurs, ${orderValidation.warnings.length} avertissements)\n\n`;

    // Erreurs critiques
    if (productValidation.errors.length > 0 || userValidation.errors.length > 0 || orderValidation.errors.length > 0) {
      report += `🚨 ERREURS CRITIQUES:\n`;
      [...productValidation.errors, ...userValidation.errors, ...orderValidation.errors].forEach(error => {
        report += `- ${error}\n`;
      });
      report += '\n';
    }

    // Avertissements
    if (productValidation.warnings.length > 0 || userValidation.warnings.length > 0 || orderValidation.warnings.length > 0) {
      report += `⚠️ AVERTISSEMENTS:\n`;
      [...productValidation.warnings, ...userValidation.warnings, ...orderValidation.warnings].forEach(warning => {
        report += `- ${warning}\n`;
      });
      report += '\n';
    }

    // Statistiques
    report += `📈 STATISTIQUES:\n`;
    report += `- Total produits: ${products.length}\n`;
    report += `- Total utilisateurs: ${users.length}\n`;
    report += `- Total commandes: ${orders.length}\n`;
    report += `- Produits en rupture: ${products.filter(p => p.stock === 0).length}\n`;
    report += `- Produits stock faible: ${products.filter(p => p.stock < 5 && p.stock > 0).length}\n`;

    return report;
  }
} 