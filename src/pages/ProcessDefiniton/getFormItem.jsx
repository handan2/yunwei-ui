import { Checkbox, DatePicker, Input, InputNumber, Radio, Select, AutoComplete } from 'nowrapper/lib/antd'
import { FormItem } from 'noform'
import { width } from '../../utils'
import locale from 'antd/lib/date-picker/locale/zh_CN'
//进到这个方法里的只有变更与空转字段；这些字段的name属性只是一个ID数字
export default function(item, core) {
  let tmp = {}
  if (item.defaultValue) {//把所有的formIte的默认值都赋了
    core.setValue(item.id + '', item.defaultValue)//item.id + ''仅是为了转成string
  }
  if (item.tooltip) {
   // tmp.help = item.tooltip//:改在框内提示,但placeholder属性只能放在input组件中&tmp是给FormItem设的属性，所以只能逐一在每个imput里手工写了
  }
  if (item.flag === '字段变更类型') {
    tmp.label = item.label.split('.')[1]
  } else {
    tmp.label = item.label
  }
  switch (item.type) {
    case '文本框':
      if (item.required === '是') {
        tmp.required = true
        tmp.validateConfig = { type: 'string', required: true, message: tmp.label + '不能为空' }
      } else {
        tmp.required = false
      }
      return <FormItem name={item.id} {...tmp} ><Input style={{ width: width }} placeholder={item.tooltip} /></FormItem>
    case '数字框':
      if (item.defaultValue) {
        core.setValue(item.id + '', parseInt(item.defaultValue))//int类型的默认值重新（以数字类型）再赋/覆盖一遍
      }
      if (item.required === '是') {
        tmp.required = true
        tmp.validateConfig = { type: 'number', required: true, message: tmp.label + '不能为空' }
      } else {
        tmp.required = false
      }
      return <FormItem name={item.id} {...tmp}><InputNumber placeholder={item.tooltip} style={{ width: width }}/></FormItem>
    case '单选按钮':
      if (item.required === '是') {
        tmp.required = true
        tmp.validateConfig = { type: 'string', required: true, message: tmp.label + '不能为空' }
      } else {
        tmp.required = false
      }
      return <FormItem name={item.id} {...tmp}>
        <Radio.Group options={item.value.split(',').map(val => ({ label: val, value: val }))}/>
      </FormItem>
    case '复选框':
      if (item.defaultValue) {
        core.setValue(item.id + '', item.defaultValue.split(','))
      }
      if (item.required === '是') {
        tmp.required = true
        tmp.validateConfig = { type: 'array', required: true, message: tmp.label + '不能为空' }
      } else {
        tmp.required = false
      }
      return <FormItem name={item.id} {...tmp}>
        <Checkbox.Group options={item.value.split(',').map(val => ({ label: val, value: val }))} className='newLine'/>
      </FormItem>
    case '下拉单选不可编辑':
      if (item.required === '是') {
        tmp.required = true
        tmp.validateConfig = { type: 'string', required: true, message: tmp.label + '不能为空' }
      } else {
        tmp.required = false
      }
      return <FormItem name={item.id} {...tmp}>
        <Select options={item.value.split(',').map(val => ({ label: val, value: val }))} placeholder={item.tooltip} style={{ width: width }}/>
      </FormItem>
    case '下拉单选可编辑':
      if (item.required === '是') {
        tmp.required = true
        tmp.validateConfig = { type: 'string', required: true, message: tmp.label + '不能为空' }
      } else {
        tmp.required = false
      }
      return <FormItem name={item.id} {...tmp}>
        <AutoComplete options={item.value.split(',').map(val => ({ label: val, value: val }))}
                     placeholder={item.tooltip} style={{ width: width }}/>
      </FormItem>
    case '日期':
      if (item.required === '是') {
        tmp.required = true
        tmp.validateConfig = {
          type: 'date',
          required: true,
          message: tmp.label + '不能为空',
          validator: (rule, value) => !!value
        }
      } else {
        tmp.required = false
      }
      return <>
        <div style={{ display: 'none' }}><FormItem name={item.id + 'Date'}><Input/></FormItem></div>
        <FormItem name={item.id + 'DateTmp'} {...tmp}
                  onChange={date => {
                    if (date) {
                      core.setValue(item.id + 'Date', date.format('YYYY-MM-DD'))
                    } else {
                      core.setValue(item.id + 'Date', '')
                    }
                  }}>
          <DatePicker locale={locale} format="YYYY-MM-DD"  placeholder={item.tooltip} style={{ width: width }}/>
        </FormItem>
      </>
    case '日期时间':
      if (item.required === '是') {
        tmp.required = true
        tmp.validateConfig = {
          type: 'date',
          required: true,
          message: tmp.label + '不能为空',
          validator: (rule, value) => !!value
        }
      } else {
        tmp.required = false
      }
      return <>
        <div style={{ display: 'none' }}><FormItem name={item.id + 'Datetime'}><Input/></FormItem></div>
        <FormItem name={item.id + 'DatetimeTmp'}  {...tmp}
                  onChange={date => {
                    if (date) {
                      core.setValue(item.id + 'Datetime', date.format('YYYY-MM-DD HH:mm:ss'))
                    } else {
                      core.setValue(item.id + 'Datetime', '')
                    }
                  }}>
          <DatePicker locale={locale} showTime format="YYYY-MM-DD HH:mm:ss" placeholder={item.tooltip}  style={{ width: width }}/>
        </FormItem>
      </>
  }
}
