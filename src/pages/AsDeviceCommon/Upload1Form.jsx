import { useState, useEffect } from 'react'
import { Upload, Button, Icon } from 'antd'
import Form, { FormCore, FormItem } from 'noform'
import { Input, Radio, TreeSelect } from 'nowrapper/lib/antd'
import _ from 'lodash'

export default (props) => {
  const [core] = useState(new FormCore())

  return <Form core={core}>
    <FormItem label="是否覆盖原资产信息" name="haveCover" value={'否'}>
      <Radio.Group
        options={[
          { label: '是', value: '是' },
          { label: '否', value: '否' }]}/>
    </FormItem>
    <div style={{marginTop:20}}>
    <Upload
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
    </div>
  </Form>
}
