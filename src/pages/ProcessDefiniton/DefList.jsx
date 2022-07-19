import React, { useState } from 'react';
import { Button, message, Modal, Steps, Row, Col, Tabs } from 'antd';
import { Dialog } from 'nowrapper/lib/antd';
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd';
import ProcessGraph from './ProcessGraph'
import { onClickForStart } from '../ProcessInstanceData/onClick';
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
} from '../../utils';
import { QueryCondition, Space, LoadingButton } from '../../components';

//这是form3的回调函数
let getForm3DataFunction;

export default (props) => {

  const [list, setList] = useState();
  const renderListButton = (text, record, idx) => {
    return (
      <Space>
        <a onClick={() => onClickForStart(record, 'start')}>发起流程</a>
        {props.isHome ? <a onClick={() => {
          Dialog.show({
            title: '流程清单详情',
            footerAlign: 'right',
            locale: 'zh',
            enableValidate: true,
            width: 1000,
            content: <DefList isDialog = {true}/>
            //content: <ListForHome />
          })
        }}>more</a> : <div />}

      </Space>
    );
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
          <Table.Column title="流程分类" dataIndex="processType" />
          {props.isDialog && <Table.Column title="流程分类2" dataIndex="processType2" />}
          <Table.Column title="描述" dataIndex="description" />
          <Table.Column title="操作" render={renderListButton} />
        </Table>
        <Pagination showTotal={(total) => `共${total}条`} />
      </List>
    </div>
  );
};
