import React, { useState } from 'react'
import List, { Pagination, Table } from 'nolist/lib/wrapper/antd'
import { listFormatBefore,listFormatAfter, processInstanceNodePath } from '../../utils'

export default (props) => {
  const { record: processInstanceData } = props
  const [list, setList] = useState()
  return <List url={processInstanceNodePath.list + '?processInstanceDataId=' + processInstanceData.id}
               onMount={list => setList(list)} formatAfter={listFormatAfter} formatBefore={listFormatBefore}>
    <Table>
      <Table.Column title="任务名称" dataIndex="taskName"/>
      <Table.Column title="所在部门" dataIndex="deptName"/>
      <Table.Column title="处理人" dataIndex="displayName"/>
      <Table.Column title="处理状态" dataIndex="buttonName"/>
      <Table.Column title="处理意见" dataIndex="comment"/>
      <Table.Column title="到达时间" dataIndex="startDatetime"/>
      <Table.Column title="完成时间" dataIndex="endDatetime"/>
    </Table>
    <Pagination showTotal={total => `共${total}条`}/>
  </List>
}
