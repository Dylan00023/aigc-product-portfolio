/**
 * API接口类型定义
 * 所有接口的请求和响应类型都在这里定义
 */

// ==================== 基础类型 ====================

/**
 * 统一API响应格式
 */
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

/**
 * 分页请求参数
 */
export interface PageParams {
  page?: number
  page_size?: number
  status?: number // 任务状态筛选
}

/**
 * 分页响应数据
 */
export interface PageData<T> {
  records: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

/**
 * 文件上传参数（通用）
 */
export interface FileUploadParams {
  file: File
  type?: string // 类别
  name?: string // 名称
  jianjie?: string // 简介
}

// ==================== 认证相关 ====================

/**
 * 注册请求参数
 */
export interface RegisterParams {
  phone: string
  password: string
}

/**
 * 登录请求参数
 */
export interface LoginParams {
  phone: string
  password: string
  device_id?: string
  device_name?: string
}

/**
 * 登录响应数据
 */
export interface LoginData {
  access_token: string
  refresh_token: string
  device_id: string
  max_devices: number
  kicked_devices: string[]
  token_type: string
  expires_in: number
  refresh_expires_in: number
}

/**
 * Token刷新参数
 */
export interface RefreshTokenParams {
  refresh_token: string
}

/**
 * Token刷新响应数据
 */
export interface RefreshTokenData {
  access_token: string
  device_id: string
  token_type: string
  expires_in: number
}

/**
 * 设备信息
 */
export interface Device {
  device_id: string
  device_name: string
  last_login_ip: string
  last_login_time: string
  is_active: number
  created_at: string
  updated_at: string
}

/**
 * 退出指定设备参数
 */
export interface LogoutOneParams {
  device_id: string
}

// ==================== 积分/卡密相关 ====================

/**
 * 卡密充值参数
 */
export interface KamiParams {
  card_number: string
}

/**
 * 积分查询响应数据
 */
export interface PointsData {
  points: number
}

// ==================== IP调查问卷相关 ====================

/**
 * IP调查问卷记录
 */
export interface IPQueryRecord {
  id: number
  querry_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 已填写IP调查问卷记录
 */
export interface IPQueryFilledRecord {
  id: number
  querry_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * OSS URL转临时URL参数
 */
export interface OSSUrlParams {
  url: string
}

/**
 * OSS临时URL响应数据
 */
export interface OSSUrlData {
  signed_url: string
  expire_seconds: number
}

// ==================== IP提示词相关 ====================

/**
 * IP提示词记录
 */
export interface IPPromptRecord {
  id: number
  IP_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * IP提示词拼接参数
 */
export interface IPPromptMergeParams {
  querryfilled_id: number // 已填写问卷ID
  prompt_id: number // 提示词ID
}

/**
 * IP提示词拼接结果记录
 */
export interface IPPromptMergeResult {
  id: number
  user_id: string
  consume_points: number
  consume_token: number
  status: number // 0-待处理 1-处理中 2-处理成功 3-处理失败 4-已取消
  task_record: string | null
  prompt_id: number
  querryfilled_id: number
  create_time: string
}

// ==================== 账号运营相关 ====================

/**
 * 账号简介提示词记录
 */
export interface AccountBriefPromptRecord {
  id: number
  IP_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 账号简介拼接参数
 */
export interface AccountBriefMergeParams {
  prompt_id: number
  IPmix_id: number // IP提示词拼接结果ID
}

/**
 * 账号头像提示词记录
 */
export interface AccountAvatarPromptRecord {
  id: number
  zhanghao_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 账号头像参考图记录
 */
export interface AccountAvatarRefRecord {
  id: number
  zhanghao_touxiang_oss_path: string
}

/**
 * 账号头像生成参数
 */
export interface AccountAvatarGenerateParams {
  prompt_id: number
  cankao_id?: number // 参考头像ID（可选）
}

/**
 * 账号头像生成结果记录
 */
export interface AccountAvatarResultRecord {
  id: number
  user_id: string
  consume_points: number
  status: number
  task_record: string | null
  prompt_id: number
  cankao: number | null
  create_time: string
}

/**
 * 账号头图提示词记录
 */
export interface AccountCoverPromptRecord {
  id: number
  zhanghao_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 账号头图参考图记录
 */
export interface AccountCoverRefRecord {
  id: number
  zhanghao_touxiang_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 账号头图生成参数
 */
export interface AccountCoverGenerateParams {
  prompt_id: number
  cankao_id?: number
}

// ==================== 直播间搭建相关 ====================

/**
 * 直播主题提示词记录
 */
export interface LiveThemePromptRecord {
  id: number
  zhanghao_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 直播主题拼接参数
 */
export interface LiveThemeMergeParams {
  prompt_id: number
  IPmix_id: number
}

/**
 * 直播主题拼接结果记录
 */
export interface LiveThemeMergeResult {
  id: number
  user_id: string
  consume_points: number
  status: number
  task_record: string | null
  prompt_id: number
  ipmiax_id: number
  create_time: string
}

/**
 * 直播主题参考图记录
 */
export interface LiveThemeRefRecord {
  id: number
  zhanghao_touxiang_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 直播主题生成参数
 */
export interface LiveThemeGenerateParams {
  prompt_id: number // 拼接结果的任务ID
  photo_id?: number
}

/**
 * 直播背景提示词记录
 */
export interface LiveBgPromptRecord {
  id: number
  zhibo_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 直播背景已填写提示词记录
 */
export interface LiveBgFilledPromptRecord {
  id: number
  zhibo_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 直播背景参考图记录
 */
export interface LiveBgRefRecord {
  id: number
  zhanghao_touxiang_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 直播背景生成参数
 */
export interface LiveBgGenerateParams {
  prompt_id: number
  photo_id?: number
}

/**
 * 直播话术提示词记录
 */
export interface LiveScriptPromptRecord {
  id: number
  zhibo_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 直播话术已填写提示词记录
 */
export interface LiveScriptFilledRecord {
  id: number
  zhibo_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 直播话术生成参数
 */
export interface LiveScriptGenerateParams {
  prompt_id: number
  ip_id?: number // IP提示词拼接结果ID（可选）
}

/**
 * 直播数据调查表记录
 */
export interface LiveDataSurveyRecord {
  id: number
  zhibo_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 直播数据已填写调查表记录
 */
export interface LiveDataSurveyFilledRecord {
  id: number
  zhibo_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 直播数据分析提示词记录
 */
export interface LiveDataAnalysisPromptRecord {
  id: number
  zhibo_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 直播数据截图记录
 */
export interface LiveDataPhotoRecord {
  id: number
  zhibo_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 直播数据分析参数
 */
export interface LiveDataAnalysisParams {
  prompt_id: number
  docx_id?: number // 已填写调查表ID
  photo_id?: number // 截图ID
}

/**
 * 直播投流截图记录
 */
export interface LiveTouliuPhotoRecord {
  id: number
  zhibo_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 直播投流提示词记录
 */
export interface LiveTouliuPromptRecord {
  id: number
  zhibo_prompt_oss_path: string
  type: string
  name: string
  jianjie: string
  create_time: string
}

/**
 * 直播投流分析参数
 */
export interface LiveTouliuAnalysisParams {
  prompt_id: number
  photo_ids: number[]
}

/**
 * 任务记录（通用）
 */
export interface TaskRecord {
  id: number
  user_id: string
  consume_points: number
  status: number
  task_record: string | null
  prompt_id: number
  create_time: string
}

// ==================== 版本相关 ====================

/**
 * 版本信息
 */
export interface VersionData {
  version: string
}
