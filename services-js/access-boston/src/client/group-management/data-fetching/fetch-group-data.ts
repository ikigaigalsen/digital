import { fetchGraphql } from './fetchGraphql';
import { toGroup } from '../state/data-helpers';
import { Group, Person } from '../types';

const GROUP_DATA = `
  dn
  cn
  displayname
  uniquemember
`;

const FETCH_GROUP = `
  query getGroup($cn: String!) {
    group(cn: $cn) {
      ${GROUP_DATA}
    }
  }
`;

const SEARCH_GROUPS = `
  query searchGroups($term: String! $dns: [String!]!) {
    groupSearch(term: $term dns: $dns) {
      ${GROUP_DATA}
    }
  }
`;

const OU_CONTAINERS = `
  query ouContainers($ous: [String]!) {
    convertOUsToContainers(ous: $ous)
  }
`;

const UPDATE_GROUP = `
  mutation updateGroup(
    $dn: String!
    $operation: String!
    $uniquemember: String!
    $dns: [String]
  ) {
    updateGroupMembers(
      dn: $dn
      operation: $operation
      uniquemember: $uniquemember
      dns: $dns
    ) {code message}
  }
`;

/**
 * Updates a Group object with a single entry.
 */
export async function updateGroup(
  dn: string,
  operation: string,
  uniquemember: string,
  dns: String[] = []
): Promise<any> {
  // eslint-disable-next-line no-console
  // console.log(
  //   'fetch-group-data > updateGroup > dns: ',
  //   ' | dn: ', dn,
  //   ' | operation: ', operation,
  //   ' | uniquemember: ', uniquemember,
  //   ' | UPDATE_GROUP: ', UPDATE_GROUP,
  //   ' | dns: ', dns
  // );
  return await fetchGraphql(UPDATE_GROUP, {
    dn,
    operation,
    uniquemember,
    dns,
  });
}

/**
 * Returns an array of OU containers.
 */
export async function fetchOuContainers(ous: string[]): Promise<any> {
  // console.log('fetch-group-data > fetchOuContainers > ous: ', ous);
  return await fetchGraphql(OU_CONTAINERS, { ous });
}

/**
 * Returns a single Group object.
 */
export async function fetchGroup(
  cn: string,
  _dns: String[] = []
): Promise<any> {
  // console.log('fetch-group-data > fetchGroup > _dns: ', _dns);
  return await fetchGraphql(FETCH_GROUP, { cn });
}

/**
 * Returns a promise resolving to an array of Group objects.
 */
export async function fetchGroupSearch(
  term: string,
  _selectedItem: any,
  dns: String[] = []
): Promise<Group[]> {
  // console.log('term: ', term);
  // console.log('_selectedItem: ', _selectedItem);
  // console.log('fetchGroupSearch: dns: ', dns);
  // console.log('fetchGroupSearch: SEARCH_GROUPS: ', SEARCH_GROUPS);
  if (!dns) {
    dns = [];
  }
  return await fetchGraphql(SEARCH_GROUPS, { term, dns }).then(response =>
    response.groupSearch.map(group => toGroup(group))
  );
}

/**
 * Returns a promise resolving to an array of all groups a specific person
 * is a member of.
 *
 * Groups the current user cannot modify WILL be included in these results.
 */
export async function fetchPersonsGroups(
  person: Person,
  _currentUserAllowedGroups: string[],
  dns: string[],
  ous: string[]
): Promise<Group[]> {
  // console.log('fetch-group-data > fetchGroup > dns: ', dns);
  return await Promise.all(
    person.groups.map(groupCn =>
      fetchGroup(groupCn, dns).then(response =>
        toGroup(response.group[0], dns, ous)
      )
    )
  );
}

/**
 * Returns a promise resolving to an array of Group objects, excluding groups
 * the given person is already a member of. Used by SearchComponent when in
 * “management” view.
 */
export async function fetchGroupSearchRemaining(
  term: string,
  person: Person,
  dns: String[]
): Promise<Group[]> {
  const groups = await fetchGroupSearch(term, [], dns);
  // console.log('fetch-group-data > fetchGroupSearchRemaining > dns: ', dns);
  // console.log('fetchGroupSearch > results(groups): ', groups, '\n -------');

  return groups.filter(group => !person.groups.includes(group.cn));
}
