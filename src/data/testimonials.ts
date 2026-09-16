export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  productName: string;
}

export const CUSTOMER_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'David Mwangi',
    location: 'Kilimani, Nairobi',
    rating: 5,
    date: '2 days ago',
    title: 'Delivered ice-cold in under 40 minutes!',
    comment: 'Ordered Don Julio 1942 and a case of Fever-Tree for an impromptu Friday evening with colleagues. The rider was professional, bottles were well packed with seal intact. Best liquor delivery service in Nairobi.',
    verifiedPurchase: true,
    productName: 'Don Julio 1942 Añejo Tequila',
  },
  {
    id: 'rev-2',
    author: 'Wanjiru Kariuki',
    location: 'Lavington, Nairobi',
    rating: 5,
    date: 'Last week',
    title: 'Genuine bottles, zero counterfeits',
    comment: 'With so many fake spirits floating around town, UNCLE RATT is the only place I trust for my Single Malts. The Macallan 12 batch code checked out perfectly on the importer portal.',
    verifiedPurchase: true,
    productName: 'The Macallan 12 Year Old',
  },
  {
    id: 'rev-3',
    author: 'Brian Omondi',
    location: 'Westlands, Nairobi',
    rating: 5,
    date: '3 weeks ago',
    title: 'The Gentleman’s Gift Hamper made a huge impression',
    comment: 'Sent the UNCLE RATT Speyside hamper to our managing partner for his birthday. The wax seal, crystal tumblers and packaging were top-tier luxury. Worth every shilling.',
    verifiedPurchase: true,
    productName: 'UNCLE RATT Gentleman’s Hamper',
  },
  {
    id: 'rev-4',
    author: 'Brenda Chebet',
    location: 'Karen, Nairobi',
    rating: 5,
    date: '1 month ago',
    title: 'Discreet and prompt courier',
    comment: 'Placed an order via M-Pesa at 9:30 PM on a Sunday. By 10:15 PM the rider was at my gate in Karen. Cold Champagne ready to pop!',
    verifiedPurchase: true,
    productName: 'Veuve Clicquot Yellow Label',
  },
];
