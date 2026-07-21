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
