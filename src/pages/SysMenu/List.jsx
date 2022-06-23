import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { listFormatBefore,listFormatAfter, sysMenuPath } from '../../utils'
import OperateButton from '../../components/OperateButton'

export default () => {
  const [list, setList] = useState()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  return <List url={sysMenuPath.list} onMount={list => setList(list)} formatAfter={listFormatAfter} formatBefore={listFormatBefore}>
    <OperateButton path={sysMenuPath} list={list}
                   selectedRowKeys={selectedRowKeys} setSelectedRowKeys={setSelectedRowKeys}/>
    <Table rowKey='id'
           rowSelection={{
             selectedRowKeys,
             onChange: (selectedRowKeys, selectedRows) => setSelectedRowKeys(selectedRowKeys)
           }}
    >
      <Table.Column title="菜单名称" dataIndex="name"/>
      <Table.Column title="图标" dataIndex="icon"/>
      <Table.Column title="菜单类型" dataIndex="type"/>
      <Table.Column title="前端路由" dataIndex="path"/>
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}
