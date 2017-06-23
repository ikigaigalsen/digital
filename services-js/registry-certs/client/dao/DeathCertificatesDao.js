// @flow

import DataLoader from 'dataloader';
import type { LoopbackGraphql } from '../loopback-graphql';
import type { DeathCertificate } from '../types';

import fetchDeathCertificates from '../queries/fetch-death-certificates';
import searchDeathCertificates from '../queries/search-death-certificates';
import type { DeathCertificateSearchResults } from '../types';

export type DeathCertificateCache = { [id: string]: DeathCertificate };

export default class DeathCertificatesDao {
  loopbackGraphql: LoopbackGraphql;
  loader: DataLoader<string, ?DeathCertificate>;

  constructor(loopbackGraphql: LoopbackGraphql) {
    this.loopbackGraphql = loopbackGraphql;

    // create new array shenanigans to get Flow to accept that we're not returning Errors
    this.loader = new DataLoader(ids =>
      fetchDeathCertificates(loopbackGraphql, ids).then(a => a.map(i => i)),
    );
  }

  get(id: string): Promise<?DeathCertificate> {
    return this.loader.load(id);
  }

  async search(
    fullQuery: string,
    page: number,
  ): Promise<DeathCertificateSearchResults> {
    const { query, startYear, endYear } = this.parseQuery(fullQuery);

    const results = await searchDeathCertificates(
      this.loopbackGraphql,
      query,
      page,
      startYear,
      endYear,
    );

    results.results.forEach(cert => {
      this.loader.prime(cert.id, cert);
    });

    return results;
  }

  parseQuery(
    fullQuery: string,
  ): { query: string, startYear: ?string, endYear: ?string } {
    // match a 4-digit year, and optionally a second 4-digit year with a hypen or en-dash
    const yearRegexp = /(\d{4})\s*[-–]?\s*(\d{4})?/;

    let query;
    let startYear;
    let endYear;

    const match = fullQuery.match(yearRegexp);
    if (match) {
      query = fullQuery.replace(yearRegexp, '').trim();
      startYear = match[1];
      endYear = match[2] || match[1];
    } else {
      query = fullQuery;
      startYear = null;
      endYear = null;
    }

    return {
      query,
      startYear,
      endYear,
    };
  }
}
