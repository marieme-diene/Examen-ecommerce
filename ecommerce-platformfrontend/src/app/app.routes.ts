import { Routes } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
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
export class OrderPage {}

@Component({
  standalone: true,
  template: `
    <div style="max-width: 900px; margin: 32px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px;">
      <h2 style="font-size:1.5rem; font-weight: bold; margin-bottom: 18px;">Comment payer une commande :</h2>
      <p>Chez AfriMarket, il y a différentes options de paiement : paiement à la livraison, paiement en ligne ou par bons d'achat.</p>
      <p style="font-weight:bold; margin-top:18px;">Option 1 : Paiement à la livraison</p>
      <p>Vous pouvez payer vos commandes à la livraison de différentes manières pour répondre à vos besoins. Choisissez de payer en espèces au livreur.</p>
      <p style="font-weight:bold; margin-top:18px;">Option 2 : Orange Money</p>
      <p>Payer simplement vos achats avec Orange Money en suivant les étapes ci-dessous :</p>
      <ol style="margin-bottom: 18px;">
        <li>Composez le <b>#144#622#</b> sur Orange Money.</li>
        <li>Entrez votre code secret Orange Money.</li>
        <li>Vous recevez ensuite un SMS avec un code de paiement utilisable pendant 15 minutes.</li>
        <li>Conservez ce code. Il vous sera demandé de régler votre commande par la suite.</li>
        <li>Cliquez pour revenir sur le site AfriMarket une fois votre paiement terminé dans le cas contraire votre paiement ne sera pas enregistré.</li>
      </ol>
      <p style="font-weight:bold; margin-top:18px;">Option 3 : Bons d'achat</p>
      <p>Vous pouvez payer vos commandes à l'aide d'un code de bon d'achat. Choisissez celui qui vous convient le mieux pour une expérience d'achat sans souci.</p>
      <h3 style="color:#2563eb; margin-top:32px; font-size:1.1rem; font-weight:bold;">Payer votre commande AfriMarket - Un guide étape par étape</h3>
      <p>Chez AfriMarket nous visons à rendre le processus de paiement de vos commandes aussi simple et transparent que possible. Nous offrons une variété de méthodes de paiement pour répondre à vos besoins y compris le paiement en ligne et le paiement à la livraison.</p>
      <p style="font-weight:bold; margin-top:18px;">Étape 1: Passez votre commande</p>
      <ul>
        <li>Parcourez le site Web de AfriMarket et sélectionnez les articles que vous souhaitez acheter</li>
        <li>Ajoutez les articles à votre panier et passez à la caisse</li>
        <li>Vérifiez les détails de votre commande et apportez les modifications nécessaires</li>
      </ul>
      <p style="font-weight:bold; margin-top:18px;">Étape 2: Choisissez votre mode de paiement</p>
      <ul>
        <li>Sélectionnez votre mode de paiement préféré parmi les options disponibles :</li>
        <ul>
          <li>Paiement de vos achats avec Orange Money. Vous devez pour cela obtenir un code de paiement : Composez le <b>#144#622#</b>.</li>
          <li>Paiement à la livraison : Choisissez de payer en espèces lors de la livraison de votre commande.</li>
          <li>Code de bon d'achat : Appliquez un code de bon d'achat pour le paiement.</li>
        </ul>
      </ul>
      <p style="font-weight:bold; margin-top:18px;">Étape 3: Effectuez votre paiement</p>
      <p>Suivez les instructions fournies pour le mode de paiement que vous avez choisi pour terminer le processus de paiement :</p>
      <ul>
        <li>Si vous avez choisi le paiement en ligne vous serez redirigé vers une page de paiement sécurisée où vous pourrez saisir vos informations de paiement</li>
        <li>Pour le paiement à la livraison attendez simplement que votre commande soit livrée</li>
        <li>Pour payer avec un code de bon d'achat suivez les étapes ci-dessous :</li>
        <ul>
          <li>Ajoutez des articles à votre panier et passez à la page de paiement.</li>
          <li>Entrez votre code de bon d'achat dans le champ « Bon » sous la section « Méthode de paiement ».</li>
          <li>Appliquez le bon en cliquant sur Ajouter un bon.</li>
        </ul>
      </ul>
      <p style="margin-top:18px;">Une fois votre paiement effectué vous recevrez un e-mail de confirmation de commande.</p>
      <p>Si vous rencontrez des problèmes avec le paiement n'hésitez pas à contacter notre service client. Nous sommes là pour vous aider et faire en sorte que votre expérience d'achat AfriMarket soit aussi fluide que possible.</p>
      <p style="font-weight:bold; margin-top:24px;">Nous espérons vous avoir bien assisté. Bon Achat !</p>
      <div style="display:flex; gap:24px; margin-top:32px;">
        <div style="flex:1; background:#fafafa; border-radius:8px; padding:18px; display:flex; align-items:center; gap:12px;">
          <span style="font-size:2rem;">💬</span>
          <div>
            <b>Chat</b><br>
            Discutez avec un agent en ligne, du Lundi au Dimanche de 9h à 18h
          </div>
        </div>
        <div style="flex:1; background:#fafafa; border-radius:8px; padding:18px; display:flex; align-items:center; gap:12px;">
          <span style="font-size:2rem;">📞</span>
          <div>
            <b>Appelez-nous</b><br>
            Du Lundi au Samedi de 9h à 18h au <b>77 123 45 67</b> ou <b>33 922 57 57</b>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentPage {}

@Component({
  standalone: true,
  template: `
    <div style="max-width: 900px; margin: 32px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px;">
      <h2 style="font-size:1.5rem; font-weight: bold; margin-bottom: 18px;">Comment suivre votre colis</h2>
      <p>Le suivi de votre commande sur AfriMarket est facile et simple. Voici comment procéder :</p>
      <ol style="margin-bottom: 18px;">
        <li>Connectez-vous à votre compte AfriMarket.<br>
          Accédez au <b style="color:#2563eb">SITE WEB AFRIMARKET</b> et connectez-vous à votre compte.</li>
        <li>Cliquez sur l'onglet <b style="color:#2563eb">MES COMMANDES</b> dans le tableau de bord de votre compte.<br>
          Dans votre espace Mon compte, accédez à l'onglet Commande.</li>
        <li>Trouvez la commande que vous souhaitez suivre et cliquez sur "Voir les détails"</li>
      </ol>
      <p>Sur la page des détails de la commande, vous pouvez afficher l'état actuel et un historique de suivi complet, y compris un lien pour suivre l'état en direct.</p>
      <p>Vous pouvez également suivre votre commande en utilisant votre numéro de colis fourni dans votre e-mail de confirmation d'expédition. Entrez simplement le numéro de colis dans AfriMarket <b style="color:#2563eb">PAGE DE SUIVI DE COLIS</b> pour voir les nouveautés.</p>
      <h3 style="margin-top:32px; font-size:1.2rem; font-weight:bold;">Délais de livraison</h3>
      <div style="background:#fafafa; border-radius:8px; padding:18px; margin:18px 0;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#fff;">
              <th></th>
              <th style="text-align:center; color:#2563eb;">AFRIMARKET EXPRESS</th>
              <th style="text-align:center; color:#2563eb;">STANDARD SHIPPING</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="background:#222; color:#fff; font-weight:bold; border-radius:6px 0 0 6px; padding:10px 12px;">DAKAR, THIES, MBOUR</td>
              <td style="text-align:center; font-size:1.1rem; font-weight:bold;">1<br><span style="font-size:0.9rem; font-weight:normal;">BUSINESS DAY(S)</span></td>
              <td style="text-align:center; font-size:1.1rem; font-weight:bold;">1 - 2<br><span style="font-size:0.9rem; font-weight:normal;">BUSINESS DAY(S)</span></td>
            </tr>
            <tr>
              <td style="background:#222; color:#fff; font-weight:bold; border-radius:0 0 0 6px; padding:10px 12px;">AINT LOUIS, TOUBA KAOLACK, LOUGA, DIOURBEL, ZIGUINCHOR, TAMBACOUNDA, CAP SKRING, KOLDA</td>
              <td style="text-align:center; font-size:1.1rem; font-weight:bold;">2 - 3<br><span style="font-size:0.9rem; font-weight:normal;">BUSINESS DAY(S)</span></td>
              <td style="text-align:center; font-size:1.1rem; font-weight:bold;">3 - 4<br><span style="font-size:0.9rem; font-weight:normal;">BUSINESS DAY(S)</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style="font-weight:bold; margin-top:24px;">Nous espérons vous avoir bien assisté. Bon Achat !</p>
    </div>
  `
})
export class TrackingPage {}

@Component({
  standalone: true,
  template: `
    <div style="max-width: 900px; margin: 32px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px;">
      <h2 style="font-size:1.5rem; font-weight: bold; margin-bottom: 18px;">Comment annuler des articles ou des commandes</h2>
      <p>Il est facile d'annuler une commande ou un article que vous avez acheté sur AfriMarket. Voici un guide étape par étape sur comment le faire.</p>
      <p style="font-weight:bold; margin-top:18px;">Pour annuler un article</p>
      <ol style="margin-bottom: 18px;">
        <li><b>Étape 1:</b> Connectez-vous à votre compte AfriMarket.</li>
        <li><b>Étape 2:</b> Allez dans votre page <span style="color:#2563eb">"VOS COMMANDES"</span>.</li>
        <li><b>Étape 3:</b> Recherchez la commande qui comprend l'article que vous souhaitez annuler.</li>
        <li><b>Étape 4:</b> Cliquez sur "Voir les détails" pour cette commande.</li>
        <li><b>Étape 5:</b> Sélectionnez l’élément que vous souhaitez annuler.</li>
        <li><b>Étape 6:</b> Cliquez sur le bouton "Annuler l'article" et suivez les instructions pour terminer votre annulation.</li>
      </ol>
      <p style="font-weight:bold; margin-top:18px;">Pour annuler une commande</p>
      <ol style="margin-bottom: 18px;">
        <li><b>Étape 1:</b> Connectez-vous à votre compte AfriMarket.</li>
        <li><b>Étape 2:</b> Allez dans votre <span style="color:#2563eb">"VOS COMMANDES"</span>.</li>
        <li><b>Étape 3:</b> Recherchez la commande que vous souhaitez annuler.</li>
        <li><b>Étape 4:</b> Cliquez sur "Voir les détails" pour cette commande.</li>
        <li><b>Étape 5:</b> Cliquez sur le bouton "Annuler la commande" et suivez les étapes pour confirmer l'annulation.</li>
      </ol>
      <p style="font-weight:bold; color:#222;">Note: Veuillez noter que certains articles/commandes peuvent ne pas être éligibles à l'annulation, ou il peut y avoir des frais associés à l'annulation d'un article/commande.</p>
      <div style="display:flex; gap:24px; margin-top:32px;">
        <div style="flex:1; background:#fafafa; border-radius:8px; padding:18px; display:flex; align-items:center; gap:12px;">
          <span style="font-size:2rem;">💬</span>
          <div>
            <b>Chat</b><br>
            Discutez avec un agent en ligne, du Lundi au Dimanche de 9h à 18h
          </div>
        </div>
        <div style="flex:1; background:#fafafa; border-radius:8px; padding:18px; display:flex; align-items:center; gap:12px;">
          <span style="font-size:2rem;">📞</span>
          <div>
            <b>Appelez-nous</b><br>
            Du Lundi au Samedi de 9h à 18h au <b>77 123 45 67</b> ou <b>33 922 57 57</b>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CancelOrderPage {}

@Component({
  standalone: true,
  template: `
    <div style="max-width: 900px; margin: 32px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px;">
      <h2 style="font-size:1.5rem; font-weight: bold; margin-bottom: 18px;">Retour et Remboursement</h2>
      <p>Si vous n'êtes pas satisfait de votre achat, AfriMarket vous permet de retourner facilement vos articles et de recevoir un remboursement. Pour créer un retour, suivez simplement ces étapes simples.</p>
      <p>Tous les articles doivent être dans leur état et emballage d'origine pour pouvoir faire un retour. N'oubliez pas de garder votre facture.</p>
      <h3 style="font-size:1.1rem; font-weight:bold; margin-top:24px;">Politique de retour et directives</h3>
      <ul style="margin-bottom:18px;">
        <li>Vous pouvez faire un retour dans <b>7 jours</b> si vous recevez un article erroné, endommagé, défectueux ou contrefait.</li>
        <li>Lorsque vous retournez un article, conservez tous scellés, étiquettes, accessoires intacts et assurez-vous que l'article est dans son emballage original.</li>
        <li>Supprimez tous les mots de passe des appareils retournés, sinon le retour ne sera pas valide.</li>
        <li>Une fois que vous avez créé un retour, vous disposez de <b>3 jours ouvrables</b> pour déposer l'article au point relais choisi. Si l'article n'est pas déposé dans les 3 jours, votre demande de retour sera annulée.</li>
        <li>Vous pouvez obtenir un remboursement en cas d’annulation de commande lors d’un paiement en ligne dans les 48 heures.</li>
      </ul>
      <p style="font-weight:bold; margin-top:18px;">Vous pouvez demander un retour si vous avez un changement d'avis sur un article, mais certains articles (ex. maillots de bain, sous-vêtements, cosmétiques, compléments alimentaires) ne peuvent être retournés pour des raisons d'hygiène et de sécurité.</p>
      <h3 style="color:#2563eb; margin-top:24px; font-size:1.1rem; font-weight:bold;">Initiez votre retour :</h3>
      <ol style="margin-bottom:18px;">
        <li><b>Connectez-vous</b> à votre compte AfriMarket et rendez-vous sur <span style="color:#2563eb">"VOS COMMANDES"</span>.</li>
        <li>Cliquez sur la commande du ou des articles que vous souhaitez retourner.</li>
        <li>Sélectionnez le ou les articles que vous souhaitez retourner et indiquez le motif du retour. Donnez plus de détails pour nous aider à comprendre le problème.</li>
        <li>Choisissez votre méthode de remboursement préférée.</li>
        <li>Choisissez le point relais le plus proche pour déposer votre retour.</li>
        <li>Vérifiez vos informations et faites votre retour.</li>
      </ol>
      <p>Veuillez noter que les articles doivent respecter les directives de la politique de retour de AfriMarket pour pouvoir être remboursés.</p>
      <div style="display:flex; gap:24px; margin-top:32px;">
        <div style="flex:1; background:#fafafa; border-radius:8px; padding:18px; display:flex; align-items:center; gap:12px;">
          <span style="font-size:2rem;">💬</span>
          <div>
            <b>Chat</b><br>
            Discutez avec un agent en ligne, du Lundi au Dimanche de 9h à 18h
          </div>
        </div>
        <div style="flex:1; background:#fafafa; border-radius:8px; padding:18px; display:flex; align-items:center; gap:12px;">
          <span style="font-size:2rem;">📞</span>
          <div>
            <b>Appelez-nous</b><br>
            Du Lundi au Samedi de 9h à 18h au <b>77 123 45 67</b> ou <b>33 922 57 57</b>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReturnPage {}

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="max-width: 400px; margin: 32px auto; border-radius: 18px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.13); font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="background: #2563eb; color: #fff; padding: 24px 18px 8px 18px; border-radius: 18px 18px 0 0;">
        <div style="font-size: 2.1rem; font-weight: bold; letter-spacing: 1px; font-family: 'Segoe UI', Arial, sans-serif;">AFRIMARKET</div>
        <div style="font-size: 1.1rem; margin-top: 4px;">Bienvenue</div>
        <div style="font-size: 0.98rem; margin-bottom: 8px;">Comment pouvons-nous vous aider ?</div>
      </div>
      <div *ngIf="!showForm" style="background: #fff; padding: 28px 18px 24px 18px; border-radius: 18px; margin: -32px 16px 0 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); text-align: center;">
        <div style="font-size: 1.25rem; font-weight: bold; margin-bottom: 18px;">Commencez une conversation avec notre équipe d'experts maintenant!</div>
        <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 22px;">
          <img src="https://avatars.dicebear.com/api/avataaars/avatar1.svg" alt="avatar1" style="width:48px;height:48px;border-radius:50%;background:#f5f5f5;">
          <img src="https://avatars.dicebear.com/api/avataaars/avatar2.svg" alt="avatar2" style="width:48px;height:48px;border-radius:50%;background:#f5f5f5;">
          <img src="https://avatars.dicebear.com/api/avataaars/avatar3.svg" alt="avatar3" style="width:48px;height:48px;border-radius:50%;background:#f5f5f5;">
        </div>
        <button (click)="showForm = true" style="background:#2563eb; color:#fff; border:none; border-radius:12px; padding:14px 0; width:100%; font-size:1.08rem; font-weight:500; cursor:pointer; box-shadow:0 2px 8px rgba(0,0,0,0.06);">Nouvelle conversation</button>
      </div>
      <div *ngIf="showForm" style="background: #fff; padding: 24px 18px 18px 18px; border-radius: 12px; margin: -24px 12px 0 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 12px;">Informations de contact</div>
        <form (submit)="onSubmit($event)" style="display:flex; flex-direction:column; gap:12px;">
          <label style="font-size:0.97rem;">Prénom *<br><input type="text" required style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;"></label>
          <label style="font-size:0.97rem;">Nom *<br><input type="text" required style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;"></label>
          <label style="font-size:0.97rem;">Email *<br><input type="email" required style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;"></label>
          <button style="background:#2563eb; color:#fff; border:none; border-radius:8px; padding:12px 0; width:100%; font-size:1rem; font-weight:500; cursor:pointer;">Valider</button>
        </form>
        <div style="color:#888; font-size:0.95rem; margin-top:18px; text-align:center;">Vous ne pouvez pas taper maintenant</div>
      </div>
    </div>
  `
})
export class ChatPage {
  showForm = false;
  onSubmit(event: Event) {
    event.preventDefault();
    alert('Merci, vos informations ont bien été envoyées !');
  }
}

export const routes: Routes = [
  {
    path: 'catalog',
    loadChildren: () => import('./features/catalog/catalog-module').then(m => m.CATALOG_ROUTES)
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart-module').then(m => m.CART_ROUTES)
  },
  {
    path: 'account',
    loadChildren: () => import('./features/account/account-module').then(m => m.ACCOUNT_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin-module').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard-module').then(m => m.DASHBOARD_ROUTES)
  },
  { path: 'order', component: OrderPage },
  { path: 'payment', component: PaymentPage },
  { path: 'tracking', component: TrackingPage },
  { path: 'cancel-order', component: CancelOrderPage },
  { path: 'return', component: ReturnPage },
  { path: 'chat', component: ChatPage },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
