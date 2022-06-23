import React, { useState } from 'react';
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd';
import { Dialog } from 'nowrapper/lib/antd';
import { listFormatBefore, listFormatAfter,processInstanceDataCompletePath } from '../../utils';
import { QueryCondition, Space } from '../../components';
import { onClickForComplete } from '../ProcessInstanceData/onClick';
import { Button, Modal, message, Icon } from 'antd';
import ScoreForm from '../Score/Form';
export default () => {
  const [list, setList] = useState();
  const [record, setRecord] = useState({});
  const [modalVisible, setModalVisible] = useState(false); //评分modal
  const [modalVisible1, setModalVisible1] = useState(false); //报表modal
  const showModal = (record) => {
  
    if (!record.score) {
      setModalVisible(true);
      setRecord(record);
    } else {
      Modal.warning({
        title: '提示',
        content: (
          <div>
            <p style={{ fontSize: 15 }}>
              您已评过分！
              <Icon type="smile" theme="twoTone" />
            </p>{' '}
            {/* 不知为何图标不显示 */}
          </div>
        ),
        okText: '确定',
        closable: true,
      });
    }

    // Modal.warning({
    //   title: '提示',
    //   content: <div>
    //       <p style={{ fontSize: 15 }}>您已评过分！^_^</p>
    //       {/* 不知为何图标不显示 */}
    //       <Icon type="smile" theme="twoTone" />
    //     </div>,
    //   okText: '确定',
    //   closable: true,
    // });
    // Dialog.show({
    //   title: '工单评分----'+record.processName+'(提交人:'+record.displayName+')',
    //   footerAlign: 'right',
    //   locale: 'zh',
    //   width: 600,
    //   content: <ScoreForm  record={record} flag={flag} setFlag={setFlag}  mergedArray={mergedArray} setMergedArray={setMergedArray} />,
    //    onOk: (values,hide)=>{console.log(values); hide()}
    // });
  };
  const onClickForPrint = () => {
    setModalVisible1(true);
  };
  const renderListButton = (text, record, idx) => {
    return (
      <Space>
        <a onClick={() => onClickForComplete(record)}>查看</a>
        {/* （）里传的参数是onClick事件自动塞进去的，所以record参数不能放在那个()中 */}

        {record.score ? (
          <a onClick={() => showModal(record)}>已评</a>
        ) : (
          <a onClick={() => showModal(record)}>评分</a>
        )}
        {/* <a onClick={() => onClickForPrint()}>打印</a> */}
      </Space>
    );
  };

  return (
    <div>
      <List
        url={processInstanceDataCompletePath.list}
        onMount={(list) => list && setList(list)}
        formatBefore={listFormatBefore}
        formatAfter={listFormatAfter}
        pageSize={3}
      >
        {/* <QueryCondition path={processInstanceDataCompletePath} list={list}/> */}

        <Table size="small">
          <Table.Column
            title="流程名称"
            ellipsis={true}
            dataIndex="processName"
          />
          <Table.Column title="提交人" width="60px" dataIndex="displayName" />
          {/* <Table.Column title="提交部门" dataIndex="deptName"/> */}
          {/* <Table.Column title="当前步骤" ellipsis={true}  dataIndex="displayCurrentStep"/> */}
          <Table.Column
            title="提交时间"
            ellipsis={true}
            dataIndex="startDatetime"
          />
          <Table.Column title="操作" width="145px" render={renderListButton} />
        </Table>
        <Pagination showTotal={(total) => `共${total}条`} />
      </List>
      <Modal
        title={
          '流程评分----' +
          record.processName +
          '(编号:' +
          record.id +
          ')'
        }
        visible={modalVisible}
        // onOk={this.handleOk}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <ScoreForm
          list={list}
          record={record}
          setModalVisible={setModalVisible}
        />
      </Modal>
      <Modal
        title="审批单打印"
        visible={modalVisible1}
        onCancel={() => setModalVisible1(false)}
        onOk={() => setModalVisible1(false)}
        footer={null}
        width={750}
      >
        <iframe
          src="http://10.84.10.17:8888/webroot/decision/view/report?viewlet=test/lifeCircle.cpt"
          width="700"
          height="400px"
          frameborder="no"
          border="0"
          style={{ marginTop: -22 }}
        ></iframe>
      </Modal>
    </div>
  );
};
