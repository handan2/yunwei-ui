import React, { useEffect, useState } from 'react'
import { Col, Row } from 'antd'
import Form, { FormCore, FormItem } from 'noform'
import { Input } from 'nowrapper/lib/antd'
import { formRule, width } from '../../utils'
import getFormItem from './getFormItem'
import _ from 'lodash'

//用于流程实例的修改表单
export default (props) => {
  const [core] = useState(new FormCore())
  useEffect(() => {
    core.reset()
    //表单的日期处理
    let values = formRule.dateHandle('parse', JSON.parse(props.processFormValue1.value))

    core.setValues(values)
  }, [])

  /*
    formTree:表单树
    level:字段组递归的层次，方便缩进
    colNum:一行几列
   */
  const renderFormItem = (formTree, level, colNum) => {
    let resultArr = [], tmpArr = []
    formTree.forEach(item => {
      if (item.flag === '字段组类型') {
        if (props.selectGroupIdArr && _.indexOf(props.selectGroupIdArr, item.id) >= 0) {
          resultArr.push(
            <Row style={{
              border: '1px solid #f0f0f0',
              background: '#f0f0f0',
              marginTop: -10,
              marginLeft: (level - 1) * 100,
              marginRight: (level - 1) * 100
            }}>
              <Col span={24 / colNum}>
                <FormItem label={item.label} colon={false} style={{ fontWeight: 'bolder' }}/>
              </Col>
            </Row>
          )
          resultArr.push(
            <Row style={{
              border: '1px solid #f0f0f0',
              paddingTop: 20,
              paddingBottom: 10,
              marginBottom: 20,
              marginLeft: (level - 1) * 100,
              marginRight: (level - 1) * 100
            }} gutter={[8, 16]}>
              {renderFormItem(item.children, level + 1, item.groupLayout)}
            </Row>
          )
        }
      } else if (item.flag === '表类型') {
        resultArr.push(
          <Row style={{
            border: '1px solid #f0f0f0',
            background: '#f0f0f0',
            marginTop: 10,
            marginLeft: (level - 1) * 100,
            marginRight: (level - 1) * 100
          }}>
            <Col span={24 / colNum}><FormItem label={item.label} colon={false} style={{ fontWeight: 'bolder' }}/></Col>
          </Row>
        )
        resultArr.push(
          <Row style={{
            border: '1px solid #f0f0f0',
            paddingTop: 20,
            marginBottom: 20,
            marginLeft: (level - 1) * 100,
            marginRight: (level - 1) * 100
          }} gutter={[8, 16]}>
            {
              props.tableTypeVO && props.tableTypeVO[item.type.split('.')[0]].map((itemm, index, arr) => {
                return <Col span={24 / colNum}>
                  <FormItem label={itemm.label.split('.')[1]} name={itemm.name}>
                    <Input disabled style={{ width: width }}/></FormItem>
                </Col>
              })
            }
          </Row>
        )
      } else {
        tmpArr.push(<Col span={24 / colNum}>{getFormItem(item, core)}</Col>)
        if (tmpArr.length === colNum) {
          resultArr.push(<Row gutter={[8, 16]}>{tmpArr}</Row>)
          tmpArr = []
        }
      }
    })
    if (tmpArr.length > 0) {
      resultArr.push(<Row>{tmpArr}</Row>)
    }
    return resultArr
  }

  return <Form core={core} layout={{ label: 8, control: 16 }}>
    <FormItem name="asset" style={{ display: 'none' }}><Input/></FormItem>
    {renderFormItem(props.formTree, 1, props.processDefinition.formLayout)}
  </Form>
}
