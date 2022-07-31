import { contextPath } from './constant'
//系统管理
import SysDicForm from '../pages/SysDic/Form'
import SysDicList from '../pages/SysDic/List'
import SysDicQuery from '../pages/SysDic/Query'
import SysDeptForm from '../pages/SysDept/Form'
import SysDeptList from '../pages/SysDept/List'
import SysDeptQuery from '../pages/SysDept/Query'
import SysRoleForm from '../pages/SysRole/Form'
import SysRoleList from '../pages/SysRole/List'
import PermissionGiveForm from '../pages/SysRole/PermissionGiveForm'
import SysPermissionForm from '../pages/SysPermission/Form'
import SysPermissionList from '../pages/SysPermission/List'
import SysUserForm from '../pages/SysUser/Form'
import SysUserUpload1Form from '../pages/SysUser/Upload1Form'
import SysUserList from '../pages/SysUser/List'
import SysUserQuery from '../pages/SysUser/Query'
import RoleGiveForm from '../pages/SysUser/RoleGiveForm'
//流程管理
import CustomTypeForm from '../pages/ProcessFormCustomType/Form'
import CustomTypeList from '../pages/ProcessFormCustomType/List'
import ProcessDefinitonList from '../pages/ProcessDefiniton/List'

import ProcessDefinitonDefList from '../pages/ProcessDefiniton/DefList'
import ProcessDefinitonQuery from '../pages/ProcessDefiniton/Query'
import ProcessInstanceDataList from '../pages/ProcessInstanceData/List'
import ProcessInstanceDataQuery from '../pages/ProcessInstanceData/Query'
import ProcessInstanceDataMyList from '../pages/ProcessInstanceDataMy/List'

import ProcessInstanceDataTodoList from '../pages/ProcessInstanceDataMy/TodoList'
import ProcessInstanceDataMyQuery from '../pages/ProcessInstanceDataMy/Query'

import ProcessInstanceDataCompleteDoneList from '../pages/ProcessInstanceDataComplete/DoneList'
import ProcessInstanceDataCompleteList from '../pages/ProcessInstanceDataComplete/List'
import ProcessInstanceDataCompleteQuery from '../pages/ProcessInstanceDataComplete/Query'
//设备
import AsDeviceCommonForm from '../pages/AsDeviceCommon/Form'
import AsDeviceCommonList from '../pages/AsDeviceCommon/List'
import AsDeviceCommonQuery from '../pages/AsDeviceCommon/Query'
import AsDeviceCommonUpload1Form from '../pages/AsDeviceCommon/Upload1Form'
//报表
import LifeCircle from '../pages/LifeCircle/lifeCircle'
import DeviceAccount from '../pages/report/DeviceAccount'
import  AuditForm from '../pages/Audit/Form'
import  AuditList from '../pages/Audit/List'
import  AuditQuery from '../pages/Audit/Query'

