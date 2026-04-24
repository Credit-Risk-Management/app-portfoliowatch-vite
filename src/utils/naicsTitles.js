/**
 * Official NAICS 2022 6-digit titles (subset — extend as needed).
 * When `loan.naicsDescription` is empty, we use a 6-digit title from the table if present,
 * otherwise a 2-digit sector label — never a placeholder like "NAICS 721110".
 * Kept in sync with api-portfoliowatch-express/src/utils/naicsTitles.ts
 */
const NAICS_2_SECTOR = {
  11: 'Agriculture, Forestry, Fishing and Hunting',
  21: 'Mining, Quarrying, and Oil and Gas Extraction',
  22: 'Utilities',
  23: 'Construction',
  31: 'Manufacturing',
  32: 'Manufacturing',
  33: 'Manufacturing',
  42: 'Wholesale Trade',
  44: 'Retail Trade',
  45: 'Retail Trade',
  48: 'Transportation and Warehousing',
  49: 'Transportation and Warehousing',
  51: 'Information',
  52: 'Finance and Insurance',
  53: 'Real Estate and Rental and Leasing',
  54: 'Professional, Scientific, and Technical Services',
  55: 'Management of Companies and Enterprises',
  56: 'Administrative and Support and Waste Management and Remediation Services',
  61: 'Educational Services',
  62: 'Health Care and Social Assistance',
  71: 'Arts, Entertainment, and Recreation',
  72: 'Accommodation and Food Services',
  81: 'Other Services (except Public Administration)',
  92: 'Public Administration',
};

const NAICS_6_TITLES = {
  111110: 'Soybean Farming',
  236220: 'Commercial and Institutional Building Construction',
  236118: 'Residential Remodelers',
  311811: 'Retail Bakeries',
  332710: 'Machine Shops',
  423120: 'Motor Vehicle Supplies and New Parts Merchant Wholesalers',
  441110: 'New Car Dealers',
  445110: 'Supermarkets and Other Grocery Retailers',
  456120: 'Cosmetics, Beauty Supplies, and Perfume Retailers',
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
  561720: 'Janitorial Services',
  561621: 'Security Systems Services',
  561730: 'Landscaping Services',
  562111: 'Solid Waste Collection',
  611310: 'Colleges, Universities, and Professional Schools',
  621111: 'Offices of Physicians',
  621210: 'Offices of Dentists',
  622110: 'General Medical and Surgical Hospitals',
  721110: 'Hotels (except Casino Hotels) and Motels',
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

function isNaicsCodePlaceholderLabel(s) {
  return /^naics\s+\d{5,6}\s*$/i.test(s.trim());
}

function resolveTitleFrom6DigitCode(code6) {
  if (NAICS_6_TITLES[code6]) {
    return NAICS_6_TITLES[code6];
  }
  const prefix2 = String(code6).slice(0, 2);
  return NAICS_2_SECTOR[prefix2];
}

function isGenericTwoDigitSectorDescription(desc, code6) {
  const sector2 = NAICS_2_SECTOR[code6.slice(0, 2)];
  return sector2 !== undefined && desc === sector2;
}

/**
 * Resolve a display title for Industry: prefer loan `naicsDescription` when specific,
 * then 6-digit / 2-digit from `naicsCode`, then free-text `borrowerIndustryType` if not a bare code.
 */
export default function getResolvedIndustryTitle(naicsCode, naicsDescription, borrowerIndustryType) {
  const desc = naicsDescription?.trim();
  const fromLoan = normalizeNaics6(naicsCode);

  if (desc && !isNaicsCodePlaceholderLabel(desc)) {
    if (!fromLoan || !isGenericTwoDigitSectorDescription(desc, fromLoan)) {
      return desc;
    }
  }

  if (fromLoan) {
    const t = resolveTitleFrom6DigitCode(fromLoan);
    if (t) return t;
  }

  const bt = borrowerIndustryType?.trim();
  if (bt) {
    if (isNaicsCodePlaceholderLabel(bt)) {
      const c = normalizeNaics6(bt);
      if (c) {
        const t = resolveTitleFrom6DigitCode(c);
        if (t) return t;
      }
    } else if (!/^\d{5,6}$/.test(bt)) {
      if (!fromLoan || !isGenericTwoDigitSectorDescription(bt, fromLoan)) {
        return bt;
      }
    }
  }
  if (bt && /^\d{5,6}$/.test(bt)) {
    const fromBorrower = normalizeNaics6(bt);
    if (fromBorrower) {
      const t = resolveTitleFrom6DigitCode(fromBorrower);
      if (t) return t;
    }
  }

  return undefined;
}
