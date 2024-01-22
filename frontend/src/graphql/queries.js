/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const bulkPrices = /* GraphQL */ `
  query BulkPrices($ids: [ID]) {
    bulkPrices(ids: $ids) {
      pricing_id
      pricePerUnit
      __typename
    }
  }
`;
export const distinctPops = /* GraphQL */ `
  query DistinctPops {
    distinctPops {
      pop
      region
      __typename
    }
  }
`;
