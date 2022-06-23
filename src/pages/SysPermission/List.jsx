import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { dataListButtonRender, listFormatAfter,listFormatBefore, sysPermissionPath } from '../../utils'
import OperateButton from '../../components/OperateButton'
import { Space } from '../../components'

export default () => {
  const [list, setList] = useState()

  const renderListButton = (text, record, idx) => {
    return <Space>
      {dataListButtonRender(sysPermissionPath, list, record)}
    </Space>
  }

  return <List url={sysPermissionPath.list} onMount={list => setList(list)} formatAfter={listFormatAfter} formatBefore={listFormatBefore}>
    <OperateButton path={sysPermissionPath} list={list}/>
    <Table>
      <Table.Column title="名称" dataIndex="name"/>
      <Table.Column title="类型" dataIndex="type"/>
      <Table.Column title="前端路由" dataIndex="path"/>
      <Table.Column title="按钮位置" dataIndex="position"/>
      <Table.Column title="图标" dataIndex="icon"/>
      <Table.Column title="操作" render={renderListButton}/>
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}
