import { gql } from "@urql/core";

export const getExtensionRepos = gql`
  query GetExtensionRepos {
    settings {
      extensionRepos
    }
  }
`;

export const getSources = gql`
  query GetSourcesList {
    sources {
      nodes {
        id
        name
        displayName
        lang
        iconUrl
        isNsfw
        isConfigurable
        supportsLatest
        meta {
          sourceId
          key
          value
        }
        extension {
          pkgName
          repo
        }
      }
    }
  }
`;

export const getSourceSettings = gql`
  query GetSourceSettings($id: LongString!) {
    source(id: $id) {
      id
      name
      displayName
      lang
      preferences {
        ... on CheckBoxPreference {
          type: __typename
          CheckBoxCheckBoxCurrentValue: currentValue
          summary
          CheckBoxDefault: default
          key
          CheckBoxTitle: title
        }
        ... on EditTextPreference {
          type: __typename
          EditTextPreferenceCurrentValue: currentValue
          EditTextPreferenceDefault: default
          EditTextPreferenceTitle: title
          text
          summary
          key
          dialogTitle
          dialogMessage
        }
        ... on SwitchPreference {
          type: __typename
          SwitchPreferenceCurrentValue: currentValue
          summary
          key
          SwitchPreferenceDefault: default
          SwitchPreferenceTitle: title
        }
        ... on MultiSelectListPreference {
          type: __typename
          dialogMessage
          dialogTitle
          MultiSelectListPreferenceTitle: title
          summary
          key
          entryValues
          entries
          MultiSelectListPreferenceDefault: default
          MultiSelectListPreferenceCurrentValue: currentValue
        }
        ... on ListPreference {
          type: __typename
          ListPreferenceCurrentValue: currentValue
          ListPreferenceDefault: default
          ListPreferenceTitle: title
          summary
          key
          entryValues
          entries
        }
      }
    }
  }
`;

export const getSourceBrowse = gql`
  query GetSourceBrowse($id: LongString!) {
    source(id: $id) {
      id
      name
      displayName
      lang
      iconUrl
      baseUrl
      isConfigurable
      supportsLatest
      meta {
        sourceId
        key
        value
      }
      filters {
        ... on CheckBoxFilter {
          type: __typename
          CheckBoxFilterDefault: default
          name
        }
        ... on HeaderFilter {
          type: __typename
          name
        }
        ... on SelectFilter {
          type: __typename
          SelectFilterDefault: default
          name
          values
        }
        ... on TriStateFilter {
          type: __typename
          TriStateFilterDefault: default
          name
        }
        ... on TextFilter {
          type: __typename
          TextFilterDefault: default
          name
        }
        ... on SortFilter {
          type: __typename
          SortFilterDefault: default {
            ascending
            index
          }
          name
          values
        }
        ... on SeparatorFilter {
          type: __typename
          name
        }
        ... on GroupFilter {
          type: __typename
          name
          filters {
            ... on CheckBoxFilter {
              type: __typename
              CheckBoxFilterDefault: default
              name
            }
            ... on HeaderFilter {
              type: __typename
              name
            }
            ... on SelectFilter {
              type: __typename
              SelectFilterDefault: default
              name
              values
            }
            ... on TriStateFilter {
              type: __typename
              TriStateFilterDefault: default
              name
            }
            ... on TextFilter {
              type: __typename
              TextFilterDefault: default
              name
            }
            ... on SortFilter {
              type: __typename
              SortFilterDefault: default {
                ascending
                index
              }
              name
              values
            }
            ... on SeparatorFilter {
              type: __typename
              name
            }
          }
        }
      }
    }
  }
`;
