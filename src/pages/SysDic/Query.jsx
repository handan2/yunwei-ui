import { Filter } from 'nolist/lib/wrapper/antd'
import { Input } from 'nowrapper/lib/antd'
import { Button } from 'antd'
//查询表单方式一：利用nolist的filter
export default (props) => {
  return <Filter noDefaultLayout style={{ marginBottom: -10 }}>
    <Filter.Item label="大类名称:" name="flag"><Input/></Filter.Item>
    <Filter.Item label="小类名称:" name="name"><Input/></Filter.Item>
    <Filter.Search><Button icon="search" type='primary' style={{ marginRight: 10 }}>查询</Button></Filter.Search>
    <Filter.Clear><Button icon="reload">重置</Button></Filter.Clear>
  </Filter>
}
