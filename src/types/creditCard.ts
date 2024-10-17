import { Focused } from 'react-credit-cards-2';

export interface CardType {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  focus?: Focused;
}
