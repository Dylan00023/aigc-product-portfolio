/**
 * API接口封装
 * 所有后端接口都在这里统一管理
 */

import { request } from './request'
import type {
  ApiResponse,
  PageParams,
  PageData,
  // 认证相关
  RegisterParams,
  LoginParams,
  LoginData,
  RefreshTokenParams,
  RefreshTokenData,
  Device,
  LogoutOneParams,
  // 积分卡密
  KamiParams,
  PointsData,
  // IP调查问卷
  IPQueryRecord,
  IPQueryFilledRecord,
  OSSUrlParams,
  OSSUrlData,
  // IP提示词
  IPPromptRecord,
  IPPromptMergeParams,
  IPPromptMergeResult,
  // 账号运营
  AccountBriefPromptRecord,
  AccountBriefMergeParams,
  AccountAvatarPromptRecord,
  AccountAvatarRefRecord,
  AccountAvatarGenerateParams,
  AccountAvatarResultRecord,
  AccountCoverPromptRecord,
  AccountCoverRefRecord,
  AccountCoverGenerateParams,
  // 直播间搭建
  LiveThemePromptRecord,
  LiveThemeMergeParams,
  LiveThemeMergeResult,
  LiveThemeRefRecord,
  LiveThemeGenerateParams,
  LiveBgPromptRecord,
  LiveBgFilledPromptRecord,
  LiveBgRefRecord,
  LiveBgGenerateParams,
  LiveScriptPromptRecord,
  LiveScriptFilledRecord,
  LiveScriptGenerateParams,
  LiveDataSurveyRecord,
  LiveDataSurveyFilledRecord,
  LiveDataAnalysisPromptRecord,
  LiveDataPhotoRecord,
  LiveDataAnalysisParams,
  LiveTouliuPhotoRecord,
  LiveTouliuPromptRecord,
  LiveTouliuAnalysisParams,
  TaskRecord,
  // 版本
  VersionData,
} from '@/types/api'

// ==================== 认证相关接口 ====================

export const authApi = {
  /**
   * 用户注册
   * @remarks 不需要token验证，公开接口
   */
  register: (params: RegisterParams) =>
    request.post<ApiResponse>('/register/register_3', params),
  
  /**
   * 用户登录
   */
  login: (params: LoginParams) =>
    request.post<ApiResponse<LoginData>>('/login/login_4', params),
  
  /**
   * Token刷新
   */
  refreshToken: (params: RefreshTokenParams) =>
    request.post<ApiResponse<RefreshTokenData>>('/login/refresh', params),
  
  /**
   * 查询当前账号的设备登录列表
   */
  getDevices: () =>
    request.get<ApiResponse<Device[]>>('/login/devices'),
  
  /**
   * 退出/踢下线指定设备
   */
  logoutOne: (params: LogoutOneParams) =>
    request.post<ApiResponse>('/login/devices/logout_one', params),
  
  /**
   * 退出/踢下线除当前设备外的所有设备
   */
  logoutOthers: () =>
    request.post<ApiResponse<{ kicked_count: number }>>('/login/devices/logout_others'),
  
  /**
   * 退出/踢下线当前账号所有设备
   */
  logoutAll: () =>
    request.post<ApiResponse<{ kicked_count: number }>>('/login/devices/logout_all'),
}

// ==================== 积分/卡密相关接口 ====================

export const pointsApi = {
  /**
   * 卡密充值
   */
  useKami: (params: KamiParams) =>
    request.post<ApiResponse>('/kami/kami_2', params),
  
  /**
   * 查询当前积分
   */
  getPoints: () =>
    request.get<ApiResponse<PointsData>>('/gongneng/gongneng_12'),
}

// ==================== IP调查问卷相关接口 ====================

