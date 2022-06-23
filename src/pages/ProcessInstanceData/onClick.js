import React from 'react';
import {
  ajax,
  formRule,
  processDefinitionPath,
  processFormTemplatePath,
  processFormValue1Path,
  processInstanceDataPath,
  sysDicPath,
  diskForHisForProcessPath
  
} from '../../utils';
import { Dialog } from 'nowrapper/lib/antd';
import ProcessFormForComplete from '../ProcessDefiniton/ProcessFormForComplete';
import ProcessFormForCheck from '../ProcessDefiniton/ProcessFormForCheck';
import ProcessFormForModify from '../ProcessDefiniton/ProcessFormForModify';
import { Button, message, Modal, Row, Col } from 'antd';
import { Space, LoadingButton } from '../../components';
import renderModalForMutex from '../ProcessDefiniton/renderModalForMutex'
const { confirm } = Modal;
//待办任务
//注：这是一个函数；函数里还定义了函数;2022022可以考虑把下面这些Ajax封装成一个VO
export const onClickForMy = async (record, list) => {
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
  //自定义表的字段NAME/Label
  const tableTypeVO = await ajax.get(processFormTemplatePath.getTableTypeVO, {
    processDefinitionId: record.processDefinitionId,
  });
  const checkProcessConditionVO = await ajax.get(
    processInstanceDataPath.getCheckProcessConditionVO,
    {
      processDefinitionId: record.processDefinitionId,
      actProcessInstanceId: record.actProcessInstanceId,
    },
  );
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
  if (processDefinition && processFormValue1 && formTree && checkProcessConditionVO) {
    Dialog.show({
      title: record.processName + '——编号:' + record.id,
      footerAlign: 'right',
      locale: 'zh',
      enableValidate: true,
      width: '75%',
      content: (
        <ProcessFormForCheck
          record={record}
          formTree={formTree}
          diskListForHisForProcess={diskListForHisForProcess}
          tableTypeVO={tableTypeVO}
          selectGroupIdArr={processFormValue1.selectGroupId
            ?.split(',')
            .map((item) => parseInt(item))}
          processDefinition={processDefinition}
          processFormValue1={processFormValue1}
          checkProcessConditionVO={checkProcessConditionVO}
          operateArr={operateArr}
        />
      ),
      footer: (hide, { _, ctx: core }) => {
        let onClick = async (buttonName) => {
          let errorArr = await core.validate();
          if (errorArr) {
            Object.keys(errorArr).forEach((key) => {
              // key=operatorTypeLabel
              if (key === 'operatorTypeLabel') {
                core.setValue(key + 'ErrMsg', errorArr[key]);
              }
            });
            message.error('请检查必填项');
          } else {
            let checkVO = {//20220607 VS checkProcessConditionVO:后者是后台传前台的，todo查下到底有没有名命规范表示传输方向
              //checkVO是返回后台的，建议与后台转向台的checkProcessConditionVO区分下，叫个dto得了！？
              processInstanceDataId: record.id,
              buttonName: buttonName,
              value2List: [],
              value1:{processDefinitionId:record.processDefinitionId,value:''}
            };
            let values = core.getValues();
      
            checkVO.haveEditForm = checkProcessConditionVO.haveEditForm;
            if (checkProcessConditionVO.haveEditForm === '是') {
              //表单的日期处理
              values = formRule.dateHandle('stringify', values);
              //表单的ErrMsg处理
              values = formRule.errMsgHandle(values);
            }
            //20220531加
            if (values.asset) {
              checkVO.value2List = values.asset;
              //20220601删除
              delete values.asset;
            }
            //20220621加：为了最后流程结束保存结果时用
            if (values.diskListForHisForProcess) {
              checkVO.diskListForHisForProcess = values.diskListForHisForProcess;
              delete values.diskListForHisForProcess;
            }
            //是否有下一步处理人
            checkVO.haveNextUser = checkProcessConditionVO.haveNextUser;
            if (checkProcessConditionVO.haveNextUser === '是') {
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
            checkVO.haveComment = checkProcessConditionVO.haveComment;
            if (checkProcessConditionVO.haveComment === '是') {
              checkVO.comment = values.comment;
              delete values.comment;
            }
            //是否有操作记录
            checkVO.haveOperate = checkProcessConditionVO.haveOperate;
            if (checkProcessConditionVO.haveOperate === '是') {
              if (values.operate) {
                checkVO.operate = values.operate.join(',');
              }
              delete values.operate;
            }
           //20220531
            checkVO.value1.value= JSON.stringify(values);
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
            if (data) {//20211220加超时判断：超时会返回空
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
        if (checkProcessConditionVO && checkProcessConditionVO.buttonNameList) {
          checkProcessConditionVO.buttonNameList.forEach((buttonName) => {
            btnArr.push(
              <LoadingButton
                onClick={onClick}
                param={buttonName}
                type={'primary'}
              >
                {buttonName}
              </LoadingButton>,
            );
          });
          btnArr.push(
            <Button
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
  if (processDefinition && processFormValue1 && formTree && checkProcessConditionVO) {
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
  const checkProcessConditionVO = await ajax.get(
    processInstanceDataPath.getCheckProcessConditionVO,
    {
      processDefinitionId: record.processDefinitionId,
      actProcessInstanceId: record.actProcessInstanceId,
    },
  );

  const operateArr = await ajax.get(sysDicPath.getDicValueList, {
    flag: '操作类型',
  });
  if (processDefinition && processFormValue1 && formTree && checkProcessConditionVO) {
    Dialog.show({
      title: record.processName,
      footerAlign: 'right',
      locale: 'zh',
      enableValidate: true,
      width: '75%',
      content: (
        <ProcessFormForComplete
          record={record}
          formTree={formTree}
          tableTypeVO={tableTypeVO}
          selectGroupIdArr={processFormValue1.selectGroupId
            .split(',')
            .map((item) => parseInt(item))}
          processDefinition={processDefinition}
          processFormValue1={processFormValue1}
          checkProcessConditionVO={checkProcessConditionVO}
          operateArr={operateArr}
        />
      ),
      footer: () => {},
    });
  }
};
//已办任务、流程实例、历史工单
export const onClickForComplete = async (record) => {
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
  if (processDefinition && processFormValue1 && formTree) {
    Dialog.show({
      title: record.processName,
      footerAlign: 'right',
      locale: 'zh',
      enableValidate: true,
      width: '75%',
      content: (
        <ProcessFormForComplete
          record={record}
          formTree={formTree}
          tableTypeVO={tableTypeVO}
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
