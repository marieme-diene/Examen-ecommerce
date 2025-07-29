import { Component } from '@angular/core';

@Component({
  selector: 'app-order-page',
  standalone: true,
  template: `
    <div style="max-width: 900px; margin: 32px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px;">
      <h2 style="font-size:1.5rem; font-weight: bold; margin-bottom: 18px;">Passer une commande en quelques étapes :</h2>
      <p style="font-weight:bold; margin-top:18px;">Étape 1 : Parcourez et choisissez votre produit</p>
      <ul>
        <li>Parcourir le <b style="color:#2563eb">SITE WEB AFRIMARKET</b> ou utiliser la barre de recherche pour trouver le produit que vous souhaitez commander.</li>
        <li>Cliquez sur le produit pour voir plus d'informations et plus de détails</li>
      </ul>
      <p style="font-weight:bold; margin-top:18px;">Étape 2 : Ajouter le produit au panier</p>
      <ul>
        <li>Sélectionnez la quantité désirée du produit et cliquez sur le bouton "Acheter"</li>
        <li>Vérifiez les produits sur votre panier et passez à la caisse</li>
      </ul>
      <p style="font-weight:bold; margin-top:18px;">Étape 3 : Finaliser le paiement</p>
      <ul>
        <li>Renseignez votre adresse de livraison et choisissez un mode de paiement.</li>
        <li>Vérifiez les informations de votre commande et cliquez sur le bouton Passer la commande.</li>
      </ul>
      <p style="font-weight:bold; margin-top:18px;">Étape 4 : Confirmer et payer</p>
      <ul>
        <li>Confirmez les détails du paiement et terminez le processus de paiement.</li>
      </ul>
      <p style="font-weight:bold; margin-top:18px;">Étape 5 : Suivez votre commande</p>
      <ul>
        <li>Vous recevrez un e-mail avec votre confirmation de commande et un lien de suivi lors de l'expédition de votre colis.</li>
      </ul>
      <p style="margin-top:18px;">Vous pouvez également suivre votre commande en vous connectant à votre <b style="color:#2563eb">COMPTE AFRIMARKET</b> et en cliquant sur l'onglet Mes commandes.</p>
      <p style="margin-top:18px;">Note : Pour assurer un processus de commande fluide, assurez-vous de fournir des informations de livraison exactes et complètes et choisissez un mode de paiement disponible dans votre région.</p>
      <p style="font-weight:bold; margin-top:24px;">Nous espérons vous avoir bien assisté. Bon Achat !</p>
    </div>
  `
})
export class OrderPageComponent {} 