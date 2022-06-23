import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { Dialog } from 'nowrapper/lib/antd'
import { formRule, ajax, asDeviceCommonPath, listFormatBefore, listFormatAfter } from '../../utils'

import { OperateButton, QueryCondition } from '../../components'
import { Button, message, Modal } from 'antd'
import { Space } from '../../components'
export default () => {

  const [list, setList] = useState()
  const [assert_no, setAssert_no] = useState()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [modalVisible1, setModalVisible1] = useState(false); //报表modal
  const renderListButton = (text, record, idx) => {
    return (
      <Space>
        <a onClick={() => { setAssert_no(record.no); setModalVisible1(true) }}>履历查询</a>

      </Space>
    );
  };
  const preView = (text, record1, idx) => {
    return (
      <Space>
        <a onClick={async () => {
          let record = await ajax.get(asDeviceCommonPath.get, { id: record1.id })
          console.log(record)
          record = formRule.strHandle('parse', record)//20211123函数里有“strRule”的处理，但代码里已搜不到，todo问张强
          //-------------下面两个的顺序很重要---------
          //表单的formItemName
          record = formRule.formItemNameHandle('parse', record)
          //表单的日期对象
          record = formRule.dateHandle('parse', record)
          //  let  record = await ajax.get(asDeviceCommonPath.get, { id: record1.id})
          let dialog = {

            title: '浏览',
            footerAlign: 'label',
            locale: 'zh',
            enableValidate: true,
            width: 1000,
            content: <asDeviceCommonPath.Form type='preview' record={record} />,
            onOk: async (values, hide) => {
              //备注别删除：张强“序列化”非java vo的那种序列化，起名不太合理；下面解释可能不太准确，待进一步研
              //张强说只有设备查询表与自定义表的编辑与修改用到，其他修改表单里的日期格式不需要处理？
              //表单的字符串序列化：  自定义 JS对象转成DB字段
              // values = formRule.strHandle('stringify', values)
              //表单的日期字符串  :  NOFORM对日期有问题，把noform读出来的时间，转成DB能认的
              //  values = formRule.dateHandle('stringify', values)
              //表单的formItemName : 设备表解析，把"asDeviceCommon.id"这种字段解析出来，用在设备查询表中 。。。。
              //values = formRule.formItemNameHandle('stringify', values)
              // console.log('20220620 asDeviceCommon /list onOk')
              // let a = { a: 1, b: 2 }
              // console.log(a)


              // delete a.a
              // console.log(a)
            }
          }

          dialog.footer = () => {
          }

          Dialog.show(dialog)
          return


        }}>{record1.no}</a>

      </Space>
    );
  };
  return (
    <div>
      <List url={asDeviceCommonPath.list} onMount={list => setList(list)} formatBefore={listFormatBefore} formatAfter={listFormatAfter}>
        <QueryCondition path={asDeviceCommonPath} list={list} />
        <OperateButton path={asDeviceCommonPath} list={list}
          selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys}
          width={1000} footerAlign='right' />
        <Table rowKey='id'
          rowSelection={{
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedRowKeys(selectedRowKeys)
            }
          }}
        >
          <Table.Column title="资产编号" dataIndex="no" render={preView} />
          <Table.Column title="资产类别" dataIndex="temp" />
          <Table.Column title="资产名称" dataIndex="name" />
          <Table.Column title="责任部门" dataIndex="userDept" />
          <Table.Column title="责任人" dataIndex="userName" />
          <Table.Column title="联网类别" dataIndex="netType" />
          <Table.Column title="状态" dataIndex="state" />
          <Table.Column title="操作" width="145px" render={renderListButton} />
        </Table>
        <Pagination showTotal={total => `共${total}条`} />
      </List>
      <Modal
        title="资产履历"
        visible={modalVisible1}
        onCancel={() => setModalVisible1(false)}
        onOk={() => setModalVisible1(false)}
        footer={null}
        width='75%'
      >
        <iframe
          src={"http://10.84.10.17:8888/webroot/decision/view/report?viewlet=test/lifeCircle.cpt&assert_no=" + assert_no}
          width="100%"
          height="800px"
          frameborder="no"
          border="0"
          style={{ marginTop: -22 }}
        ></iframe>
      </Modal>
    </div>)
}
