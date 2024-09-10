/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DatabaseCPULoad {
  cpu: string;
  createdAt: string;
  load: number;
}
export interface DatabaseChannel {
  channelId: number;
  channelName: string;
  createdAt: string;
  deleted: boolean;
  displayName: string;
  fav: boolean;
  isPaused: boolean;
  minDuration: number;
  /** 1:n */
  recordings?: DatabaseRecording[];
  /** Only for query result. */
  recordingsCount: number;
  recordingsSize: number;
  skipStart: number;
  tags?: string[];
  url: string;
}
export interface DatabaseJob {
  active: boolean;
  args?: string;
  channelId: number;
  /** Unique entry, this is the actual primary key */
  channelName: string;
  command?: string;
  createdAt: string;
  filename: string;
  info?: string;
  jobId: number;
  pathRelative: string;
  /** Additional information */
  pid?: number;
  progress?: string;
  recordingId: number;
  status: string;
}
export interface DatabaseNetInfo {
  createdAt: string;
  dev: string;
  receiveBytes: number;
  transmitBytes: number;
}
export interface DatabaseRecording {
  bitRate: number;
  bookmark: boolean;
  channelId: number;
  channelName: string;
  createdAt: string;
  duration: number;
  filename: string;
  height: number;
  /** Total number of video packets/frames. */
  packets: number;
  pathRelative?: string;
  previewCover?: string;
  previewStripe?: string;
  previewVideo?: string;
  recordingId: number;
  size: number;
  videoType: string;
  width: number;
}
export interface HelpersCPUInfo {
  loadCpu?: HelpersCPULoad[];
}
export interface HelpersCPULoad {
  cpu?: string;
  createdAt?: string;
  load?: number;
}
export interface HelpersDiskInfo {
  availFormattedGb?: string;
  pcent?: string;
  sizeFormattedGb?: string;
  usedFormattedGb?: string;
}
export interface HelpersNetInfo {
  createdAt?: string;
  dev?: string;
  receiveBytes?: number;
  transmitBytes?: number;
}
export interface HelpersSysInfo {
  cpuInfo?: HelpersCPUInfo;
  diskInfo?: HelpersDiskInfo;
  netInfo?: HelpersNetInfo;
}
export interface ResponseImportInfo {
  isImporting?: boolean;
  progress?: number;
  size?: number;
}
export interface ResponseServerInfo {
  commit?: string;
  version?: string;
}
export interface ServicesChannelInfo {
  channelId: number;
  channelName: string;
  createdAt: string;
  deleted: boolean;
  displayName: string;
  fav: boolean;
  isOnline: boolean;
  isPaused: boolean;
  isRecording: boolean;
  isTerminating: boolean;
  minDuration: number;
  minRecording: number;
  preview: string;
  /** 1:n */
  recordings?: DatabaseRecording[];
  /** Only for query result. */
  recordingsCount: number;
  recordingsSize: number;
  skipStart: number;
  tags?: string[];
  url: string;
}
export interface ServicesProcessInfo {
  args?: string;
  id?: number;
  output?: string;
  path?: string;
  pid?: number;
}
export interface V1ChannelRequest {
  channelName: string;
  deleted?: boolean;
  displayName: string;
  fav?: boolean;
  isPaused: boolean;
  minDuration: number;
  skipStart: number;
  tags?: string[];
  url: string;
}
export interface V1ChannelTagsUpdateRequest {
  tags?: string[];
}
export interface V1CutRequest {
  deleteAfterCut?: boolean;
  ends?: string[];
  starts?: string[];
}
export interface V1RecordingStatus {
  isRecording: boolean;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "/api/v1";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== "string" ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title No title
 * @baseUrl /api/v1
 * @contact
 */
export class StreamSinkClient<SecurityDataType extends unknown> {
  http: HttpClient<SecurityDataType>;

  constructor(http: HttpClient<SecurityDataType>) {
    this.http = http;
  }

