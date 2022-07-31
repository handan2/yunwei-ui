export const formItemAutoComplete = (
  assetArr, //20220731 由选择完资产后，当前的资产数组（<customTableID,assetNo>）:目前这个参数仅用于(通过非空)判断是由选择资产发起，还是由endAndStartForm发起
  changeColumnLabelIdMap,
  core,
  chooseUser,
  assetTypeIdForAff,
  labelIdMapForItem,
  connectTypeForAff,
  processName,
) => {
  //console.log('formValidate',props)
  //const {changeColumnLabelIdMap,core} = props
  // const chooseUser = props.userInfo
  if (chooseUser) {
    //只在startForm打开前:在options界面选择后有值
    const loginUser = JSON.parse(sessionStorage.getItem('user'));
    const idUserMiji = //20220730这些todo换成用那个map来查找
      changeColumnLabelIdMap['计算机详细信息表.责任人密级'] ||
      changeColumnLabelIdMap['计算机信息表.责任人密级'] ||
      changeColumnLabelIdMap['计算机申领表.责任人密级'] ||
      changeColumnLabelIdMap['外设声像及办公自动化信息表.责任人密级'];
    const idUserName =
      changeColumnLabelIdMap['计算机详细信息表.责任人'] ||
      changeColumnLabelIdMap['计算机信息表.责任人'] ||
      changeColumnLabelIdMap['计算机申领表.责任人'] ||
      changeColumnLabelIdMap['外设声像及办公自动化信息表.责任人']; //如果表单里没有此项也不会报错
    const idDept =
      changeColumnLabelIdMap['计算机详细信息表.责任部门'] ||
      changeColumnLabelIdMap['计算机信息表.责任部门'] ||
      changeColumnLabelIdMap['计算机申领表.责任部门'] ||
      changeColumnLabelIdMap['外设声像及办公自动化信息表.责任部门'];
    console.log('formItemAutoComplete start');

    if (processName.indexOf('报废') === -1) {
      //20220731 对于不可见的变更字段“涉密级别”的处理：约定了自定义表字段必须有“涉密级别”；也有另一种解决方法：table_涉密级别值直接从as_device里读(暂不用这种方式)
      //
      // let obj = {};
      // obj[labelIdMapForItem.get('涉密级别') + ''] =  core.getValue(labelIdMapForItem.get('table_涉密级别'));//20220730 todo验证：obj[''] = abc,会不会报错

      let objDept = {};
      core.setValue(labelIdMapForItem.get('责任部门') + '', loginUser.temp);
      //   core.setValue(idDept, loginUser.temp);
      if (chooseUser?.committerName) {
        //代他人填写：包括选择下拉人员和直接手写的
        //core.setValue(idUserName, chooseUser.committerName); //好像idUserName不存在这个控件，也不会报错
        core.setValue(labelIdMapForItem.get('责任人') + '', committerName);
      } else {
        //本人提交
        core.setValue(
          labelIdMapForItem.get('责任人') + '',
          loginUser.displayName,
        );
        core.setValue(
          labelIdMapForItem.get('责任人密级') + '',
          loginUser.secretDegree,
        );
        // core.setValue(idUserMiji, loginUser.secretDegree);
        // core.setValue(idUserName, loginUser.displayName);
      }
      if (chooseUser?.committerIdStr) {
        //用户在“代他人填写里”选择了下拉人员
        core.setValue(
          labelIdMapForItem.get('责任人密级') + '',
          chooseUser.committerIdStr.split('.')[3],
        );
        // core.setValue(idUserMiji, chooseUser.committerIdStr.split('.')[3]);
        // core.setValue(idUserName,chooseUser.committerName)
      }
    }
  }
  //对象
  if (connectTypeForAff) {
    //这个有值的场景：在外设申领startForm打开前:在options界面选择外设连接方式时
    if (processName.indexOf('外设声像及办公自动化申领') != -1) {
      if (connectTypeForAff?.indexOf('连接计算机') != -1) {
        let grantObj = {};
        grantObj[labelIdMapForItem.get('设备接入') + ''] = '开启';
        if (
          assetTypeIdForAff === 15 ||
          assetTypeIdForAff === 16 ||
          assetTypeIdForAff === 17
        ) {
          //扫描仪/扫码枪/高拍佼
          grantObj[labelIdMapForItem.get('USB接口') + ''] = '开启';
          grantObj[labelIdMapForItem.get('扫描设备') + ''] = '开启';
          //  core.setValues({labelIdMapForItem.get('接入主机端口') + '':'开启','3311':'开启','3313':'开启'})//U/设备接入/图像设备
        } else grantObj[labelIdMapForItem.get('USB接口') + ''] = '开启';
        core.setValues(grantObj);
      }
    }
  }


  if (assetArr){//有值场景：资产选择后：这个值目前仅用于判断场景
    if (processName.indexOf('申领') != -1) {
      //20220730 给申领隐藏变更字段“涉密级别” 赋值成自定义表中一样的值

      let obj = {};
      console.log('20220731 申领时的labelIdMapForItem', labelIdMapForItem)
      obj[labelIdMapForItem.get('涉密级别') + ''] = core.getValue(labelIdMapForItem.get('table_涉密级别')); //20220730 验证：obj[''] = abc,会不会报错:不会，直接忽略过此值

      console.log('20220731 申领时的labelIdMapForItem.get(涉密级别)  ',labelIdMapForItem.get('涉密级别'));
      console.log('20220731 申领时的labelIdMapForItem.get(table涉密级别)  ',labelIdMapForItem.get('table_涉密级别'));
      console.log('20220731 申领时的涉密级别 core.getValue(labelIdMapForItem.get table_涉密级别  ',core.getValue(labelIdMapForItem.get('table_涉密级别')));

      core.setValues(obj);
      console.log('20220731 自动赋值后的 core.values', core.getValues());
    }
  }
};
