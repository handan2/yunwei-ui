//用于将list的请求参数解析出来，默认是字符串
import { Dialog } from 'nowrapper/lib/antd'
import { ajax } from './ajax'
import { Button, message,Modal } from 'antd'
import { env } from './constant'
import { session } from './index'
import { Space } from '../components'
import { history } from '../.umi/core/history';


export function listFormatBefore(queryParams) {
  let params = {}
  Object.keys(queryParams.json).forEach(key => {
    if (key !== 'sort') {
      params[key] = queryParams.json[key]
    }
  })

  return params
}
//20211125新增
export function listFormatAfter(data) {
  if (data === '用户未登录') {
    Modal.error({ content: '登录过期', okText: '重新登录', onOk: () => history.push('/login') })
  }
}


//用于数据列表的按钮
const onClick = async (type, path, list, record, width = 416, footerAlign = 'label') => {
  if (type === 'delete') {
    Dialog.show({
      title: '提示',
      footerAlign: 'right',
      locale: 'zh',
      width: 400,
      content: <p style={{ fontSize: 17 }}>确定要删除该条数据吗?</p>,
      onOk: async (values, hide) => {
        const data = await ajax.get(path.delete, { idArr: [record.id] })
        if (data) {
          hide()
          list.refresh()
          message.success('删除成功')
        }
      }
    })
    return
  }
  if ('edit' === type || 'preview' === type) {
    let dialog = {
      title: type === 'edit' ? '修改' : '浏览',
      footerAlign: footerAlign,
      locale: 'zh',
      enableValidate: true,
      width: width,
      content: <path.Form type={type} record={record}/>,
      onOk: async (values, hide) => {
        if (type === 'edit') {
          const data = await ajax.post(path.edit, values)
          if (data) {
            hide()
            list.refresh()
            message.success('修改成功')
          }
        }
      }
    }
    if (type === 'preview') {
      dialog.footer = () => {
      }
    }
    Dialog.show(dialog)
    return
  }
}

export function dataListButtonRender(path, list, record, width = 416, footerAlign = 'label') {
  if (env === 'dev') {
    return <Space>
      <Button icon='edit' type='primary' onClick={() => onClick('edit')}>修改</Button>
      <Button icon='scan' type='primary' onClick={() => onClick('preview')}>浏览</Button>
      <Button icon='delete' type='primary' onClick={() => onClick('delete')}>删除</Button>
    </Space>
  }
  const buttonArr = session.getItem('dataListButtonMap')[path.flag]
  if (buttonArr) {
    return buttonArr.map(item => {
      return <a onClick={() => onClick(item.permissionType, path, list, record, width, footerAlign)}>{item.name}</a>
    })
  }
}
