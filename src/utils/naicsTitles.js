/**
 * Official NAICS 2022 6-digit titles (subset — extend as needed).
 * When `loan.naicsDescription` is empty, we still show a proper Industry label in UI.
 * Kept in sync with api-portfoliowatch-express/src/utils/naicsTitles.ts
 */
const NAICS_6_TITLES = {
  111110: 'Soybean Farming',
  236220: 'Commercial and Institutional Building Construction',
  236118: 'Residential Remodelers',
  311811: 'Retail Bakeries',
  423120: 'Motor Vehicle Supplies and New Parts Merchant Wholesalers',
  441110: 'New Car Dealers',
  445110: 'Supermarkets and Other Grocery Retailers',
  511210: 'Software Publishers',
  512110: 'Motion Picture and Video Production',
  517311: 'Wired and Wireless Telecommunications Carriers',
  517810: 'All Other Telecommunications',
  523110: 'Investment Banking and Securities Intermediation',
  524113: 'Direct Life Insurance Carriers',
  524210: 'Insurance Agencies and Brokerages',
  531120: 'Lessors of Nonresidential Buildings',
  531210: 'Offices of Real Estate Agents and Brokers',
  532111: 'Passenger Car Rental',
  532420: 'Office Equipment Rental and Leasing',
  541110: 'Offices of Lawyers',
  541211: 'Offices of Certified Public Accountants',
  541330: 'Engineering Services',
  541380: 'Testing Laboratories',
  541511: 'Custom Computer Programming Services',
  541512: 'Computer Systems Design Services',
  541513: 'Computer Facilities Management Services',
  541611: 'Administrative Management and General Management Consulting Services',
  541612: 'Human Resources Consulting Services',
  541618: 'Other Management Consulting Services',
  541715: 'Research and Development in the Physical, Engineering, and Life Sciences',
  541930: 'Translation and Interpretation Services',
  541990: 'All Other Professional, Scientific, and Technical Services',
  561110: 'Office Administrative Services',
  561320: 'Temporary Help Services',
  561330: 'Professional Employer Organizations',
  561499: 'All Other Business Support Services',
  561621: 'Security Systems Services',
  561730: 'Landscaping Services',
  562111: 'Solid Waste Collection',
  611310: 'Colleges, Universities, and Professional Schools',
  621111: 'Offices of Physicians',
  621210: 'Offices of Dentists',
  622110: 'General Medical and Surgical Hospitals',
  722511: 'Full-Service Restaurants',
  722513: 'Limited-Service Restaurants',
  811111: 'General Automotive Repair',
  811121: 'Automotive Body, Paint, and Interior Repair and Maintenance',
  812111: 'Barber Shops',
  812112: 'Beauty Salons',
  812320: 'Drycleaning and Laundry Services',
};

function normalizeNaics6(code) {
  if (!code) return undefined;
  const digits = String(code).replace(/\D/g, '');
  if (digits.length < 6) return undefined;
  return digits.slice(0, 6);
}

/**
 * Resolve a display title for Industry: prefer loan description, then lookup by code,
 * then borrower text if it is not a bare NAICS code, else a readable NAICS label.
 */
export function getResolvedIndustryTitle(naicsCode, naicsDescription, borrowerIndustryType) {
  const desc = naicsDescription?.trim();
  if (desc) return desc;

  const code6 = normalizeNaics6(naicsCode);
  if (code6 && NAICS_6_TITLES[code6]) {
    return NAICS_6_TITLES[code6];
  }

  const bt = borrowerIndustryType?.trim();
  if (bt && !/^\d{5,6}$/.test(bt)) {
    return bt;
  }
  if (bt && /^\d{5,6}$/.test(bt)) {
    const fromBorrower = normalizeNaics6(bt);
    if (fromBorrower && NAICS_6_TITLES[fromBorrower]) {
      return NAICS_6_TITLES[fromBorrower];
    }
  }

  if (code6) {
    return `NAICS ${code6}`;
  }

  return undefined;
}
