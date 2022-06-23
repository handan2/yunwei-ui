import { useState, useEffect } from 'react'
import { Upload, Button, Icon } from 'antd'
import Form, { FormCore, FormItem } from 'noform'
import { Input, TreeSelect } from 'nowrapper/lib/antd'
import _ from 'lodash'

export default (props) => {
  return <Upload
    beforeUpload={file => {
      props.beforeUpload(file)
      return false
    }}
    onRemove={file => props.onRemove(file)}
    multiple
  >
    <Button>
      <Icon type="upload"/>选择文件
    </Button>
  </Upload>
}