export const ipQueryApi = {
  /**
   * IP调查问卷上传
   */
  upload: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; querry_oss_path: string }>>('/gongneng/gongneng_2', formData),
  
  /**
   * IP调查问卷查询（全量）
   */
  getList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<IPQueryRecord>>>('/gongneng/gongneng_3', params),
  
  /**
   * OSS URL转临时下载URL
   */
  getSignedUrl: (params: OSSUrlParams) =>
    request.postForm<ApiResponse<OSSUrlData>>('/gongneng/gongneng_5', params),
  
  /**
   * 已填写IP调查问卷提交
   */
  uploadFilled: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; querry_oss_path: string }>>('/gongneng/gongneng_6', formData),
  
  /**
   * 已填写IP调查问卷查询
   */
  getFilledList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<IPQueryFilledRecord>>>('/gongneng/gongneng_7', params),
}

// ==================== IP提示词相关接口 ====================

export const ipPromptApi = {
  /**
   * IP提示词上传
   */
  upload: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; IP_prompt_oss_path: string }>>('/gongneng/gongneng_10', formData),
  
  /**
   * IP提示词查询（全量）
   */
  getList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<IPPromptRecord>>>('/gongneng/gongneng_11', params),
  
  /**
   * IP提示词拼接
   */
  merge: (params: IPPromptMergeParams) =>
    request.postForm<ApiResponse<{ task_id: number; status: number; result_oss_path?: string }>>('/gongneng/gongneng_14', params),
  
  /**
   * IP提示词拼接结果查询
   */
  getMergeResults: (params?: PageParams) =>
    request.get<ApiResponse<PageData<IPPromptMergeResult>>>('/gongneng/gongneng_15', params),
}

// ==================== 账号简介相关接口 ====================

export const accountBriefApi = {
  /**
   * 账号简介提示词上传
   */
  upload: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; IP_prompt_oss_path: string }>>('/gongneng/gongneng_16', formData),
  
  /**
   * 账号简介提示词查询（全量）
   */
  getList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<AccountBriefPromptRecord>>>('/gongneng/gongneng_17', params),
  
  /**
   * 账号简介拼接生成
   */
  merge: (params: AccountBriefMergeParams) =>
    request.postForm<ApiResponse<{ task_id: number; status: number }>>('/gongneng/gongneng_18', params),
  
  /**
   * 账号简介拼接结果查询
   */
  getMergeResults: (params?: PageParams) =>
    request.get<ApiResponse<PageData<TaskRecord>>>('/gongneng/gongneng_19', params),
}

// ==================== 账号头像相关接口 ====================

export const accountAvatarApi = {
  /**
   * 账号头像提示词上传
   */
  uploadPrompt: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhanghao_prompt_oss_path: string }>>('/gongneng/gongneng_20', formData),
  
  /**
   * 账号头像提示词查询（全量）
   */
  getPromptList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<AccountAvatarPromptRecord>>>('/gongneng/gongneng_21', params),
  
  /**
   * 账号头像参考图上传
   */
  uploadRef: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhanghao_touxiang_oss_path: string }>>('/gongneng/gongneng_24', formData),
  
  /**
   * 账号头像参考图查询
   */
  getRefList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<AccountAvatarRefRecord>>>('/gongneng/gongneng_25', params),
  
  /**
   * 账号头像生成
   */
  generate: (params: AccountAvatarGenerateParams) =>
    request.postForm<ApiResponse<{ task_id: number; status: number }>>('/gongneng/gongneng_22', params),
  
  /**
   * 账号头像生成结果查询
   */
  getResults: (params?: PageParams) =>
    request.get<ApiResponse<PageData<AccountAvatarResultRecord>>>('/gongneng/gongneng_23', params),
}

// ==================== 账号头图相关接口 ====================

export const accountCoverApi = {
  /**
   * 账号头图提示词上传
   */
  uploadPrompt: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhanghao_prompt_oss_path: string }>>('/gongneng/gongneng_26', formData),
  
  /**
   * 账号头图提示词查询（全量）
   */
  getPromptList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<AccountCoverPromptRecord>>>('/gongneng/gongneng_27', params),
  
  /**
   * 账号头图参考图上传
   */
  uploadRef: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhanghao_touxiang_oss_path: string }>>('/gongneng/gongneng_28', formData),
  
  /**
   * 账号头图参考图查询
   */
  getRefList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<AccountCoverRefRecord>>>('/gongneng/gongneng_29', params),
  
  /**
   * 账号头图生成
   */
  generate: (params: AccountCoverGenerateParams) =>
    request.postForm<ApiResponse<{ task_id: number; status: number }>>('/gongneng/gongneng_30', params),
  
  /**
   * 账号头图生成结果查询
   */
  getResults: (params?: PageParams) =>
    request.get<ApiResponse<PageData<AccountAvatarResultRecord>>>('/gongneng/gongneng_31', params),
}

