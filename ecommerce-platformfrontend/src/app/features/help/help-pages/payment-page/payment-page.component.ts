import { Component } from '@angular/core';

@Component({
  selector: 'app-payment-page',
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
export class PaymentPageComponent {} 