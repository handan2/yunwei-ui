import { useState } from 'react'
import { Dialog } from 'nowrapper/lib/antd'
import { Button, message, Modal } from 'antd'
import { ajax, env, formRule, session } from '../utils'
import { Space } from '../components'
import _ from 'lodash'

export default (props) => {
  //文件上传
  const [fileList, setFileList] = useState([])
  const beforeUpload = file => {
    fileList.push(file)
    return false
  }
  const onRemove = file => {
    const index = fileList.indexOf(file)
    fileList.splice(index, 1)
  }

  const onClick = async (type) => {
    const { path, selectedRowKeys, setSelectedRowKeys, list, width = 416, footerAlign = 'label' } = props
    if (type === 'delete') {
      if (selectedRowKeys.length === 0) {
        message.error('至少选择一条数据')
        return
      }
      Dialog.show({
        title: '提示',
        footerAlign: 'right',
        locale: 'zh',
        width: 400,
        content: <p style={{ fontSize: 17 }}>确定要删除<b style={{ color: 'red' }}>{selectedRowKeys.length}</b>条数据吗?</p>,
        onOk: async (values, hide) => {
          console.log(selectedRowKeys)
          const data = await ajax.get(path.delete, { idArr: selectedRowKeys })
          if (data) {
            hide()
            setSelectedRowKeys([])
            list.refresh()
            message.success('删除成功')
          }
        }
      })
      return
    }
    if (type === 'add' || type === 'edit' || type === 'preview') {
      console.log('20220620 come into onclick:add')
      let title, record
      if (type === 'add') {
        title = '新增'
      } else if ('edit' === type || 'preview' === type) {
        if (selectedRowKeys.length !== 1) {
          message.error('选择一条数据')
          return
        }
        title = type === 'edit' ? '修改' : '浏览'
        record = await ajax.get(path.get, { id: selectedRowKeys[0] })
        if(!record)return 
        //表单的字符串反序列化
        record = formRule.strHandle('parse', record)//20220612这个函数仅用于流程表单对加载数据的处理，这里会“直接返回原值”
        //-------------下面两个的顺序很重要---------
        //表单的formItemName
        record = formRule.formItemNameHandle('parse', record)
        //表单的日期对象
        record = formRule.dateHandle('parse', record)
      }
      let dialog = {
        title: title,
        footerAlign: footerAlign,
        locale: 'zh',
        enableValidate: true,
        width: width,
        content: <path.Form type={type} record={record}  selectedRowKeys={selectedRowKeys}/>,
        onOk: async (values, hide) => {
          //表单的字符串序列化
          values = formRule.strHandle('stringify', values)//不处理，“原值返回”
          //表单的日期字符串
          values = formRule.dateHandle('stringify', values)
          //表单的formItemName
          values = formRule.formItemNameHandle('stringify', values)
         console.log('20220620 operateButton 表单提交序列化后')
         console.log(values)
        //  values.diskList = tmp?.map(item =>_.omitBy( item, _.isNull() ))
          
         // values.diskList 
          let data
          if (type === 'add') {
            data = await ajax.post(path.add, values)
          } else if (type === 'edit') {
            data = await ajax.post(path.edit, values)
          }
          if (data) {
            hide()
            setSelectedRowKeys && setSelectedRowKeys([])
            list.refresh()
            message.success(type === 'add' ? '保存成功' : '修改成功')
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
    if (type === 'roleGive') {
      if (selectedRowKeys.length !== 1) {
        message.error('选择一个用户')
        return
      }
      const roleGiveVO = await ajax.get(path.getRoleGiveVO, { userId: selectedRowKeys[0] })
      if (roleGiveVO) {
        Dialog.show({
          title: '角色分配',
          footerAlign: 'right',
          locale: 'zh',
          enableValidate: true,
          width: 500,
          content: <path.RoleGiveForm roleGiveVO={roleGiveVO}/>,
          onOk: async (values, hide) => {
            const data = await ajax.get(path.roleGive, { userId: selectedRowKeys[0], roleIdArr: values.roleIdArr })
            if (data) {
              hide()
              setSelectedRowKeys([])
              message.success('分配成功')
            }
          }
        })
      }
      return
    }
    if (type === 'permissionGive') {
      if (selectedRowKeys.length !== 1) {
        message.error('选择一个角色')
        return
      }
      const permissionGiveVO = await ajax.get(path.getPermissionGiveVO, { roleId: selectedRowKeys[0] })
      if (permissionGiveVO) {
        Dialog.show({
          title: '权限分配',
          footerAlign: 'right',
          locale: 'zh',
          enableValidate: true,
          width: 500,
          content: <path.PermissionGiveForm permissionGiveVO={permissionGiveVO}/>,
          onOk: async (values, hide) => {
            const data = await ajax.get(path.permissionGive, {
              roleId: selectedRowKeys[0],
              permissionIdArr: values.permissionIdArr
            })
            if (data) {
              hide()
              setSelectedRowKeys([])
              message.success('分配成功')
            }
          }
        })
      }
      return
    }
    if (type === 'download1') {
      window.location.href = path.download1
      return
    }
    if (type === 'upload1') {
      setFileList([])
      Dialog.show({
        title: '导入',
        footerAlign: 'right',
        locale: 'zh',
        width: 400,
        enableValidate: true,
        content: <props.path.Upload1Form beforeUpload={beforeUpload} onRemove={onRemove}/>,
        onOk: async (values, hide) => {
          if (fileList.length === 0) {
            message.error('请选择一个Excel文件')
            return
          }
          if (fileList.length > 1) {
            message.error('仅支持一个Excel文件')
            return
          }
          //附件数据
          let fileCount = 0
          const formData = new FormData()
          fileList.forEach((file) => {
            if (_.endsWith(file.name, '.xls') || _.endsWith(file.name, '.xlsx')) {
              formData.append('files', file)
              fileCount += 1
            }
          })
          if (fileCount !== 1) {
            message.error('请选择一个Excel文件')
            return
          }
          //表单数据
          formData.append('formValue', JSON.stringify(values))
          //打印formData
          /* for (let value of formData.values()) {
             console.log(value);
           }*/
          //
          const data = await ajax.post(props.path.upload1, formData)
          if (data) {
            list.refresh()
            hide()
            Modal.success({
              title: '提示',
              content: <div>{data.map(item => <div>{item}</div>)}</div>,
              okText: '知道了',
              width: 500
            })
          }
        }
      })
      return
    }
  }
  const renderButton = () => {
    if (env === 'dev') {
      return <Space>
        <Button icon='plus' type='primary' onClick={() => onClick('add')}>新增</Button>
        <Button icon='edit' type='primary' onClick={() => onClick('edit')}>修改</Button>
        <Button icon='scan' type='primary' onClick={() => onClick('preview')}>浏览</Button>
        <Button icon='delete' type='primary' onClick={() => onClick('delete')}>批量删除</Button>
        <Button icon='plus' type='primary' onClick={() => onClick('roleGive')}>角色分配</Button>
        <Button icon='plus' type='primary' onClick={() => onClick('permissionGive')}>权限分配</Button>
        <Button icon="export" type="primary" onClick={() => onClick('download1')}>下载设备模板</Button>
        <Button icon='file-excel' type='primary' onClick={() => onClick('upload1')}>导入设备</Button>
        <Button icon="export" type="primary" onClick={() => onClick('download1')}>下载用户模板</Button>
        <Button icon='file-excel' type='primary' onClick={() => onClick('upload1')}>导入用户</Button>
      </Space>
    }
    const buttonArr = session.getItem('operateButtonMap')[props.path.flag]
    if (buttonArr) {
      return buttonArr.map(item => {
        return <Button icon={item.icon || 'plus'} type='primary' style={{ marginRight: 10 }}
                       onClick={() => onClick(item.permissionType)}>{item.name}</Button>
      })
    }
  }

  return <div style={{ marginBottom: 12 }}>
    {renderButton()}
  </div>
}
