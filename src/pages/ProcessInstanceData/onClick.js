import React from 'react';
import {
  ajax,
  formRule,
  processDefinitionPath,
  processFormTemplatePath,
  processFormValue1Path,
  processInstanceDataPath,
  sysDicPath,
  diskForHisForProcessPath,
  formItemValidate,
  sysUserPath,
} from '../../utils';
import { Dialog } from 'nowrapper/lib/antd';
import ProcessFormForComplete from '../ProcessDefiniton/ProcessFormForComplete(暂时没用)';
import ProcessFormForStart from '../ProcessDefiniton/ProcessFormForStart';
import Abb from '../ProcessDefiniton/Test';
import SelectUserGroup from '../ProcessDefiniton/SelectUserGroup';
import ProcessFormForCheck from '../ProcessDefiniton/ProcessFormForCheck';
import ProcessFormForModify from '../ProcessDefiniton/ProcessFormForModify';
import ProcessFormForEndAndStart from '../ProcessDefiniton/ProcessFormForEndAndStart';
import { Button, message, Modal, Row, Col, Icon, Tabs } from 'antd';
import { Space, LoadingButton } from '../../components';
import ProcessGraph from '../ProcessDefiniton/ProcessGraph';
import renderModalForMutex from '../ProcessDefiniton/renderModalForMutex';
const { confirm } = Modal;
const { TabPane } = Tabs;
//20220630
export const onClickForStart = async (record, type) => {
  if (type === 'start') {
    // setTitle(record.processName);groupTreeForSelect
    //
    const userVL = await ajax.get(sysUserPath.getUserVL);
    let groupTreeForSelect = null;
    if (record.integrationMode != '代理流程') {
      console.log(' != 代理流程');
      groupTreeForSelect = await ajax.get(
        processFormTemplatePath.getFormTemplateGroupTreeForSelect,
        { processDefinitionId: record?.id },
      );
    }
    // if (userVL && groupTreeForSelect) {//20220712注释，字段组选择功能 在代理模式下暂不可用
    if (userVL) {
      console.log('groupTreeForSelect');
      console.log(userVL);
      //选择责任人和字段组
      let committerType, committerIdStr, committerName, selectGroupIdArr;
      Dialog.show({
        title: '表单选项',
        footerAlign: 'right',
        locale: 'zh',
        enableValidate: true,
        width: 450,
        content: (
          <SelectUserGroup
            record={record} //仅用于判断是不是“代理流程”
            userVL={userVL}
            groupTreeForSelect={groupTreeForSelect} //20220712 可能无值：也无妨
          />
        ),
        onOk: async (values, hide) => {
          //责任人
          committerType = values.committerType;
          if (values.committerType === '代其他人申请') {
            committerName = values.committerName;
            if (
              values.committerIdStr &&
              values.committerIdStr.indexOf(values.committerName) > 0
            ) {
              committerIdStr = values.committerIdStr;
            }
          }
          let processNameForEntity, processForEntity
          if (record.integrationMode === '代理流程') {
            processNameForEntity =
              values.assetType + record.processType + '流程'; //组织实体流程名：这里对流程命名规则有了约定
           processForEntity = await ajax.get(
              processDefinitionPath.getByName,
              {
                processDefinitionName: processNameForEntity,
              },
            );
            if (!processForEntity) {
              Modal.error({
                content: processNameForEntity + '不存在，请联系管理员！',
              });
              return;
            }
            record.id = processForEntity.id
          }
          //可见的字段组
          const data = await ajax.get(
            processFormTemplatePath.getSelectGroupIdList,
            {
              processDefinitionId: record.id,
              checkGroupIdArr: values.checkGroupIdArr, //20220712注意观察这个字段为 未定义的后果todo
            },
          );
          if (data) {
            console.log('20220712成功发送并返回getSelectGroupIdList数据');
            console.log(record.id);
            selectGroupIdArr = data; //20220712这个应该改名，应该叫可见的字段组
          }
          hide();
          //预加载数据,可以解决屏闪问题
          const formTree = await ajax.get(
            processFormTemplatePath.getFormTemplateTree,
            { processDefinitionId: record.id },
          );
          const tableTypeVO = await ajax.get(
            //todo改名
            processFormTemplatePath.getTableTypeVO,
            { processDefinitionId: record.id },
          );
          const startProcessConditionVO = await ajax.get(
            processInstanceDataPath.getStartProcessConditionVO,
            { processDefinitionId: record.id },
          );
          //20211206  获取template Label/id的映射；接收前端成为一个对象：属性名是label值，值为ID;是为了辅助“自动填充”功能准备的
          const changeColumnIdLableMap = await ajax.get(
            processFormTemplatePath.getChangeColumnIdLableMap,
            {
              processDefinitionId: record.id,
            },
          );
          Dialog.show({
            title: processForEntity?processNameForEntity:record.processName,
            footerAlign: 'right',
            locale: 'zh',
            enableValidate: true,
            width: '75%',
            content: (
              <Tabs animated={false}>
                <TabPane tab="表单" key="1">
                  <ProcessFormForStart
                    //20211205仅需要SelectUserGroup返回的values里的committerType(是否是代人申请)/committerName（代人申请时有值，格式是那种“拼接长串”）
                    userInfo={values} //仅用于传给formItemValidate作检验用
                    changeColumnIdLableMap={changeColumnIdLableMap}
                    record={processForEntity?processForEntity:record}
                    formTree={formTree}
                    tableTypeVO={tableTypeVO}
                    selectGroupIdArr={selectGroupIdArr}
                    startProcessConditionVO={startProcessConditionVO}
                  />
                </TabPane>
                <TabPane tab="流程图2" key="2">
                  <ProcessGraph id={record.id} />
                </TabPane>
              </Tabs>
            ),
            footer: (hide, { _, ctx: core }) => {
              //20211206todo总结  { _, ctx: core }这样就可以获取"包装的"组件的core!?张强：core只是ctx的别名
              let onClick = async (buttonName) => {
                //dialog特色：hide需要显示调用才会消失：而不是“内置”到某一类确定按钮的事件中
                let errorArr = await core.validate();
                if (errorArr) {
                  Object.keys(errorArr).forEach((key) => {
                    /*
                       key=16.计算机信息表.as_device_common.no.1 或
                       key=operatorTypeLabel
                     */
                    if (
                      key.split('.').length === 5 ||
                      key === 'operatorTypeLabel'
                    ) {
                      core.setValue(key + 'ErrMsg', errorArr[key]);
                    }
                  });
                  message.error('请检查必填项');
                } else {
                  let values = core.getValues();
                  //表单的日期处理
                  values = formRule.dateHandle('stringify', values);
                  //表单的ErrMsg处理
                  values = formRule.errMsgHandle(values);
                  //20211206 todo添加表单校验,思考表单template结构数据data4定义在ProcessFormForStart，如何共用？
                  const msg = formItemValidate(changeColumnIdLableMap, values);
                  if (msg) {
                    Modal.error({
                      title: '提示',
                      content: <div> {msg}</div>,
                    });
                    return;
                  }
                  console.log('20220618 提交前的values');
                  console.log(values);
                  let startVO = {
                    buttonName: buttonName,
                    value: null,
                    value1: { processDefinitionId: record.id }, //20220531,todo问，感觉不能动态在后面添加成员
                    value2List: [],
                  };
                  if (values.diskListForHisForProcess) {
                    //20220619加
                    startVO.diskListForHisForProcess =
                      values.diskListForHisForProcess;
                    delete values.diskListForHisForProcess;
                  }
                  console.log(values);
                  if (values.asset) {
                    startVO.value2List = values.asset;
                    //   delete values.asset;
                  }
                  if (committerType) {
                    startVO.value1.committerType = committerType;
                  }
                  if (committerIdStr) {
                    startVO.value1.committerIdStr = committerIdStr;
                  }
                  if (committerName) {
                    //20211203 本人提交时不走这里
                    //alert(committerName)

                    startVO.value1.committerName = committerName;
                  }
                  if (selectGroupIdArr && selectGroupIdArr.length > 0) {
                    startVO.value1.selectGroupId = selectGroupIdArr.join(',');
                  }
                  //是否有下一步处理人
                  startVO.haveNextUser = startProcessConditionVO.haveNextUser;
                  if (startProcessConditionVO.haveNextUser === '是') {
                    startVO.operatorType = values.operatorType;
                    startVO.operatorTypeValue = values.operatorTypeValue;
                    startVO.operatorTypeLabel = values.operatorTypeLabel;
                    if (values.haveStarterDept) {
                      startVO.haveStarterDept = values.haveStarterDept;
                      delete values.haveStarterDept;
                    }
                    delete values.operatorType;
                    delete values.operatorTypeValue;
                    delete values.operatorTypeLabel;
                  }

                  //20220510注意：这里把组件的值拼成json字符串了
                  startVO.value1.value = JSON.stringify(values); //20220415 表单里的值组成的是一个json对象？还是普通JS对象?后者，并且js中json对象也是js对象的一种;
                  //20211125需要再添加对资产状态与流程实例的互斥关系的判断，来阻止用户发流程todo
                  const data = await ajax.post(
                    //”用户未登陆/后台报异常“等异常情况已被ajax.js函数预处理/拦截，不返回&阻塞
                    processInstanceDataPath.start,
                    startVO,
                  );
                  if (data) {
                    //20211220加超时判断：超时会返回空
                    if (data.isSuccess) {
                      //20211111再发ajax判断该资产对应的约束性流程是否还未走完
                      hide();
                      // list.refresh();
                      message.success('发起成功');
                    } else {
                      Modal.error({
                        content: (
                          <div>
                            <Row>
                              <span style={{ fontWeight: 'bold' }}>
                                以下流程未处理完前，不可发起新流程：
                              </span>
                            </Row>
                            <Row>
                              <Col span={5}>流程编号</Col>
                              <Col span={8}>流程名称</Col>
                              <Col span={11}>当前步骤</Col>
                            </Row>
                            {renderModalForMutex(data.processInstanceDataList)}
                          </div>
                        ),
                        okText: '知道了',
                      });
                    }
                  } else {
                    message.success('发送超时');
                  }
                }
              };
              let btnArr = [];
              if (
                startProcessConditionVO &&
                startProcessConditionVO.buttonNameList
              ) {
                startProcessConditionVO.buttonNameList.forEach((buttonName) => {
                  btnArr.push(
                    //20211222断点
                    <LoadingButton
                      onClick={onClick}
                      param={buttonName}
                      type={'primary'}
                    >
                      {buttonName}
                    </LoadingButton>,
                  );
                });
              } else {
                //20211222断点
                btnArr.push(
                  <LoadingButton
                    onClick={onClick}
                    param={null}
                    type={'primary'}
                  >
                    提交
                  </LoadingButton>,
                );
              }
              btnArr.push(
                <Button
                  onClick={() => {
                    hide();
                  }}
                >
                  取消
                </Button>,
              );
              return (
                <Space style={{ marginTop: 25, textAlign: 'center' }}>
                  {btnArr}
                </Space>
              );
            },
          });
        },
      });
    }
  }
};
//待办任务
//注：这是一个函数；函数里还定义了函数;2022022可以考虑把下面这些Ajax封装成一个VO
export const onClickForMy = async (record, list) => {
  //processDefinition
  console.log('20220702');
  console.log(record);
  const processDefinition = await ajax.get(processDefinitionPath.get, {
    processDefinitionId: record.processDefinitionId,
  });
  //processFormValue1
  const processFormValue1 = await ajax.get(processFormValue1Path.get, {
    processDefinitionId: record.processDefinitionId,
    actProcessInstanceId: record.actProcessInstanceId,
  });
  //预加载数据,可以解决屏闪问题
  const formTree = await ajax.get(processFormTemplatePath.getFormTemplateTree, {
    processDefinitionId: record.processDefinitionId,
  });
  //自定义表的字段NAME/Label
  const tableTypeVO = await ajax.get(processFormTemplatePath.getTableTypeVO, {
    processDefinitionId: record.processDefinitionId,
  });
  const checkTaskVO = await ajax.get(processInstanceDataPath.getCheckTaskVO, {
    processDefinitionId: record.processDefinitionId,
    actProcessInstanceId: record.actProcessInstanceId,
  });
  //20220622加
  const diskListForHisForProcess = await ajax.get(
    diskForHisForProcessPath.getDiskForHisForProcess,
    {
      processInstanceDataId: record.id,
    },
  );
  const operateArr = await ajax.get(sysDicPath.getDicValueList, {
    flag: '操作类型',
  });
  let recordOld;
  if (record.preProcessInstanceId) {
    recordOld = await ajax.get(processInstanceDataPath.get, {
      id: record.preProcessInstanceId,
    });
  }
  if (processDefinition && processFormValue1 && formTree && checkTaskVO) {
    Dialog.show({
      title: recordOld ? (
        <div>
          {record.processName}——编号:{record.id}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;注：本流程关联前置流程
          <a onClick={() => onClickForCurrent(recordOld)}>
            {recordOld.processName}
          </a>
          ,点击查看详情
        </div>
      ) : (
        <div>
          {record.processName}——编号:{record.id}
        </div>
      ),
      footerAlign: 'right',
      locale: 'zh',
      enableValidate: true,
      width: '75%',
      content: (
        <ProcessFormForCheck
          record={record}
          recordOld={recordOld}
          formTree={formTree}
          diskListForHisForProcess={diskListForHisForProcess}
          tableTypeVO={tableTypeVO}
          selectGroupIdArr={processFormValue1.selectGroupId
            ?.split(',')
            .map((item) => parseInt(item))}
          processDefinition={processDefinition}
          processFormValue1={processFormValue1}
          checkTaskVO={checkTaskVO}
          operateArr={operateArr}
        />
      ),
      footer: (hide, { _, ctx: core }) => {
        let onClick = async (buttonName) => {
          let errorArr = await core.validate();
          if (errorArr) {
            //20220626可能仅仅为拦截'operatorTypeLabel'之类的用‘item’包装的输入框：item里内嵌的validate不能实际阻拦&也不显示错误提示：item/validate的required属性仅能使其显示一个“*”
            Object.keys(errorArr).forEach((key) => {
              // key=operatorTypeLabel
              if (key === 'operatorTypeLabel') {
                core.setValue(key + 'ErrMsg', errorArr[key]);
              }
            });
            message.error('请检查必填项');
          } else {
            let checkVO = {
              //20220607 VS checkTaskVO:后者是后台传前台的，todo查下到底有没有名命规范表示传输方向
              //checkVO是返回后台的，建议与后台转向台的checkTaskVO区分下，叫个dto得了！？
              processInstanceDataId: record.id,
              buttonName: buttonName,
              value2List: [],
              value1: {
                processDefinitionId: record.processDefinitionId,
                value: '',
              },
            };
            let values = core.getValues();
            checkVO.haveEditForm = checkTaskVO.haveEditForm;
            if (checkTaskVO.haveEditForm === '是') {
              //表单的日期处理
              values = formRule.dateHandle('stringify', values);
              //表单的ErrMsg处理
              values = formRule.errMsgHandle(values);
            }
            //20220531加
            if (values.asset) {
              checkVO.value2List = values.asset;
              // delete values.asset;
            }
            //20220627加
            // if (values.asset) {//没必要判断空
            checkVO.selectedProcess = values.selectedProcess;
            // delete values.asset;
            //}
            //20220621加：为了最后流程结束保存结果时用
            if (values.diskListForHisForProcess) {
              checkVO.diskListForHisForProcess =
                values.diskListForHisForProcess;
              delete values.diskListForHisForProcess; //不删除也没事
            }
            //是否有下一步处理人
            checkVO.haveNextUser = checkTaskVO.haveNextUser;
            if (checkTaskVO.haveNextUser === '是') {
              checkVO.operatorType = values.operatorType;
              checkVO.operatorTypeValue = values.operatorTypeValue;
              checkVO.operatorTypeLabel = values.operatorTypeLabel;
              if (values.haveStarterDept) {
                checkVO.haveStarterDept = values.haveStarterDept;
                delete values.haveStarterDept;
              }
              delete values.operatorType;
              delete values.operatorTypeValue;
              delete values.operatorTypeLabel;
            }
            //是否有审批意见
            checkVO.haveComment = checkTaskVO.haveComment;
            if (checkTaskVO.haveComment === '是') {
              checkVO.comment = values.comment;
              delete values.comment;
            }
            //是否有操作记录
            checkVO.haveOperate = checkTaskVO.haveOperate;
            if (checkTaskVO.haveOperate === '是') {
              if (values.operate) {
                checkVO.operate = values.operate.join(',');
              }
              delete values.operate;
            }
            //是否可有后续流程
            checkVO.haveSelectProcess = checkTaskVO.haveSelectProcess;
            if (checkTaskVO.haveSelectProcess === '是') {
              checkVO.selectedProcess = values.selectedProcess;
              delete values.selectedProcess;
            }
            //20220531
            checkVO.value1.value = JSON.stringify(values);
            //20211117添加对”退回“操作的确认
            if (buttonName?.includes('退回')) {
              //20211130 buttonName可能为空
              confirm({
                title: '提示',
                content: '确定要退回本流程吗?',
                okText: '确定',
                okType: 'danger',
                okButtonProps: {
                  disabled: false,
                },
                cancelText: '取消',
                onOk: async () => {
                  const data = await ajax.post(
                    processInstanceDataPath.handle,
                    checkVO,
                  );
                  if (data) {
                    hide();
                    list.refresh();
                    message.success('成功退回');
                  }
                },
                onCancel() {
                  return;
                },
              });
              return;
            }
            const data = await ajax.post(
              processInstanceDataPath.handle,
              checkVO,
            );
            if (data) {
              //20211220加超时判断：超时会返回空
              if (data.isSuccess) {
                //20211111再发ajax判断该资产对应的约束性流程是否还未走完
                hide();
                list.refresh();
                message.success('提交成功');
              } else {
                Modal.error({
                  content: (
                    <div>
                      <Row>
                        <span style={{ fontWeight: 'bold' }}>
                          以下流程未处理完前，不可发起本流程：
                        </span>
                      </Row>
                      <Row>
                        <Col span={5}>流程编号</Col>
                        <Col span={8}>流程名称</Col>
                        <Col span={11}>当前步骤</Col>
                      </Row>
                      {renderModalForMutex(data.processInstanceDataList)}
                    </div>
                  ),
                  okText: '知道了',
                });
                console.log(data.processInstanceDataList);
              }
            } else {
              message.success('提交失败');
            }
          }
        };
        let btnArr = [];
        if (checkTaskVO && checkTaskVO.buttonNameList) {
          checkTaskVO.buttonNameList.forEach((buttonName) => {
            btnArr.push(
              <LoadingButton
                onClick={onClick}
                param={buttonName}
                type={buttonName === '退回' ? '' : 'primary'}
              >
                {buttonName}
              </LoadingButton>,
            );
          });
          btnArr.push(
            <Button
              style={{ float: 'right' }}
              onClick={() => {
                hide();
              }}
            >
              取消
            </Button>,
          );
        } else {
          btnArr.push(
            //20211201尝试了另一种写法
            <LoadingButton onClick={onClick} param={null} type={'primary'}>
              提交
            </LoadingButton>,
          );
          btnArr.push(
            <Button
              onClick={() => {
                hide();
              }}
            >
              取消
            </Button>,
          );
        }
        return (
          <Space style={{ marginTop: 25, textAlign: 'center' }}>{btnArr}</Space>
        );
      },
    });
  }
};
//20220630
export const onClickForNextProcess = async (recordOld, list) => {
  // setTitle(recordOld.processName);
  //
  const recordNew = await ajax.get(processInstanceDataPath.getNewProcessDef, {
    processInstanceDataId: recordOld.id,
  });
  //20220702加
  const asDeviceCommon = await ajax.get(
    processInstanceDataPath.getOneDeviceByProcessInstId, //获取资产号对应的自定义表中的相应字段值数据
    { processInstanceDataId: recordOld.id },
  );
  const groupTreeForSelect = await ajax.get(
    processFormTemplatePath.getFormTemplateGroupTreeForSelect,
    { processDefinitionId: recordNew.id },
  );
  //20220702加
  const customTableIdByProcDefId = await ajax.get(
    processDefinitionPath.getOneCustomTableIdByProcDefId, //获取资产号对应的自定义表中的相应字段值数据;注：只取一个自定义表ID
    { processDefId: recordNew.id },
  );

  //20220702加
  const tableTypeInstData = await ajax.get(
    processFormTemplatePath.getTableTypeInstData, //获取资产号对应的自定义表中的相应字段值数据
    {
      customTableId: customTableIdByProcDefId, //todo断点
      asDeviceCommonId: asDeviceCommon.id, //
      processDefinitionId: recordNew.id,
    },
  );
  //20220712加
  const asset = [
    { customTableId: customTableIdByProcDefId, asId: asDeviceCommon.id },
  ];
  //选择责任人和字段组
  let selectGroupIdArr;
  Dialog.show({
    title: '提示',
    footerAlign: 'right',
    locale: 'zh',
    enableValidate: true,
    width: 450,
    content: (
      <Row>
        本流程{' '}
        <a
          onClick={() => {
            onClickForCurrent(recordOld);
          }}
        >
          {' '}
          <span style={{ fontWeight: 'bold' }}>{recordOld.processName} </span>
        </a>
        已审批完毕，点击确定即可授权发起
        <span style={{ fontWeight: 'bold' }}>{recordNew.processName} </span>
      </Row>
    ),
    onOk: async (values, hide) => {
      //责任人
      // committerType = values.committerType;
      // if (values.committerType === '代其他人申请') {
      //   committerName = values.committerName;
      //   if (
      //     values.committerIdStr &&
      //     values.committerIdStr.indexOf(values.committerName) > 0
      //   ) {
      //     committerIdStr = values.committerIdStr;
      //   }
      // }
      //字段组
      const data = await ajax.get(
        processFormTemplatePath.getSelectGroupIdList,
        {
          processDefinitionId: recordNew.id,
          checkGroupIdArr: null, //20220703改成null
        },
      );
      if (data) {
        selectGroupIdArr = data;
      }
      hide();
      //预加载数据,可以解决屏闪问题
      const formTree = await ajax.get(
        processFormTemplatePath.getFormTemplateTree,
        { processDefinitionId: recordNew.id },
      );
      const tableTypeVO = await ajax.get(
        //todo改名
        processFormTemplatePath.getTableTypeVO,
        { processDefinitionId: recordNew.id },
      );
      const startProcessConditionVO = await ajax.get(
        processInstanceDataPath.getStartProcessConditionVO,
        { processDefinitionId: recordNew.id },
      );
      //20211206  获取template Label/id的映射；接收前端成为一个对象：属性名是label值，值为ID;是为了辅助“自动填充”功能准备的
      const changeColumnIdLableMap = await ajax.get(
        processFormTemplatePath.getChangeColumnIdLableMap,
        {
          processDefinitionId: recordNew.id,
        },
      );
      Dialog.show({
        title: (
          <div>
            {recordNew.processName}————注：本流程关联前置流程
            <a onClick={() => onClickForCurrent(recordOld)}>
              {recordOld.processName}
            </a>
            ,点击查看详情
          </div>
        ),
        footerAlign: 'right',
        locale: 'zh',
        enableValidate: true,
        width: '75%',
        content: (
          <Tabs animated={false}>
            <TabPane tab="表单" key="1">
              <ProcessFormForEndAndStart
                //20211205仅需要SelectUserGroup返回的values里的committerType(是否是代人申请)/committerName（代人申请时有值，格式是那种“拼接长串”）
                userInfo={values} //这个属性仅用于自动填充表单相关字段
                changeColumnIdLableMap={changeColumnIdLableMap}
                record={recordNew}
                //  preProcessInstDataId={recordOld.id}
                formTree={formTree}
                tableTypeVO={tableTypeVO}
                selectGroupIdArr={selectGroupIdArr}
                startProcessConditionVO={startProcessConditionVO}
                tableTypeInstData={tableTypeInstData} //20220703加
                asset={asset}
              />
            </TabPane>
            <TabPane tab="流程图2" key="2">
              <ProcessGraph id={recordNew.id} />
            </TabPane>
          </Tabs>
        ),
        footer: (hide, { _, ctx: core }) => {
          //20211206todo总结  { _, ctx: core }这样就可以获取"包装的"组件的core!?张强：core只是ctx的别名
          let onClick = async (buttonName) => {
            //dialog特色：hide需要显示调用才会消失：而不是“内置”到某一类确定按钮的事件中
            let errorArr = await core.validate();
            if (errorArr) {
              Object.keys(errorArr).forEach((key) => {
                /*
                     key=16.计算机信息表.as_device_common.no.1 或
                     key=operatorTypeLabel
                   */
                if (
                  key.split('.').length === 5 ||
                  key === 'operatorTypeLabel'
                ) {
                  core.setValue(key + 'ErrMsg', errorArr[key]);
                }
              });
              message.error('请检查必填项');
            } else {
              let values = core.getValues();
              //表单的日期处理
              values = formRule.dateHandle('stringify', values);
              //表单的ErrMsg处理
              values = formRule.errMsgHandle(values);
              //20211206 todo添加表单校验,思考表单template结构数据data4定义在ProcessFormForStart，如何共用？
              const msg = formItemValidate(changeColumnIdLableMap, values);
              if (msg) {
                Modal.error({
                  title: '提示',
                  content: <div> {msg}</div>,
                });
                return;
              }
              console.log('20220618 提交前的values');
              console.log(values);
              let startVO = {
                buttonName: buttonName,
                value: null,
                value1: { processDefinitionId: recordNew.id }, //20220531,todo问，感觉不能动态在后面添加成员
                value2List: [],
              };
              if (values.diskListForHisForProcess) {
                //20220619加
                startVO.diskListForHisForProcess =
                  values.diskListForHisForProcess;
                delete values.diskListForHisForProcess;
              }
              console.log(values);
              if (values.asset) {
                startVO.value2List = values.asset;
                //   delete values.asset;
              }
              // if (committerType) {
              startVO.value1.committerType = '给本人申请';
              //  }
              // if (committerIdStr) {
              //   startVO.value1.committerIdStr = committerIdStr;
              // }
              // if (committerName) {
              //   //20211203 本人提交时不走这里
              //   //alert(committerName)

              //   startVO.value1.committerName = committerName;
              // }
              if (selectGroupIdArr && selectGroupIdArr.length > 0) {
                startVO.value1.selectGroupId = selectGroupIdArr.join(',');
              }
              //20220702 加
              // startVO.recordNew = recordNew;
              //20220702 加
              startVO.preProcessInstDataId = recordOld.id;
              //是否有下一步处理人
              startVO.haveNextUser = startProcessConditionVO.haveNextUser;
              if (startProcessConditionVO.haveNextUser === '是') {
                startVO.operatorType = values.operatorType;
                startVO.operatorTypeValue = values.operatorTypeValue;
                startVO.operatorTypeLabel = values.operatorTypeLabel;
                if (values.haveStarterDept) {
                  startVO.haveStarterDept = values.haveStarterDept;
                  delete values.haveStarterDept;
                }
                delete values.operatorType;
                delete values.operatorTypeValue;
                delete values.operatorTypeLabel;
              }

              //20220510注意：这里把组件的值拼成json字符串了
              startVO.value1.value = JSON.stringify(values); //20220415 表单里的值组成的是一个json对象？还是普通JS对象?后者，并且js中json对象也是js对象的一种;
              //20211125需要再添加对资产状态与流程实例的互斥关系的判断，来阻止用户发流程todo
              const data = await ajax.post(
                //”用户未登陆/后台报异常“等异常情况已被ajax.js函数预处理/拦截，不返回&阻塞
                processInstanceDataPath.endAndStart,
                startVO,
              );
              if (data) {
                //20211220加超时判断：超时会返回空
                if (data.isSuccess) {
                  //20211111再发ajax判断该资产对应的约束性流程是否还未走完
                  hide();
                  list.refresh();
                  message.success('发起成功');
                } else {
                  Modal.error({
                    content: (
                      <div>
                        <Row>
                          <span style={{ fontWeight: 'bold' }}>
                            以下流程未处理完前，不可发起新流程：
                          </span>
                        </Row>
                        <Row>
                          <Col span={5}>流程编号</Col>
                          <Col span={8}>流程名称</Col>
                          <Col span={11}>当前步骤</Col>
                        </Row>
                        {renderModalForMutex(data.processInstanceDataList)}
                      </div>
                    ),
                    okText: '知道了',
                  });
                }
              } else {
                message.success('发送超时');
              }
            }
          };
          let btnArr = [];
          if (
            startProcessConditionVO &&
            startProcessConditionVO.buttonNameList
          ) {
            startProcessConditionVO.buttonNameList.forEach((buttonName) => {
              btnArr.push(
                //20211222断点
                <LoadingButton
                  onClick={onClick}
                  param={buttonName}
                  type={buttonName === '退回' ? '' : 'primary'}
                >
                  {buttonName}
                </LoadingButton>,
              );
            });
          } else {
            //20211222断点
            btnArr.push(
              <LoadingButton onClick={onClick} param={null} type={'primary'}>
                提交
              </LoadingButton>,
            );
          }
          btnArr.push(
            <Button
              onClick={() => {
                hide();
              }}
            >
              取消
            </Button>,
          );
          return (
            <Space style={{ marginTop: 25, textAlign: 'center' }}>
              {btnArr}
            </Space>
          );
        },
      });
    },
  });
};
//流程实例的修改表单
export const onClickForModify = async (record, list) => {
  //processDefinition
  const processDefinition = await ajax.get(processDefinitionPath.get, {
    processDefinitionId: record.processDefinitionId,
  });
  //processFormValue1
  const processFormValue1 = await ajax.get(processFormValue1Path.get, {
    processDefinitionId: record.processDefinitionId,
    actProcessInstanceId: record.actProcessInstanceId,
  });
  //预加载数据,可以解决屏闪问题
  const formTree = await ajax.get(processFormTemplatePath.getFormTemplateTree, {
    processDefinitionId: record.processDefinitionId,
  });
  const tableTypeVO = await ajax.get(processFormTemplatePath.getTableTypeVO, {
    processDefinitionId: record.processDefinitionId,
  });
  //20220625加
  const diskListForHisForProcess = await ajax.get(
    diskForHisForProcessPath.getDiskForHisForProcess,
    {
      processInstanceDataId: record.id,
    },
  );
  if (processDefinition && processFormValue1 && formTree) {
    Dialog.show({
      title: record.processName + '——编号:' + record.id,
      footerAlign: 'right',
      locale: 'zh',
      enableValidate: true,
      width: '75%',
      content: (
        <ProcessFormForModify
          record={record}
          formTree={formTree}
          tableTypeVO={tableTypeVO}
          diskListForHisForProcess={diskListForHisForProcess}
          selectGroupIdArr={processFormValue1.selectGroupId
            .split(',')
            .map((item) => parseInt(item))}
          processDefinition={processDefinition}
          processFormValue1={processFormValue1}
        />
      ),
      footer: (hide, { _, ctx: core }) => {
        return (
          <Space style={{ marginTop: 25, textAlign: 'center' }}>
            <Button
              onClick={async () => {
                let errorArr = await core.validate();
                if (!errorArr) {
                  let values = core.getValues();
                  //表单的日期处理
                  values = formRule.dateHandle('stringify', values);
                  let VO = {
                    processFormValue1Id: record.businessId,
                    value: JSON.stringify(values),
                  };
                  const data = await ajax.post(
                    processInstanceDataPath.modify,
                    VO,
                  );
                  if (data) {
                    hide();
                    list.refresh();
                    message.success('修改成功');
                  }
                }
              }}
              type="primary"
            >
              修改
            </Button>
            <Button
              onClick={() => {
                hide();
              }}
            >
              取消
            </Button>
          </Space>
        );
      },
    });
  }
};
//当前工单
export const onClickForCurrent = async (record) => {
  const processDefinition = await ajax.get(processDefinitionPath.get, {
    processDefinitionId: record.processDefinitionId,
  });
  //processFormValue1
  const processFormValue1 = await ajax.get(processFormValue1Path.get, {
    processDefinitionId: record.processDefinitionId,
    actProcessInstanceId: record.actProcessInstanceId,
  });
  //预加载数据,可以解决屏闪问题
  const formTree = await ajax.get(processFormTemplatePath.getFormTemplateTree, {
    processDefinitionId: record.processDefinitionId,
  });
  const tableTypeVO = await ajax.get(processFormTemplatePath.getTableTypeVO, {
    processDefinitionId: record.processDefinitionId,
  });
  //20220625加
  const diskListForHisForProcess = await ajax.get(
    diskForHisForProcessPath.getDiskForHisForProcess,
    {
      processInstanceDataId: record.id,
    },
  );
  if (processDefinition && processFormValue1 && formTree) {
    Dialog.show({
      title: record.processName + '——编号:' + record.id,
      footerAlign: 'right',
      locale: 'zh',
      enableValidate: true,
      width: '75%',
      content: (
        <ProcessFormForModify
          record={record}
          formTree={formTree}
          tableTypeVO={tableTypeVO}
          diskListForHisForProcess={diskListForHisForProcess}
          selectGroupIdArr={processFormValue1.selectGroupId
            .split(',')
            .map((item) => parseInt(item))}
          processDefinition={processDefinition}
          processFormValue1={processFormValue1}
        />
      ),
      footer: () => {},
    });
  }
};
//已办任务、工单查看、历史工单
export const onClickForComplete = async (record) => {
  const processDefinition = await ajax.get(processDefinitionPath.get, {
    processDefinitionId: record.processDefinitionId,
  });
  //processFormValue1
  const processFormValue1 = await ajax.get(processFormValue1Path.get, {
    processDefinitionId: record.processDefinitionId,
    actProcessInstanceId: record.actProcessInstanceId,
  });
  //预加载数据,可以解决屏闪问题
  const formTree = await ajax.get(processFormTemplatePath.getFormTemplateTree, {
    processDefinitionId: record.processDefinitionId,
  });
  const tableTypeVO = await ajax.get(processFormTemplatePath.getTableTypeVO, {
    processDefinitionId: record.processDefinitionId,
  });
  //20220625加
  const diskListForHisForProcess = await ajax.get(
    diskForHisForProcessPath.getDiskForHisForProcess,
    {
      processInstanceDataId: record.id,
    },
  );
  if (processDefinition && processFormValue1 && formTree) {
    Dialog.show({
      title: record.processName + '——编号:' + record.id,
      footerAlign: 'right',
      locale: 'zh',
      enableValidate: true,
      width: '75%',
      content: (
        <ProcessFormForModify
          record={record}
          formTree={formTree}
          tableTypeVO={tableTypeVO}
          diskListForHisForProcess={diskListForHisForProcess}
          selectGroupIdArr={processFormValue1.selectGroupId
            .split(',')
            .map((item) => parseInt(item))}
          processDefinition={processDefinition}
          processFormValue1={processFormValue1}
        />
      ),
      footer: () => {},
    });
  }
};
