
interface ShippingRates {
  [wilaya: string]: {
    home: number;
    office: number;
    return: number;
  };
}

export const SHIPPING_RATES: ShippingRates = {
  'Adrar': { home: 1400, office: 900, return: 300 },
  'Chlef': { home: 800, office: 450, return: 200 },
  'Laghouat': { home: 950, office: 550, return: 200 },
  'Oum El Bouaghi': { home: 800, office: 450, return: 200 },
  'Batna': { home: 800, office: 450, return: 200 },
  'Béjaïa': { home: 950, office: 450, return: 200 },
  'Biskra': { home: 950, office: 550, return: 200 },
  'Béchar': { home: 1100, office: 650, return: 300 },
  'Blida': { home: 750, office: 400, return: 200 },
  'Bouira': { home: 700, office: 450, return: 200 },
  'Tamanrasset': { home: 1600, office: 1050, return: 250 },
  'Tébessa': { home: 800, office: 450, return: 200 },
  'Tlemcen': { home: 900, office: 500, return: 200 },
  'Tiaret': { home: 800, office: 450, return: 200 },
  'Tizi Ouzou': { home: 950, office: 450, return: 200 },
  'Alger': { home: 600, office: 400, return: 200 },
  'Djelfa': { home: 950, office: 550, return: 200 },
  'Jijel': { home: 700, office: 450, return: 200 },
  'Sétif': { home: 750, office: 450, return: 200 },
  'Saïda': { home: 800, office: 500, return: 200 },
  'Skikda': { home: 750, office: 450, return: 200 },
  'Sidi Bel Abbès': { home: 750, office: 450, return: 200 },
  'Annaba': { home: 800, office: 450, return: 200 },
  'Guelma': { home: 800, office: 450, return: 200 },
  'Constantine': { home: 750, office: 450, return: 200 },
  'Médéa': { home: 750, office: 450, return: 200 },
  'Mostaganem': { home: 750, office: 450, return: 200 },
  'M\'Sila': { home: 850, office: 500, return: 200 },
  'Mascara': { home: 750, office: 450, return: 200 },
  'Ouargla': { home: 1050, office: 600, return: 300 },
  'Oran': { home: 700, office: 450, return: 200 },
  'El Bayadh': { home: 1050, office: 600, return: 300 },
  'Illizi': { home: 1400, office: 0, return: 0 },
  'Bordj Bou Arréridj': { home: 750, office: 450, return: 200 },
  'Boumerdès': { home: 750, office: 450, return: 200 },
  'El Tarf': { home: 850, office: 450, return: 200 },
  'Tindouf': { home: 1600, office: 0, return: 0 },
  'Tissemsilt': { home: 800, office: 500, return: 200 },
  'El Oued': { home: 1000, office: 600, return: 300 },
  'Khenchela': { home: 800, office: 0, return: 200 },
  'Souk Ahras': { home: 800, office: 450, return: 200 },
  'Tipaza': { home: 750, office: 450, return: 200 },
  'Mila': { home: 750, office: 450, return: 200 },
  'Aïn Defla': { home: 750, office: 450, return: 200 },
  'Naâma': { home: 1100, office: 600, return: 200 },
  'Aïn Témouchent': { home: 750, office: 450, return: 200 },
  'Ghardaïa': { home: 1000, office: 650, return: 200 },
  'Relizane': { home: 750, office: 450, return: 200 },
  'Timimoun': { home: 1400, office: 0, return: 0 },
  'Bordj Badji Mokhtar': { home: 1600, office: 0, return: 0 },
  'Ouled Djellal': { home: 950, office: 550, return: 200 },
  'Béni Abbès': { home: 1000, office: 900, return: 200 },
  'In Salah': { home: 1600, office: 0, return: 250 },
  'In Guezzam': { home: 1600, office: 0, return: 250 },
  'Touggourt': { home: 1000, office: 600, return: 200 },
  'Djanet': { home: 1600, office: 0, return: 0 },
  'M\'Ghair': { home: 1000, office: 0, return: 200 },
  'El Ménia': { home: 1000, office: 0, return: 200 }
};

export const getShippingCost = (wilaya: string, deliveryType: 'home' | 'office' = 'home'): number => {
  const rates = SHIPPING_RATES[wilaya];
  if (!rates) return 800; // Default shipping cost
  return rates[deliveryType] || rates.home;
};

export const getAvailableDeliveryTypes = (wilaya: string): Array<'home' | 'office'> => {
  const rates = SHIPPING_RATES[wilaya];
  if (!rates) return ['home'];
  
  const types: Array<'home' | 'office'> = ['home'];
  if (rates.office > 0) {
    types.push('office');
  }
  return types;
};
