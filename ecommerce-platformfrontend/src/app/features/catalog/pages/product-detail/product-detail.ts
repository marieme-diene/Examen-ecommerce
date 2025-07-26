import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../../../cart/services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail {
  product: Product | undefined;
  selectedImage: number = 0;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProductById(id).subscribe(prod => this.product = prod);
    this.selectedImage = 0;
  }

  selectImage(i: number) {
    this.selectedImage = i;
  }

  addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product);
      alert('Produit ajouté au panier !');
    }
  }
} 