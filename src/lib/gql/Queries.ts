import { gql } from "@urql/core";

export const getExtensionRepos = gql`
  query {
    settings {
      extensionRepos
    }
  }
`;

// query extensionStores {
// 	extensionStores {
// 		nodes {
// 			signingKey
// 			name
// 			isLegacy
// 			indexUrl
// 			contactWebsite
// 			contactDiscord
// 			badgeLabel
// 		}
// 	}
// }

export const getSources = gql`
  query getSources {
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
        contentWarning
        meta {
          sourceId
          key
          value
        }
        extension {
          pkgName
          repo
          isObsolete
          hasUpdate
          versionCode
          versionName
          contentWarning
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

export const getMangaScreenQuery = gql`
  fragment MANGA_BASE_FIELDS on MangaType {
    id
    title
    thumbnailUrl
    thumbnailUrlLastFetched
    inLibrary
    initialized
    sourceId
  }

  fragment MANGA_CHAPTER_STAT_FIELDS on MangaType {
    id
    unreadCount
    downloadCount
    bookmarkCount
    hasDuplicateChapters
    chapters {
      totalCount
    }
  }

  fragment MANGA_CHAPTER_NODE_FIELDS on MangaType {
    firstUnreadChapter {
      id
      sourceOrder
      isRead
      mangaId
      chapterNumber
      name
      scanlator
    }
    lastReadChapter {
      id
      sourceOrder
      lastReadAt
    }
    latestReadChapter {
      id
      sourceOrder
      lastReadAt
    }
    latestFetchedChapter {
      id
      fetchedAt
    }
    latestUploadedChapter {
      id
      uploadDate
    }
    highestNumberedChapter {
      id
      chapterNumber
    }
  }

  fragment MANGA_META_FIELDS on MangaMetaType {
    mangaId
    key
    value
  }

  fragment SOURCE_BASE_FIELDS on SourceType {
    id
    name
    displayName
    lang
    iconUrl
  }

  fragment MANGA_LIBRARY_FIELDS on MangaType {
    ...MANGA_BASE_FIELDS
    ...MANGA_CHAPTER_STAT_FIELDS
    ...MANGA_CHAPTER_NODE_FIELDS
    genre
    lastFetchedAt
    inLibraryAt
    status
    artist
    author
    description
    meta {
      ...MANGA_META_FIELDS
    }
    source {
      ...SOURCE_BASE_FIELDS
    }
    trackRecords {
      totalCount
      nodes {
        id
        trackerId
      }
    }
  }

  fragment MANGA_MIGRATION_FIELDS on MangaType {
    ...MANGA_BASE_FIELDS
    ...MANGA_CHAPTER_NODE_FIELDS
    artist
    author
    source {
      id
      name
      displayName
    }
  }

  fragment MANGA_SCREEN_FIELDS on MangaType {
    ...MANGA_LIBRARY_FIELDS
    ...MANGA_CHAPTER_NODE_FIELDS
    ...MANGA_MIGRATION_FIELDS
    artist
    author
    description
    status
    realUrl
    meta {
      ...MANGA_META_FIELDS
    }
    sourceId
    source {
      id
      name
      displayName
    }
    trackRecords {
      totalCount
      nodes {
        id
        trackerId
      }
    }
  }

  query GET_MANGA_SCREEN($id: Int!) {
    manga(id: $id) {
      ...MANGA_SCREEN_FIELDS
    }
  }
`;

export const getChaptersMangaQuery = gql`
  fragment CHAPTER_BASE_FIELDS on ChapterType {
    id
    name
    mangaId
    scanlator
    realUrl
    sourceOrder
    chapterNumber
  }

  fragment CHAPTER_STATE_FIELDS on ChapterType {
    id
    isRead
    isDownloaded
    isBookmarked
  }

  fragment CHAPTER_LIST_FIELDS on ChapterType {
    ...CHAPTER_BASE_FIELDS
    ...CHAPTER_STATE_FIELDS
    fetchedAt
    uploadDate
    lastReadAt
  }

  fragment PAGE_INFO on PageInfo {
    endCursor
    hasNextPage
    hasPreviousPage
    startCursor
  }

  query GET_CHAPTERS_MANGA(
    $after: Cursor
    $before: Cursor
    $condition: ChapterConditionInput
    $filter: ChapterFilterInput
    $first: Int
    $last: Int
    $offset: Int
    $order: [ChapterOrderInput!]
  ) {
    chapters(
      after: $after
      before: $before
      condition: $condition
      filter: $filter
      first: $first
      last: $last
      offset: $offset
      order: $order
    ) {
      nodes {
        ...CHAPTER_LIST_FIELDS
      }
      pageInfo {
        ...PAGE_INFO
      }
      totalCount
    }
  }
`;
