import React, { useState } from 'react';
import { Button, message, Modal } from 'antd';

import List, { Pagination, Table } from 'nolist/lib/wrapper/antd';
import { QueryCondition, Space } from '../../components';
import { onClickForMy,onClickForNextProcess } from '../ProcessInstanceData/onClick';
import { ajax, listFormatBefore, listFormatAfter, processInstanceDataPath, processInstanceDataMyPath } from '../../utils'
const { confirm } = Modal;
export default () => {

  const [list, setList] = useState();
  const onClickForDelete = async (record) => {
    //20211117添加了删除提示
    confirm({
      title: '提示',
      content: '确定要删除吗?',
      okText: '确定',
      okType: 'danger',
      okButtonProps: {
        disabled: false,
      },
      cancelText: '取消',
      onOk: async () => {

        const data = await ajax.post(processInstanceDataPath.delete, record)
        if (data) {
          list.refresh()
          message.success('删除成功')
        }
      }
    })
  }
  const renderListButton = (text, record, idx) => {
    let buttonName;
    if (record.processStatus.includes('退回')) {
      buttonName = '提交';
    } else if (record.processStatus.includes('处理')) {
      buttonName = '处理';
    } else if (record.processStatus.includes('新任务')) {
      buttonName = '处理';
    }
    else buttonName = '审批';
    return (
      <Space>
        <a onClick={() => {
          if (record.processStatus.includes('新任务'))
            onClickForNextProcess(record, list)
          else
            onClickForMy(record, list)


        }}>{buttonName}</a>
        {record.processStatus.includes('退回') ? <a onClick={() => onClickForDelete(record)}>删除</a> : <div />}
      </Space>
    );
  };
  const renderCurrentStep = (text, record, idx) => {
    if (record.processStatus.includes('退回'))
      return "退回";
    else return record.displayCurrentStep;
  };

  return (
    <List
      url={processInstanceDataMyPath.list}
      onMount={(list) => list && setList(list)}
      formatBefore={listFormatBefore}
      formatAfter={listFormatAfter}
      pageSize={5}
    >
      {/* <QueryCondition path={processInstanceDataMyPath} list={list}/> */}
      <Table size="small" bordered={false}>
        <Table.Column
          title="流程名称"
          ellipsis={true}

          dataIndex="processName"
        />
        <Table.Column title="提交人" dataIndex="displayName" />
        {/* <Table.Column title="提交部门" dataIndex="deptName"/> */}
        <Table.Column
          title="当前步骤"
          ellipsis={true}
          render={renderCurrentStep}
        />
        <Table.Column
          title="提交时间"
          ellipsis={true}
          dataIndex="startDatetime"
        />
        <Table.Column title="操作" width="145px" render={renderListButton} />
      </Table>
      <Pagination showTotal={(total) => `共${total}条`} />
    </List>
  );
};
