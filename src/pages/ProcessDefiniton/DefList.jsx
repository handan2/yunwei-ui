import React, { useState } from 'react';
import { Button, message, Modal, Steps, Row, Col, Tabs } from 'antd';
import { Dialog } from 'nowrapper/lib/antd';
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd';
import ProcessGraph from './ProcessGraph'
import renderModalForMutex from './renderModalForMutex'
import DefList from './DefList'
const { TabPane } = Tabs
const { confirm } = Modal
import {
  ajax,
  formRule,
  listFormatBefore,
  listFormatAfter,
  processDefinitionPath,
  processFormTemplatePath,
  processInstanceDataPath,
  sysUserPath,
  formItemValidate
} from '../../utils';
import { QueryCondition, Space, LoadingButton } from '../../components';
import ProcessFormForStart from './ProcessFormForStart';
import SelectUserGroup from './SelectUserGroup';

//这是form3的回调函数
let getForm3DataFunction;

export default (props) => {

  const [list, setList] = useState();
  const renderListButton = (text, record, idx) => {
    return (
      <Space>
        <a onClick={() => onClick(record, 'start')}>发起流程</a>
        {props.isHome ? <a onClick={() => {
          Dialog.show({
            title: '流程清单详情',
            footerAlign: 'right',
            locale: 'zh',
            enableValidate: true,
            width: 1000,
            content: <DefList />
            //content: <ListForHome />
          })
        }}>more</a> : <div />}

      </Space>
    );
  };

  const onClick = async (record, type) => {
    if (type === 'start') {
      // setTitle(record.processName);
      //
      const userVL = await ajax.get(sysUserPath.getUserVL);
      const groupTree = await ajax.get(
        processFormTemplatePath.getFormTemplateGroupTree,
        { processDefinitionId: record.id },
      );
      if (userVL && groupTree) {

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
              record={record}
              userVL={userVL}
              groupTree={groupTree}
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
            //字段组
            const data = await ajax.get(
              processFormTemplatePath.getSelectGroupIdList,
              {
                processDefinitionId: record.id,
                checkGroupIdArr: values.checkGroupIdArr,
              },
            );
            if (data) {
              selectGroupIdArr = data;
            }
            hide();
            //预加载数据,可以解决屏闪问题
            const formTree = await ajax.get(
              processFormTemplatePath.getFormTemplateTree,
              { processDefinitionId: record.id },
            );
            const tableTypeVO = await ajax.get(//todo改名
              processFormTemplatePath.getTableTypeVO,
              { processDefinitionId: record.id },
            );
            const startProcessConditionVO = await ajax.get(
              processInstanceDataPath.getStartProcessConditionVO,
              { processDefinitionId: record.id },
            );
            //20211206  获取template Label/id的映射；接收前端成为一个对象：属性名是label值，值为ID;是为了辅助“自动填充”功能准备的
            const templateIdLableMap = await ajax.get(processFormTemplatePath.getFormTemplateIdLableMap, {
              processDefinitionId: record.id,
            });
            Dialog.show({
              title: record.processName,
              footerAlign: 'right',
              locale: 'zh',
              enableValidate: true,
              width: '75%',
              content: (
                <Tabs animated={false}>
                  <TabPane tab="表单" key="1">

                    <ProcessFormForStart
                      //20211205仅需要SelectUserGroup返回的values里的committerType(是否是代人申请)/committerName（代人申请时有值，格式是那种“拼接长串”）
                      userInfo={values}
                      templateIdLableMap={templateIdLableMap}
                      record={record}
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
              footer: (hide, { _, ctx: core }) => {//20211206todo总结  { _, ctx: core }这样就可以获取"包装的"组件的core!?张强：core只是ctx的别名
                let onClick = async (buttonName) => {//dialog特色：hide需要显示调用才会消失：而不是“内置”到某一类确定按钮的事件中
                  let errorArr = await core.validate();
                  if (errorArr) {
                    Object.keys(errorArr).forEach((key) => {
                      /*
                         key=16.计算机信息表.as_device_common.no.1 或
                         key=operatorTypeLabel
                       */
                      if (key.split('.').length === 5 || key === 'operatorTypeLabel') {
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
                    const msg = formItemValidate(templateIdLableMap, values)
                    if (msg) {
                      Modal.error({
                        title: '提示',
                        content: <div> {msg}</div>,
                      });
                      return
                    }
                    console.log('20220618 提交前的values')
                    console.log(values)
                    let startVO = {
                      buttonName: buttonName,        
                      value: null,
                      value1:{processDefinitionId:record.id},//20220531,todo问，感觉不能动态在后面添加成员
                      value2List: [],
                    };                   
                    if (values.diskListForHisForProcess) {//20220619加
                      startVO.diskListForHisForProcess= values.diskListForHisForProcess;
                     delete values.diskListForHisForProcess; 
                    }
                    console.log(values)
                    if (values.asset) {
                      startVO.value2List = values.asset;
                      delete values.asset;
                    }
                    if (committerType) {
                      startVO.value1.committerType = committerType;
                    }
                    if (committerIdStr) {
                      startVO.value1.committerIdStr = committerIdStr;
                    }
                    if (committerName) {//20211203 本人提交时不走这里
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
                    startVO.value1.value = JSON.stringify(values);//20220415 表单里的值组成的是一个json对象？还是普通JS对象?后者，并且js中json对象也是js对象的一种;
                    //20211125需要再添加对资产状态与流程实例的互斥关系的判断，来阻止用户发流程todo
                    const data = await ajax.post(//”用户未登陆/后台报异常“等异常情况已被ajax.js函数预处理/拦截，不返回&阻塞
                      processInstanceDataPath.start,
                      startVO,
                    );
                    if (data) {//20211220加超时判断：超时会返回空
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
                    btnArr.push(//20211222断点
                      <LoadingButton
                        onClick={onClick}
                        param={buttonName}
                        type={'primary'}
                      >
                        {buttonName}
                      </LoadingButton>,
                    );
                  });
                } else {//20211222断点
                  btnArr.push(<LoadingButton onClick={
                    onClick
                  } param={null} type={'primary'}>提交</LoadingButton>)
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

  return (
    <div>
      <List
        url={processDefinitionPath.list}
        onMount={(list) => setList(list)}
        formatBefore={listFormatBefore}
        formatAfter={listFormatAfter}
        pageSize={props.pageSize}
      >
        {/* <QueryCondition path={processDefinitionPath} list={list}/> */}
        {/* <OperateButton path={processDefinitionPath}/> */}
        <Table
          rowKey="id"
          //  rowSelection={{
          //    selectedRowKeys,
          //    onChange: (selectedRowKeys, selectedRows) => setSelectedRowKeys(selectedRowKeys)
          //  }}
          size={props.isHome ? "small" : ""}
        >
          <Table.Column title="流程名称" dataIndex="processName" />
          <Table.Column title="资产分类" dataIndex="processType2" />
          <Table.Column title="事件分类" dataIndex="processType" />
          <Table.Column title="描述" dataIndex="description" />
          <Table.Column title="操作" render={renderListButton} />
        </Table>
        <Pagination showTotal={(total) => `共${total}条`} />
      </List>
    </div>
  );
};