// ==================== 直播主题相关接口 ====================

export const liveThemeApi = {
  /**
   * 直播主题提示词上传
   */
  uploadPrompt: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhanghao_prompt_oss_path: string }>>('/gongneng/gongneng_32', formData),
  
  /**
   * 直播主题提示词查询（全量）
   */
  getPromptList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveThemePromptRecord>>>('/gongneng/gongneng_33', params),
  
  /**
   * 直播主题生成提示词拼接
   */
  merge: (params: LiveThemeMergeParams) =>
    request.postForm<ApiResponse<{ task_id: number; status: number }>>('/gongneng/gongneng_34', params),
  
  /**
   * 直播主题拼接结果查询
   */
  getMergeResults: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveThemeMergeResult>>>('/gongneng/gongneng_35', params),
  
  /**
   * 直播主题参考图上传
   */
  uploadRef: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhanghao_touxiang_oss_path: string }>>('/gongneng/gongneng_36', formData),
  
  /**
   * 直播主题参考图查询
   */
  getRefList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveThemeRefRecord>>>('/gongneng/gongneng_37', params),
  
  /**
   * 直播主题图片生成
   */
  generate: (params: LiveThemeGenerateParams) =>
    request.postForm<ApiResponse<{ task_id: number; status: number }>>('/gongneng/gongneng_38', params),
  
  /**
   * 直播主题图片生成结果查询
   */
  getResults: (params?: PageParams) =>
    request.get<ApiResponse<PageData<AccountAvatarResultRecord>>>('/gongneng/gongneng_39', params),
}

// ==================== 直播背景相关接口 ====================

export const liveBgApi = {
  /**
   * 直播背景提示词上传
   */
  uploadPrompt: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhibo_prompt_oss_path: string }>>('/gongneng/gongneng_40', formData),
  
  /**
   * 直播背景提示词查询（全量）
   */
  getPromptList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveBgPromptRecord>>>('/gongneng/gongneng_41', params),
  
  /**
   * 直播背景已填写提示词上传
   */
  uploadFilledPrompt: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhibo_prompt_oss_path: string }>>('/gongneng/gongneng_42', formData),
  
  /**
   * 直播背景已填写提示词查询
   */
  getFilledPromptList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveBgFilledPromptRecord>>>('/gongneng/gongneng_43', params),
  
  /**
   * 直播背景参考图上传
   */
  uploadRef: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhanghao_touxiang_oss_path: string }>>('/gongneng/gongneng_44', formData),
  
  /**
   * 直播背景参考图查询
   */
  getRefList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveBgRefRecord>>>('/gongneng/gongneng_45', params),
  
  /**
   * 直播背景生成
   */
  generate: (params: LiveBgGenerateParams) =>
    request.postForm<ApiResponse<{ task_id: number; status: number }>>('/gongneng/gongneng_46', params),
  
  /**
   * 直播背景生成结果查询
   */
  getResults: (params?: PageParams) =>
    request.get<ApiResponse<PageData<AccountAvatarResultRecord>>>('/gongneng/gongneng_47', params),
}

// ==================== 直播话术相关接口 ====================

