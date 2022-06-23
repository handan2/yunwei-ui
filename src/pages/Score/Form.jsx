import React, { useEffect, useRef, useState } from 'react';
import { ajax, scorePath } from '../../utils';
import _ from 'lodash';
import {
  CrownOutlined,
  SettingOutlined,
  UserOutlined,
  Icon,
  SmileTwoTone,
  DoubleLeftOutlined,
} from '@ant-design/icons';

import { Rate, Button, Col, message, Row, Modal, Tabs, Card } from 'antd';
import Form, { FormCore, FormItem } from 'noform';
import { Input, TreeSelect } from 'nowrapper/lib/antd';
const { TextArea } = Input;
import { Content } from 'antd/lib/layout/layout';

const core = new FormCore();

export default (props) => {
  const { record } = props;

  let initMap = new Map();
  let initMap1 = new Map();
  let resData = {};
  let initData = {
    scoreNodeMap: initMap,
    scoreOperatorMap: initMap1,
    resData: resData,
  };
  //  console.log(record.id);
  // const [scoreNodeMap, setScoreNodeMap] = useState(initMap);
  // const [scoreOperatorMap, setScoreOperatorMap] = useState(initMap1);
  const [data, setData] = useState(initData);
  const init = async () => {
    const res = await ajax.get(scorePath.scoreObjectList, { id: record.id });
    console.log(res);
    if (res) {
      //这里的res已被ajax处理，res即返加的业务数据，而不是如上版放在Res.data
      let initMap = new Map();
      let initMap1 = new Map();

      let initData = {
        scoreNodeMap: initMap,
        scoreOperatorMap: initMap1,
        resData: res,
      };

      //   let map = new Map();
      //   let scoreOperatorMap1 = new Map();

      res.operatorNameList.map((key) => {
        initMap1.set(key, 5);
      });

      console.log(initData.resData.nodeNameList);
      res.nodeNameList.map((key) => {
        initMap.set(key, 5);
      });
      initMap.set('scoreTotal', 5);
      setData(initData); //20211029放在前面，会引发下面语句不执行，就重新渲染了：我记得SetState会统一最后渲染啊，这里怎么方法体执行一半就刷新了？？？

    }
  };
  useEffect(init, []);

  const showNodeScore = (item) => {
    return (score_chanage) => {
      let data1 = _.cloneDeep(data);
      data1.scoreNodeMap.set(item, score_chanage);
      return setData(data1);
    };
  };

  const showOperatorScore = (item) => {
    return (score_chanage) => {
      let data1 = _.cloneDeep(data);
      data1.scoreOperatorMap.set(item, score_chanage);
      return setData(data1);
    };
  };
  const onCancel = () => {
    props.setModalVisible(false);
  };
  const onFinish = async () => {
    let values = core.getValues();
    let mergedArray = [];
    let commentObj = {};
    if (values.comment) {
      commentObj.businessId = record.id;
      commentObj.comment = values.comment;
      commentObj.nodeType = 0;
      mergedArray.unshift(commentObj);
    }

    for (var [key, value] of data.scoreNodeMap.entries()) {
      let tmp = {};
      tmp.businessId = record.id;
      tmp.score = value;
      if (key === 'scoreTotal') {
        tmp.nodeType = 3;
        mergedArray.unshift(tmp);
        continue;
      } else {
        tmp.nodeType = 1;
        tmp.nodeName = key;
        mergedArray.unshift(tmp);
      }
    }
    for (var [key, value] of data.scoreOperatorMap.entries()) {
      let tmp = {};
      tmp.businessId = record.id;
      tmp.score = value;

      tmp.nodeType = 2;
      tmp.displayName = key;
      mergedArray.unshift(tmp);
    }
    // let aaa= {}
    // aaa.bbb = mergedArray
    //const res = await ajax.get(scorePath.save, {aaa:mergedArray});
    // console.log('aaa',aaa);
    const res = await ajax.post(scorePath.save, mergedArray);
    if (res) { 
      message.success('提交成功')
      props.list.refresh();
    }
    props.setModalVisible(false);
    return true;
  };
  return (
    <Form core={core}>
      {/* {data?.resData.nodeNameList?.map((item, key) => <Col span={6}>{item}</Col>)} */}
      <Card title="审批节点评分" bordered={false} style={{ width: '100%' }}>
        {data?.resData.nodeNameList?.map((item, key) => {
          return (
            <Row>
              <Col span={6}>{item}</Col>
              <Col span={12}>
                <Rate
                  allowHalf
                  defaultValue={data.scoreNodeMap.get(item)}
                  // defaultValue={5}
                  onChange={showNodeScore(item)}
                />
              </Col>
              <Col span={3}>得分</Col>
              <Col span={2}>{data.scoreNodeMap.get(item)}</Col>
            </Row>
          );
        })}
      </Card>
      <Card title="处理节点评分" bordered={false} style={{ width: '100%' }}>
        {data?.resData.operatorNameList?.map((item, key) => (
          <Row>
            <Col span={6}>{item}</Col>
            <Col span={12}>
              <Rate
                allowHalf
                defaultValue={data.scoreOperatorMap.get(item)}
                onChange={showOperatorScore(item)}
              />
            </Col>
            <Col span={3}>得分</Col>
            <Col span={2}>{data.scoreOperatorMap.get(item)}</Col>
          </Row>
        ))}
      </Card>
      <Card title="总体评分" bordered={false} style={{ width: '100%' }}>
        <Row>
          <Col span={6}>总体评分</Col>
          <Col span={12}>
            {/* 对于有defaultValue这种组件，一定要判断state是否有值，因为它的值不可更改 */}
            {data?.scoreNodeMap?.get('scoreTotal') != undefined ? (
              <Rate
                allowHalf
                defaultValue={data.scoreNodeMap.get('scoreTotal')}
                onChange={showNodeScore('scoreTotal')}
              />
            ) : (
              <div />
            )}
          </Col>
          <Col span={3}>得分</Col>
          <Col span={2}>{data.scoreNodeMap.get('scoreTotal')} </Col>
        </Row>
      </Card>
      <Card title="意见与建议" bordered={false} style={{ width: '95%' }}>
        <FormItem name="comment">
          <TextArea
            style={{ width: '400px' }}
            rows={3}
            placeholder="若有意见与建议，请在此处填写"
          />
        </FormItem>
        <Row />
        <Row style={{ marginTop: 20 }}>
          <Col span={10} />
          <Col span={4}>
            {' '}
            <Button type="primary" onClick={onFinish}>
              提交
            </Button>
          </Col>

          <Col span={4}>
            {' '}
            <Button type="primary" onClick={onCancel}>
              取消
            </Button>
          </Col>
        </Row>
      </Card>
    </Form>
  );
};
