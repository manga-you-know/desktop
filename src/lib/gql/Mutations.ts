import { gql } from "@urql/core";

export const setExtensionRepos = gql`
  mutation SetExtensionRepos($repos: [String!]!) {
    setSettings(input: { settings: { extensionRepos: $repos } }) {
      settings {
        extensionRepos
      }
    }
  }
`;

export const fetchExtensions = gql`
  mutation FetchExtensions($input: FetchExtensionsInput = {}) {
    fetchExtensions(input: $input) {
      extensions {
        pkgName
        name
        lang
        versionCode
        versionName
        iconUrl
        repo
        storeIndexUrl
        isNsfw
        contentWarning
        isInstalled
        isObsolete
        hasUpdate
      }
    }
  }
`;

export const updateExtension = gql`
  mutation UpdateExtension($input: UpdateExtensionInput!) {
    updateExtension(input: $input) {
      extension {
        pkgName
        name
        lang
        versionCode
        versionName
        iconUrl
        repo
        isNsfw
        contentWarning
        isInstalled
        isObsolete
        hasUpdate
      }
    }
  }
`;

export const updateSourcePreference = gql`
  mutation UpdateSourcePreference($input: UpdateSourcePreferenceInput!) {
    updateSourcePreference(input: $input) {
      source {
        id
        name
        displayName
        lang
        iconUrl
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
  }
`;

export const fetchSourceManga = gql`
  mutation FetchSourceManga($input: FetchSourceMangaInput!) {
    fetchSourceManga(input: $input) {
      hasNextPage
      mangas {
        id
        title
        thumbnailUrl
        thumbnailUrlLastFetched
        inLibrary
        initialized
        sourceId
        genre
        lastFetchedAt
        inLibraryAt
        status
        artist
        author
        description
        realUrl
        meta {
          mangaId
          key
          value
        }
      }
    }
  }
`;

export const fetchMangaMutation = gql`
  fragment MANGA_BASE_FIELDS on MangaType {
    id
    title
    thumbnailUrl
    thumbnailUrlLastFetched
    inLibrary
    initialized
    sourceId
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

  fragment MANGA_FETCH_FIELDS on MangaType {
    ...MANGA_BASE_FIELDS
    ...MANGA_CHAPTER_NODE_FIELDS
    genre
    lastFetchedAt
    status
    artist
    author
    description
    realUrl
    meta {
      ...MANGA_META_FIELDS
    }
    source {
      ...SOURCE_BASE_FIELDS
    }
  }

  mutation FETCH_MANGA($id: Int!) {
    fetchManga(input: { id: $id }) {
      manga {
        ...MANGA_FETCH_FIELDS
      }
    }
  }
`;

export const refreshMangaMutation = gql`
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

  mutation REFRESH_MANGA(
    $id: Int!
    $fetchManga: Boolean!
    $fetchChapters: Boolean!
  ) {
    fetchMangaAndChapters(
      input: { id: $id, fetchManga: $fetchManga, fetchChapters: $fetchChapters }
    ) {
      manga @include(if: $fetchManga) {
        ...MANGA_SCREEN_FIELDS
      }
      chapters @include(if: $fetchChapters) {
        ...CHAPTER_LIST_FIELDS
      }
    }
  }
`;
