import { Filter } from 'nolist/lib/wrapper/antd'
import { Input, Select } from 'nowrapper/lib/antd'
import { Button } from 'antd'
import React, { useEffect, useState } from 'react'
import { ajax, sysDicPath } from '../../utils';
//查询表单方式一：利用nolist的filter
export default (props) => {
  const [processType, setProcessType] = useState()
  useEffect(async () => {
    const data = await ajax.get(sysDicPath.getDicVL, { flag: '流程分类' })
    data && setProcessType(data)
  }, [])

  return <Filter noDefaultLayout style={{ marginBottom: -10 }}>
    <Filter.Item label="流程名称:" name="processName"><Input/></Filter.Item>
    <Filter.Item label="流程分类:" name="processType">
      <Select options={processType} style={{ width: 150 }}/>
    </Filter.Item>
    <Filter.Search><Button icon="search" type='primary' style={{ marginRight: 10 }}>查询</Button></Filter.Search>
    <Filter.Clear><Button icon="reload">重置</Button></Filter.Clear>
  </Filter>
}
