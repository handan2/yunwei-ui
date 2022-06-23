import { Row, Col } from 'antd';
export default  (list) => {
    let arr = [];
    list.forEach((value, key) =>
      arr.push(
        <Row>
          <Col span={5} style={{ textAlign: 'center' }}>
            <span style={{ color: 'blue' }}>{value.id}</span>
          </Col>
          <Col span={8}>{value.processName}</Col>
          <Col Col span={11}>
            {value.displayCurrentStep}
          </Col>
        </Row>,
      ),
    );
    return arr;
  };