import { fetch } from "@/lib/helpers/wrappers";
import { suwayomiUrl } from "@/states";
import {
  Client,
  cacheExchange,
  fetchExchange,
  type AnyVariables,
  type DocumentInput,
} from "@urql/core";

let cachedUrl = "";
let cachedClient: Client | undefined;

export function getSuwayomiClient() {
  const url = `${suwayomiUrl.value}/api/graphql`;
  if (!cachedClient || cachedUrl !== url) {
    cachedUrl = url;
    cachedClient = new Client({
      url,
      exchanges: [cacheExchange, fetchExchange],
      fetch,
      preferGetMethod: false,
    });
  }
  return cachedClient;
}

export async function gqlQuery<Data, Variables extends AnyVariables>(
  query: DocumentInput<Data, Variables>,
  variables: Variables,
): Promise<Data> {
  const result = await getSuwayomiClient().query(query, variables).toPromise();

  if (result.error) throw result.error;
  if (!result.data) throw new Error("Suwayomi returned no GraphQL data");

  return result.data;
}

export async function gqlMutation<Data, Variables extends AnyVariables>(
  mutation: DocumentInput<Data, Variables>,
  variables: Variables,
): Promise<Data> {
  const result = await getSuwayomiClient()
    .mutation(mutation, variables)
    .toPromise();

  if (result.error) throw result.error;
  if (!result.data) throw new Error("Suwayomi returned no GraphQL data");

  return result.data;
}
