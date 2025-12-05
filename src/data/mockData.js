// Mock data factory with pagination support
export const createMockData = {
  leads: {
    generateLeads: (count = 50) => {
      const sources = ['Google Ads', 'Facebook', 'Organic', 'Referral', 'Email Marketing'];
      const treatments = ['Dental Implants', 'Orthodontics', 'Teeth Whitening', 'General Checkup'];
      const urgencyLevels = ['high', 'medium', 'low'];
      
      return Array.from({ length: count }, (_, index) => ({
        id: `L${String(index + 1)?.padStart(3, '0')}`,
        name: `Patient ${index + 1}`,
        source: sources?.[Math.floor(Math.random() * sources?.length)],
        score: Math.floor(Math.random() * 40) + 60,
        treatmentInterest: treatments?.[Math.floor(Math.random() * treatments?.length)],
        estimatedValue: Math.floor(Math.random() * 15000) + 500,
        timeframe: `Within ${Math.floor(Math.random() * 12) + 1} ${Math.random() > 0.5 ? 'weeks' : 'months'}`,
        urgency: urgencyLevels?.[Math.floor(Math.random() * urgencyLevels?.length)],
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        hasFollowUp: Math.random() > 0.5,
        isNewLead: Math.random() > 0.7
      }));
    },

    getPaginatedLeads: (page = 1, pageSize = 10) => {
      const allLeads = createMockData?.leads?.generateLeads(100);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      return {
        data: allLeads?.slice(startIndex, endIndex),
        pagination: {
          page,
          pageSize,
          total: allLeads?.length,
          totalPages: Math.ceil(allLeads?.length / pageSize),
          hasNextPage: endIndex < allLeads?.length,
          hasPreviousPage: page > 1
        }
      };
    }
  },

  sourcePerformance: {
    generateSources: (count = 10) => {
      const categories = ['Paid Search', 'Social Media', 'SEO', 'Word of Mouth', 'Email'];
      const names = ['Google Ads', 'Facebook', 'Instagram', 'LinkedIn', 'Organic Search', 'Referrals'];
      
      return Array.from({ length: count }, (_, index) => ({
        name: names?.[index % names?.length] || `Source ${index + 1}`,
        category: categories?.[Math.floor(Math.random() * categories?.length)],
        totalLeads: Math.floor(Math.random() * 300) + 50,
        conversionRate: Math.random() * 30 + 15,
        conversionRateChange: (Math.random() - 0.5) * 20,
        costPerLead: Math.floor(Math.random() * 60) + 10,
        roi: Math.random() * 600 + 100,
        qualityScore: Math.random() * 4 + 6,
        performanceScore: Math.floor(Math.random() * 40) + 60
      }));
    },

    getPaginatedSources: (page = 1, pageSize = 5) => {
      const allSources = createMockData?.sourcePerformance?.generateSources(20);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      return {
        data: allSources?.slice(startIndex, endIndex),
        pagination: {
          page,
          pageSize,
          total: allSources?.length,
          totalPages: Math.ceil(allSources?.length / pageSize)
        }
      };
    }
  },

  funnel: {
    generateFunnelData: () => ({
      stages: [
        { stage: 'Lead Capture', count: 1247, conversionRate: 100, dropOffRate: 0 },
        { stage: 'Qualification', count: 892, conversionRate: 71.5, dropOffRate: 28.5 },
        { stage: 'Consultation Booked', count: 634, conversionRate: 71.1, dropOffRate: 28.9 },
        { stage: 'Consultation Attended', count: 487, conversionRate: 76.8, dropOffRate: 23.2 },
        { stage: 'Treatment Accepted', count: 312, conversionRate: 64.1, dropOffRate: 35.9 },
        { stage: 'Treatment Completed', count: 278, conversionRate: 89.1, dropOffRate: 10.9 }
      ]
    })
  },

  geographic: {
    generateRegions: (count = 15) => {
      const regions = [
        'London Central', 'Manchester', 'Birmingham', 'Edinburgh', 'Cardiff', 
        'Bristol', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield',
        'Nottingham', 'Southampton', 'Plymouth', 'Norwich'
      ];
      
      return Array.from({ length: Math.min(count, regions?.length) }, (_, index) => ({
        name: regions?.[index],
        area: index < 5 ? 'Major Cities' : 'Regional Centers',
        totalLeads: Math.floor(Math.random() * 200) + 80,
        conversionRate: Math.random() * 15 + 20,
        totalRevenue: Math.floor(Math.random() * 80000) + 20000,
        costPerLead: Math.floor(Math.random() * 40) + 30,
        avgDealSize: Math.floor(Math.random() * 2000) + 2500
      }));
    },

    getPaginatedRegions: (page = 1, pageSize = 8) => {
      const allRegions = createMockData?.geographic?.generateRegions();
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      return {
        data: allRegions?.slice(startIndex, endIndex),
        pagination: {
          page,
          pageSize,
          total: allRegions?.length,
          totalPages: Math.ceil(allRegions?.length / pageSize)
        }
      };
    }
  }
};

// Memoized data cache to prevent recreation on every render
const dataCache = new Map();
const cacheTimestamps = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getMemoizedData = (dataType, params = {}) => {
  const cacheKey = `${dataType}_${JSON.stringify(params)}`;
  const now = Date.now();
  
  // Check if cached data exists and is still valid
  if (dataCache?.has(cacheKey) && 
      cacheTimestamps?.has(cacheKey) && 
      (now - cacheTimestamps?.get(cacheKey)) < CACHE_DURATION) {
    return dataCache?.get(cacheKey);
  }
  
  // Generate new data
  let data;
  switch (dataType) {
    case 'leads':
      data = params?.paginated 
        ? createMockData?.leads?.getPaginatedLeads(params?.page, params?.pageSize)
        : createMockData?.leads?.generateLeads(params?.count);
      break;
    case 'sources':
      data = params?.paginated
        ? createMockData?.sourcePerformance?.getPaginatedSources(params?.page, params?.pageSize)
        : createMockData?.sourcePerformance?.generateSources(params?.count);
      break;
    case 'funnel':
      data = createMockData?.funnel?.generateFunnelData();
      break;
    case 'geographic':
      data = params?.paginated
        ? createMockData?.geographic?.getPaginatedRegions(params?.page, params?.pageSize)
        : createMockData?.geographic?.generateRegions(params?.count);
      break;
    default:
      data = null;
  }
  
  // Cache the data
  if (data) {
    dataCache?.set(cacheKey, data);
    cacheTimestamps?.set(cacheKey, now);
  }
  
  return data;
};

// Utility to clear cache when needed
export const clearDataCache = () => {
  dataCache?.clear();
  cacheTimestamps?.clear();
};