  admin = {
    /**
     * @description version information
     *
     * @tags admin
     * @name ImportList
     * @summary Returns server version information
     * @request GET:/admin/import
     */
    importList: (params: RequestParams = {}) =>
      this.http.request<ResponseImportInfo, any>({
        path: `/admin/import`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of channels
     *
     * @tags admin
     * @name ImportCreate
     * @summary Run once the import of mp4 files in the recordings folder, which are not yet in the system
     * @request POST:/admin/import
     */
    importCreate: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/admin/import`,
        method: "POST",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description version information
     *
     * @tags admin
     * @name VersionList
     * @summary Returns server version information
     * @request GET:/admin/version
     */
    versionList: (params: RequestParams = {}) =>
      this.http.request<ResponseServerInfo, any>({
        path: `/admin/version`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  channels = {
    /**
     * @description Return a list of channels
     *
     * @tags channels
     * @name ChannelsList
     * @summary Return a list of channels
     * @request GET:/channels
     */
    channelsList: (params: RequestParams = {}) =>
      this.http.request<ServicesChannelInfo[], any>({
        path: `/channels`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Add a new channel
     *
     * @tags channels
     * @name ChannelsCreate
     * @summary Add a new channel
     * @request POST:/channels
     */
    channelsCreate: (ChannelRequest: V1ChannelRequest, params: RequestParams = {}) =>
      this.http.request<ServicesChannelInfo, any>({
        path: `/channels`,
        method: "POST",
        body: ChannelRequest,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Return the data of one channel
     *
     * @tags channels
     * @name ChannelsDetail
     * @summary Return the data of one channel
     * @request GET:/channels/{id}
     */
    channelsDetail: (id: number, params: RequestParams = {}) =>
      this.http.request<ServicesChannelInfo, any>({
        path: `/channels/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Delete channel with all recordings
     *
     * @tags channels
     * @name ChannelsDelete
     * @summary Delete channel
     * @request DELETE:/channels/{id}
     */
    channelsDelete: (id: number, params: RequestParams = {}) =>
      this.http.request<any, any>({
        path: `/channels/${id}`,
        method: "DELETE",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Update channel data
     *
     * @tags channels
     * @name ChannelsPartialUpdate
     * @summary Update channel data
     * @request PATCH:/channels/{id}
     */
    channelsPartialUpdate: (id: number, ChannelRequestRequest: V1ChannelRequest, params: RequestParams = {}) =>
      this.http.request<DatabaseChannel, any>({
        path: `/channels/${id}`,
        method: "PATCH",
        body: ChannelRequestRequest,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Mark channel as one of favorites
     *
     * @tags channels
     * @name FavPartialUpdate
     * @summary Mark channel as one of favorites
     * @request PATCH:/channels/{id}/fav
     */
    favPartialUpdate: (id: number, params: RequestParams = {}) =>
      this.http.request<any, any>({
        path: `/channels/${id}/fav`,
        method: "PATCH",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Pause channel for recording
     *
     * @tags channels
     * @name PauseCreate
     * @summary Pause channel for recording
     * @request POST:/channels/{id}/pause
     */
    pauseCreate: (id: number, params: RequestParams = {}) =>
      this.http.request<any, any>({
        path: `/channels/${id}/pause`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete channel with all recordings
     *
     * @tags channels
     * @name ResumeCreate
     * @summary Tag a channel
     * @request POST:/channels/{id}/resume
     */
    resumeCreate: (id: number, params: RequestParams = {}) =>
      this.http.request<any, any>({
        path: `/channels/${id}/resume`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Tag a channel
     *
     * @tags channels
     * @name TagsPartialUpdate
     * @summary Tag a channel
     * @request PATCH:/channels/{id}/tags
     */
    tagsPartialUpdate: (id: number, ChannelTagsUpdateRequest: V1ChannelTagsUpdateRequest, params: RequestParams = {}) =>
      this.http.request<any, any>({
        path: `/channels/${id}/tags`,
        method: "PATCH",
        body: ChannelTagsUpdateRequest,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Remove channel as one of favorites
     *
     * @tags channels
     * @name UnfavPartialUpdate
     * @summary Remove channel as one of favorites
     * @request PATCH:/channels/{id}/unfav
     */
    unfavPartialUpdate: (id: number, params: RequestParams = {}) =>
      this.http.request<any, any>({
        path: `/channels/${id}/unfav`,
        method: "PATCH",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Add a new channel
     *
     * @tags channels
     * @name UploadCreate
     * @summary Add a new channel
     * @request POST:/channels/{id}/upload
     */
    uploadCreate: (
      id: number,
      data: {
        /** Uploaded file chunk */
        file: number[];
      },
      params: RequestParams = {},
    ) =>
      this.http.request<DatabaseRecording, any>({
        path: `/channels/${id}/upload`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  info = {
    /**
     * @description Get disk information
     *
     * @tags info
     * @name DiskList
     * @summary Get disk information
     * @request GET:/info/disk
     */
    diskList: (params: RequestParams = {}) =>
      this.http.request<HelpersDiskInfo, any>({
        path: `/info/disk`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get system metrics
     *
     * @tags info
     * @name InfoDetail
     * @summary Get system metrics
     * @request GET:/info/{seconds}
     */
    infoDetail: (seconds: number, params: RequestParams = {}) =>
      this.http.request<HelpersSysInfo, any>({
        path: `/info/${seconds}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  jobs = {
    /**
     * @description Return a list of jobs
     *
     * @tags jobs
     * @name JobsList
     * @summary Return a list of jobs
     * @request GET:/jobs
     */
    jobsList: (params: RequestParams = {}) =>
      this.http.request<DatabaseJob[], any>({
        path: `/jobs`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Interrupt job gracefully
     *
     * @tags jobs
     * @name StopCreate
     * @summary Interrupt job gracefully
     * @request POST:/jobs/stop/{pid}
     */
    stopCreate: (pid: number, params: RequestParams = {}) =>
      this.http.request<void, string>({
        path: `/jobs/stop/${pid}`,
        method: "POST",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Enqueue a preview job for a video in a channel. For now only preview jobs allowed via REST
     *
     * @tags jobs
     * @name JobsCreate
     * @summary Enqueue a preview job
     * @request POST:/jobs/{id}
     */
    jobsCreate: (id: string, params: RequestParams = {}) =>
      this.http.request<DatabaseJob, any>({
        path: `/jobs/${id}`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Interrupt and delete job gracefully
     *
     * @tags jobs
     * @name JobsDelete
     * @summary Interrupt and delete job gracefully
     * @request DELETE:/jobs/{id}
     */
    jobsDelete: (id: number, params: RequestParams = {}) =>
      this.http.request<void, string>({
        path: `/jobs/${id}`,
        method: "DELETE",
        type: ContentType.Json,
        ...params,
      }),
  };
  metric = {
    /**
     * @description Get CPU metrics
     *
     * @tags metric
     * @name CpuList
     * @summary Get CPU metrics
     * @request GET:/metric/cpu
     */
    cpuList: (params: RequestParams = {}) =>
      this.http.request<DatabaseCPULoad, any>({
        path: `/metric/cpu`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get network metrics
     *
     * @tags metric
     * @name NetList
     * @summary Get network metrics
     * @request GET:/metric/net
     */
    netList: (params: RequestParams = {}) =>
      this.http.request<DatabaseNetInfo, any>({
        path: `/metric/net`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  processes = {
    /**
     * @description Return a list of streaming processes
     *
     * @tags processes
     * @name ProcessesList
     * @summary Return a list of streaming processes
     * @request GET:/processes
     */
    processesList: (params: RequestParams = {}) =>
      this.http.request<ServicesProcessInfo[], any>({
        path: `/processes`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  recorder = {
    /**
     * @description Return if server is current recording.
     *
     * @tags recorder
     * @name RecorderList
     * @summary Return if server is current recording
     * @request GET:/recorder
     */
    recorderList: (params: RequestParams = {}) =>
      this.http.request<V1RecordingStatus, void>({
        path: `/recorder`,
        method: "GET",
        ...params,
      }),

    /**
     * No description
     *
     * @tags recorder
     * @name PauseCreate
     * @summary StopRecorder server recording
     * @request POST:/recorder/pause
     */
    pauseCreate: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/recorder/pause`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @tags recorder
     * @name ResumeCreate
     * @summary StartRecorder server recording
     * @request POST:/recorder/resume
     */
    resumeCreate: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/recorder/resume`,
        method: "POST",
        ...params,
      }),
  };
  recordings = {
    /**
     * @description Return a list of recordings.
     *
     * @tags recordings
     * @name RecordingsList
     * @summary Return a list of recordings
     * @request GET:/recordings
     */
    recordingsList: (params: RequestParams = {}) =>
      this.http.request<DatabaseRecording[], any>({
        path: `/recordings`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns all bookmarked recordings.
     *
     * @tags recordings
     * @name BookmarksList
     * @summary Returns all bookmarked recordings
     * @request GET:/recordings/bookmarks
     */
    bookmarksList: (params: RequestParams = {}) =>
      this.http.request<DatabaseRecording[], any>({
        path: `/recordings/bookmarks`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Get the top N the latest recordings.
     *
     * @tags recordings
     * @name FilterDetail
     * @summary Get the top N the latest recordings
     * @request GET:/recordings/filter/{column}/{order}/{limit}
     */
    filterDetail: (column: string, order: string, limit?: string, params: RequestParams = {}) =>
      this.http.request<DatabaseRecording[], any>({
        path: `/recordings/filter/${column}/${order}/${limit}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of recordings.
     *
     * @tags recordings
     * @name GeneratePostersCreate
     * @summary Return a list of recordings
     * @request POST:/recordings/generate/posters
     */
    generatePostersCreate: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/recordings/generate/posters`,
        method: "POST",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Returns if current the videos are updated.
     *
     * @tags recordings
     * @name IsupdatingList
     * @summary Returns if current the videos are updated.
     * @request GET:/recordings/isupdating
     */
    isupdatingList: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/recordings/isupdating`,
        method: "GET",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags recordings
     * @name RandomDetail
     * @summary Get random videos
     * @request GET:/recordings/random/{limit}
     */
    randomDetail: (limit?: string, params: RequestParams = {}) =>
      this.http.request<DatabaseRecording[], any>({
        path: `/recordings/random/${limit}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Return a list of recordings.
     *
     * @tags recordings
     * @name UpdateinfoCreate
     * @summary Return a list of recordings
     * @request POST:/recordings/updateinfo
     */
    updateinfoCreate: (params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/recordings/updateinfo`,
        method: "POST",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Download a file from a channel.
     *
     * @tags recordings
     * @name DownloadDetail
     * @summary Download a file from a channel
     * @request GET:/recordings/{channelName}/{filename}/download
     */
    downloadDetail: (channelName: string, filename: string, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/recordings/${channelName}/${filename}/download`,
        method: "GET",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Return a list of recordings for a particular channel.
     *
     * @tags recordings
     * @name RecordingsDetail
     * @summary Return a list of recordings for a particular channel
     * @request GET:/recordings/{id}
     */
    recordingsDetail: (id: number, params: RequestParams = {}) =>
      this.http.request<DatabaseRecording, any>({
        path: `/recordings/${id}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Delete recording
     *
     * @tags recordings
     * @name RecordingsDelete
     * @summary Delete recording
     * @request DELETE:/recordings/{id}
     */
    recordingsDelete: (id: number, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/recordings/${id}`,
        method: "DELETE",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Cut a video and merge all defined segments
     *
     * @tags recordings
     * @name CutCreate
     * @summary Cut a video and merge all defined segments
     * @request POST:/recordings/{id}/cut
     */
    cutCreate: (id: number, CutRequest: V1CutRequest, params: RequestParams = {}) =>
      this.http.request<DatabaseJob, any>({
        path: `/recordings/${id}/cut`,
        method: "POST",
        body: CutRequest,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Bookmark a certain video in a channel.
     *
     * @tags recordings
     * @name FavPartialUpdate
     * @summary Bookmark a certain video in a channel
     * @request PATCH:/recordings/{id}/fav
     */
    favPartialUpdate: (id: number, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/recordings/${id}/fav`,
        method: "PATCH",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Generate preview for a certain video in a channel.
     *
     * @tags recordings
     * @name PreviewCreate
     * @summary Generate preview for a certain video in a channel
     * @request POST:/recordings/{id}/preview
     */
    previewCreate: (id: number, params: RequestParams = {}) =>
      this.http.request<DatabaseJob, any>({
        path: `/recordings/${id}/preview`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Bookmark a certain video in a channel.
     *
     * @tags recordings
     * @name UnfavPartialUpdate
     * @summary Bookmark a certain video in a channel
     * @request PATCH:/recordings/{id}/unfav
     */
    unfavPartialUpdate: (id: number, params: RequestParams = {}) =>
      this.http.request<void, any>({
        path: `/recordings/${id}/unfav`,
        method: "PATCH",
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Cut a video and merge all defined segments
     *
     * @tags recordings
     * @name ConvertCreate
     * @summary Cut a video and merge all defined segments
     * @request POST:/recordings/{id}/{mediaType}/convert
     */
    convertCreate: (id: number, mediaType: string, params: RequestParams = {}) =>
      this.http.request<DatabaseJob, any>({
        path: `/recordings/${id}/${mediaType}/convert`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