//flag、导出名称、sysPermission.path,三个地方必须一致
//资产台账
export const accountPath= {
  List:DeviceAccount
}
//设备类型
export const asTypePath = {
  getAsTypeIdByName:contextPath + '/asType/getAsTypeIdByName',
 // getAllowedAsTypeIdByProDefId:contextPath + '/asType/getAllowedAsTypeIdByProDefId',
  getLevelTwoInFoAssetAsTypeLV:contextPath + '/asType/getLevelTwoInFoAssetAsTypeLV',
  getAsTypeTree:contextPath + '/asType/getAsTypeTree',

}
//审计日志
export const auditPath = {
  flag: 'auditPath',
  Form: AuditForm, List:AuditList, Query: AuditQuery,
  list: contextPath + '/operateeLog/list',
  get: contextPath + '/operateeLog/get',
  add: contextPath + '/operateeLog/add',

  download1: contextPath + '/operateeLog/download1',

}
//评分
export const scorePath = {
  scoreObjectList:contextPath + '/score/getScoreObject',
  save:contextPath + '/score/saveScore',
}
//系统管理
export const sysDicPath = {
  flag: 'sysDicPath',
  Form: SysDicForm, List: SysDicList, Query: SysDicQuery,
  list: contextPath + '/sysDic/list',
  get: contextPath + '/sysDic/get',
  add: contextPath + '/sysDic/add',
  edit: contextPath + '/sysDic/edit',
  delete: contextPath + '/sysDic/delete',
  getDicVL: contextPath + '/sysDic/getDicVL',
  getDicValueList: contextPath + '/sysDic/getDicValueList'
}
export const sysDeptPath = {
  flag: 'sysDeptPath',
  Form: SysDeptForm, List: SysDeptList, Query: SysDeptQuery,
  list: contextPath + '/sysDept/list',
  get: contextPath + '/sysDept/get',
  add: contextPath + '/sysDept/add',
  edit: contextPath + '/sysDept/edit',
  delete: contextPath + '/sysDept/delete',
  getDeptTree: contextPath + '/sysDept/getDeptTree',
  getDeptUserTree: contextPath + '/sysDept/getDeptUserTree',
  getDeptUserTreeSelect:contextPath + '/sysDept/getDeptUserTreeSelect'
}
export const sysRolePath = {
  flag: 'sysRolePath',
  Form: SysRoleForm, List: SysRoleList,
  PermissionGiveForm: PermissionGiveForm,
  list: contextPath + '/sysRole/list',
  get: contextPath + '/sysRole/get',
  add: contextPath + '/sysRole/add',
  edit: contextPath + '/sysRole/edit',
  delete: contextPath + '/sysRole/delete',
  getRoleVL: contextPath + '/sysRole/getRoleVL',
  getRoleNameVL: contextPath + '/sysRole/getRoleNameVL',
  getRoleIdVL: contextPath + '/sysRole/getRoleIdVL',
  getRoleKT: contextPath + '/sysRole/getRoleKT',
  getRoleNameStr: contextPath + '/sysRole/getRoleNameStr',
  getPermissionGiveVO: contextPath + '/sysRole/getPermissionGiveVO',
  permissionGive: contextPath + '/sysRole/permissionGive'
}
export const sysPermissionPath = {
  flag: 'sysPermissionPath',
  Form: SysPermissionForm, List: SysPermissionList,
  list: contextPath + '/sysPermission/list',
  get: contextPath + '/sysPermission/get',
  add: contextPath + '/sysPermission/add',
  edit: contextPath + '/sysPermission/edit',
  delete: contextPath + '/sysPermission/delete',
  getPermissionTree: contextPath + '/sysPermission/getPermissionTree'
}
export const sysUserPath = {
  flag: 'sysUserPath',
  Form: SysUserForm, List: SysUserList, Query: SysUserQuery,
  RoleGiveForm: RoleGiveForm,
  list: contextPath + '/sysUser/list',
  get: contextPath + '/sysUser/get',
  add: contextPath + '/sysUser/add',
  edit: contextPath + '/sysUser/edit',
  delete: contextPath + '/sysUser/delete',
  login: contextPath + '/sysUser/login',
  ssoLogin: contextPath + '/sysUser/ssoLoginForPost',
  logout: contextPath + '/sysUser/logout',
  getNameStr: contextPath + '/sysUser/getNameStr',
  getRoleGiveVO: contextPath + '/sysUser/getRoleGiveVO',
  roleGive: contextPath + '/sysUser/roleGive',
  changePassword: contextPath + '/sysUser/changePassword',
  checkUser: contextPath + '/sysUser/checkUser',
  getUserVL: contextPath + '/sysUser/getUserVL',
  download1: contextPath + '/sysUser/download1',
  Upload1Form: SysUserUpload1Form,
  upload1: contextPath + '/sysUser/upload1'
}
//流程管理
export const asConfigTablePath = {
  asConfigTableList: contextPath + '/asConfig/getAsConfigTableList',
  asConfigColumnList: contextPath + '/asConfig/getAsConfigColumnList',
  asConfigTableTypeVO: contextPath + '/asConfig/getAsConfigTableTypeVO'
}

export const diskForHisForProcessPath = {
  // flag: 'lifeCirclePath',
  getDiskForHisForProcess:contextPath + '/diskForHisForProcess/getDiskForHisForProcess',

}

