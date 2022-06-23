import { useEffect, useState } from 'react'
import Form, { FormCore, FormItem, If } from 'noform'
import { Checkbox, Input, Radio } from 'nowrapper/lib/antd'
import { ajax, asConfigTablePath, formRule } from '../../utils'
import { Col, Row } from 'antd'

let validate = {
  name: { type: 'string', required: true, message: '表名称不能为空' },
  as_device_common: { type: 'array', required: true, message: '通用属性必须选择' }
}
const core = new FormCore({ validateConfig: validate })

export default (props) => {
  const { type, record } = props

  if (type === 'add') {
    core.reset()
    //为了解决关闭tab，再次打开时的否没有默认选中
    core.setValues({
      'as_device_common_flag': '是',
      'as_computer_special_flag': '否',
      'as_computer_granted_flag': '否',
      'as_network_device_special_flag': '否',
      'as_security_products_special_flag': '否',
      'as_io_special_flag': '否'
    })
  } else {
    core.setValues(record)
  }

  const [tableTypeVO, setTableTypeVO] = useState()

  useEffect(async () => {
    const data = await ajax.get(asConfigTablePath.asConfigTableTypeVO)
    data && setTableTypeVO(data)
  }, [])

  return <Form core={core} layout={{ label: 6, control: 18 }}>
    <FormItem name="id" style={{ display: 'none' }}><Input/></FormItem>
    <FormItem name="strRule" style={{ display: 'none' }}
              value={{ columnName: 'props', exclude: ['id', 'name'] }}>
      <Input/>
    </FormItem>
    <FormItem label='表名称' name="name" required><Input/></FormItem>
    {
      tableTypeVO && Object.keys(tableTypeVO).map(key => {
        const [name, label] = key.split(',')
        return <div>
          <FormItem label={label} name={name + '_flag'}
                    value={name === 'as_device_common' ? '是' : '否'}
                    onChange={e => {
                      if (e.target.value === '否') {
                        core.setValue(e.target.name.replace('_flag', ''), null)
                      } else {
                        validate[name] = { type: 'array', required: true, message: label + '必须选择' }
                      }
                    }}>
            <Radio.Group
              options={[
                { label: '是', value: '是' },
                { label: '否', value: '否' }]}/>
          </FormItem>
          <If when={(values) => values[name + '_flag'] === '是'}>
            <FormItem label={label + '属性'} name={name} required style={{ marginTop: 0 }}>
              <Checkbox.Group>
                <Row>
                  {
                    tableTypeVO[key].map(item => {
                      return <Col span={8}>
                        <Checkbox value={item.value}>{item.label}</Checkbox>
                      </Col>
                    })
                  }
                </Row>
              </Checkbox.Group>
            </FormItem>
          </If>
        </div>
      })
    }
  </Form>
}