export const liveScriptApi = {
  /**
   * 直播话术提示词上传
   */
  uploadPrompt: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhibo_prompt_oss_path: string }>>('/gongneng/gongneng_48', formData),
  
  /**
   * 直播话术提示词查询（全量）
   */
  getPromptList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveScriptPromptRecord>>>('/gongneng/gongneng_49', params),
  
  /**
   * 直播话术已填写提示词上传
   */
  uploadFilledPrompt: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhibo_prompt_oss_path: string }>>('/gongneng/gongneng_50', formData),
  
  /**
   * 直播话术已填写提示词查询
   */
  getFilledPromptList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveScriptFilledRecord>>>('/gongneng/gongneng_51', params),
  
  /**
   * 直播话术生成
   */
  generate: (params: LiveScriptGenerateParams) =>
    request.postForm<ApiResponse<{ task_id: number; status: number }>>('/gongneng/gongneng_52', params),
  
  /**
   * 直播话术生成结果查询
   */
  getResults: (params?: PageParams) =>
    request.get<ApiResponse<PageData<TaskRecord>>>('/gongneng/gongneng_53', params),
}

// ==================== 直播数据分析相关接口 ====================

export const liveDataApi = {
  /**
   * 直播数据调查表上传
   */
  uploadSurvey: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhibo_prompt_oss_path: string }>>('/gongneng/gongneng_54', formData),
  
  /**
   * 直播数据调查表查询（全量）
   */
  getSurveyList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveDataSurveyRecord>>>('/gongneng/gongneng_55', params),
  
  /**
   * 直播数据已填写调查表上传
   */
  uploadFilledSurvey: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhibo_prompt_oss_path: string }>>('/gongneng/gongneng_56', formData),
  
  /**
   * 直播数据已填写调查表查询
   */
  getFilledSurveyList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveDataSurveyFilledRecord>>>('/gongneng/gongneng_57', params),
  
  /**
   * 直播数据分析提示词上传
   */
  uploadPrompt: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhibo_prompt_oss_path: string }>>('/gongneng/gongneng_58', formData),
  
  /**
   * 直播数据分析提示词查询（全量）
   */
  getPromptList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveDataAnalysisPromptRecord>>>('/gongneng/gongneng_59', params),
  
  /**
   * 直播数据截图上传
   */
  uploadPhoto: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhibo_prompt_oss_path: string }>>('/gongneng/gongneng_60', formData),
  
  /**
   * 直播数据截图查询
   */
  getPhotoList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveDataPhotoRecord>>>('/gongneng/gongneng_61', params),
  
  /**
   * 直播数据合成分析
   */
  analyze: (params: LiveDataAnalysisParams) =>
    request.postForm<ApiResponse<{ task_id: number; status: number }>>('/gongneng/gongneng_62', params),
  
  /**
   * 直播数据分析任务查询
   */
  getResults: (params?: PageParams) =>
    request.get<ApiResponse<PageData<TaskRecord>>>('/gongneng/gongneng_63', params),
}

// ==================== 直播投流相关接口 ====================

export const liveTouliuApi = {
  /**
   * 直播投流截图上传（支持多个）
   */
  uploadPhoto: (formData: FormData) =>
    request.upload<ApiResponse<{ uploaded: Array<{ id: number; zhibo_prompt_oss_path: string }> }>>('/gongneng/gongneng_64', formData),
  
  /**
   * 直播投流截图查询
   */
  getPhotoList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveTouliuPhotoRecord>>>('/gongneng/gongneng_65', params),
  
  /**
   * 直播投流提示词上传
   */
  uploadPrompt: (formData: FormData) =>
    request.upload<ApiResponse<{ id: number; zhibo_prompt_oss_path: string }>>('/gongneng/gongneng_66', formData),
  
  /**
   * 直播投流提示词查询（全量）
   */
  getPromptList: (params?: PageParams) =>
    request.get<ApiResponse<PageData<LiveTouliuPromptRecord>>>('/gongneng/gongneng_67', params),
  
  /**
   * 直播投流分析
   */
  analyze: (params: LiveTouliuAnalysisParams) =>
    request.post<ApiResponse<{ task_id: number; status: number }>>('/gongneng/gongneng_68', params),
  
  /**
   * 直播投流分析任务查询
   */
  getResults: (params?: PageParams) =>
    request.get<ApiResponse<PageData<TaskRecord>>>('/gongneng/gongneng_69', params),
}

// ==================== 其他接口 ====================

export const commonApi = {
  /**
   * 查询版本号
   */
  getVersion: () =>
    request.get<ApiResponse<VersionData>>('/gongneng/gongneng_4'),
}
