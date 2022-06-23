import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { listFormatBefore,listFormatAfter, processInstanceDataCompletePath } from '../../utils'
import { QueryCondition, Space } from '../../components'
import { onClickForComplete } from '../ProcessInstanceData/onClick'

export default () => {
  const [list, setList] = useState()

  const renderListButton = (text, record, idx) => {
    return <Space>
      <a onClick={() => onClickForComplete(record)}>查看</a>
    </Space>
  }

  return <List url={processInstanceDataCompletePath.list}
               onMount={list => list && setList(list)} formatAfter={listFormatAfter} formatBefore={listFormatBefore}>
    <QueryCondition path={processInstanceDataCompletePath} list={list}/>
    <Table>
      <Table.Column title="流程名称" dataIndex="processName"/>
      <Table.Column title="提交人" dataIndex="displayName"/>
      <Table.Column title="提交部门" dataIndex="deptName"/>
      <Table.Column title="流程状态" dataIndex="processStatus"/>
      <Table.Column title="提交时间" dataIndex="startDatetime"/>
      <Table.Column title="完成时间" dataIndex="endDatetime"/>
      <Table.Column title="操作" render={renderListButton}/>
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}