export const lifeCirclePath = {
  // flag: 'lifeCirclePath',
  List:LifeCircle,

}
export const processFormCustomTypePath = {
  flag: 'processFormCustomTypePath',
  Form: CustomTypeForm, List: CustomTypeList,
  list: contextPath + '/processFormCustomType/list',
  get: contextPath + '/processFormCustomType/get',
  add: contextPath + '/processFormCustomType/add',
  edit: contextPath + '/processFormCustomType/edit',
  delete: contextPath + '/processFormCustomType/delete'
}
export const processDefinitionPath = {
  flag: 'processDefinitionPath',
  DefList:ProcessDefinitonDefList,
  List: ProcessDefinitonList, Query: ProcessDefinitonQuery,
  list: contextPath + '/processDefinition/list',
  get: contextPath + '/processDefinition/get',
  copy: contextPath + '/processDefinition/copy',
  getProcessDefinitionVO: contextPath + '/processDefinition/getProcessDefinitionVO',
  add: contextPath + '/processDefinition/add',
  edit: contextPath + '/processDefinition/edit',
  delete: contextPath + '/processDefinition/delete',
  getTypeVL: contextPath + '/processDefinition/getTypeVL',
  getBaseTypeVL: contextPath + '/processDefinition/getBaseTypeVL',
  getTreeByTableNames: contextPath + '/processDefinition/getTreeByTableNames',
  getProcessDefLV: contextPath + '/processDefinition/getProcessDefLV',
  getOneCustomTableIdByProcDefId: contextPath + '/processDefinition/getOneCustomTableIdByProcDefId',
  getByName:contextPath + '/processDefinition/getByName',
}
export let processFormTemplatePath = {
  getFormTemplateTree: contextPath + '/processFormTemplate/getFormTemplateTree',
  getFormTemplateGroupTreeForSelect: contextPath + '/processFormTemplate/getFormTemplateGroupTreeForSelect',
  getSelectGroupIdList: contextPath + '/processFormTemplate/getSelectGroupIdList',
  getTableTypeVO: contextPath + '/processFormTemplate/getTableTypeVO',
  getTableTypeInstData: contextPath + '/processFormTemplate/getTableTypeInstData',
  getChangeColumnLabelIdMap:contextPath + '/processFormTemplate/getChangeColumnLabelIdMap',
  getGroupKT:contextPath + '/processFormTemplate/getGroupKT',
}
//流程实例
export const processInstanceDataPath = {
  flag: 'processInstanceDataPath',
  List: ProcessInstanceDataList, Query: ProcessInstanceDataQuery,
  list: contextPath + '/processInstanceData/list',
  currentList: contextPath + '/processInstanceData/currentList',
  historyList: contextPath + '/processInstanceData/historyList',
  get: contextPath + '/processInstanceData/get',
  start: contextPath + '/processInstanceData/start',
  endAndStart:contextPath + '/processInstanceData/endAndStart',
  handle: contextPath + '/processInstanceData/handle',
  delete: contextPath + '/processInstanceData/delete',
  getStartProcessConditionVO: contextPath + '/processInstanceData/getStartProcessConditionVO',
  getCheckTaskVO: contextPath + '/processInstanceData/getCheckTaskVO',
  getActiveTaskDefKeyList: contextPath + '/processInstanceData/getActiveTaskDefKeyList',
  modify: contextPath + '/processInstanceData/modify',
  getNewProcessDef:contextPath + '/processInstanceData/getNewProcessDef',
  getOneDeviceByProcessInstId:contextPath + '/processInstanceData/getOneDeviceByProcessInstId'
}
//待办任务
export const processInstanceDataMyPath = {
  flag: 'processInstanceDataMyPath',
  TodoList:ProcessInstanceDataTodoList,
  List: ProcessInstanceDataMyList, Query: ProcessInstanceDataMyQuery,
  list: contextPath + '/processInstanceData/myList'
}
//已办任务
export const processInstanceDataCompletePath = {
  flag: 'processInstanceDataCompletePath',
  DoneList:ProcessInstanceDataCompleteDoneList,
  List: ProcessInstanceDataCompleteList, Query: ProcessInstanceDataCompleteQuery,
  list: contextPath + '/processInstanceData/completeList'
}

export const processInstanceNodePath = {
  list: contextPath + '/processInstanceNode/list'
}
export const processInstanceChangePath = {
  list: contextPath + '/processInstanceChange/list'
}
export const processFormValue1Path = {
  get: contextPath + '/processFormValue1/get'
}
//设备
export const asDeviceCommonPath = {
  flag: 'asDeviceCommonPath',
  Form: AsDeviceCommonForm, List: AsDeviceCommonList,
  Query: AsDeviceCommonQuery,
  list: contextPath + '/asDeviceCommon/list',
  get: contextPath + '/asDeviceCommon/get',
  add: contextPath + '/asDeviceCommon/add',
  edit: contextPath + '/asDeviceCommon/edit',
  delete:contextPath + '/asDeviceCommon/delete',
  getLevelTwoAsTypeById: contextPath + '/asDeviceCommon/getLevelTwoAsTypeById',
  // getAsTypeTree: contextPath + '/asDeviceCommon/getAsTypeTree',
  getAsDeviceCommonNoVL: contextPath + '/asDeviceCommon/getAsDeviceCommonNoVL',
  download1: contextPath + '/asDeviceCommon/download1',
  Upload1Form: AsDeviceCommonUpload1Form,
  upload1: contextPath + '/asDeviceCommon/upload1'
}
