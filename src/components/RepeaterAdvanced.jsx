import React, { Component } from 'react';
import Form, { FormItem, FormCore } from 'noform';
import { Input, Radio, Checkbox } from 'nowrapper/lib/antd';
import { TableRepeater, Selectify } from 'nowrapper/lib/antd/repeater';

const SelectTableRepeater = Selectify(TableRepeater);
const { Group: RadioGroup } = Radio;

const dataSource = [{ label: 'male', value: 'male' }, { label: 'female', value: 'female' }];
const validateConfig = {
    username: { type: 'string', required: true },
};

const repeatValues = [
    { username: 'lily', gender: 'female', id: 'lily' },
    { username: 'bobby', gender: 'male', id: 'bobby' }
];

const sleep = (mills) => new Promise(resolve => setTimeout(resolve, mills));

const asyncHandlerMap = {
    add: async (values) => {
        await sleep(500);
        return ({
            success: true,
            item: {
                ...values,
                username: 'modified by add handler',
                id: 'add' + Math.random().toString(36).slice(2)
            }
        });
    },
    update: async (values) => {
        await sleep(500);
        return ({
            success: true,
            item: {
                ...values,
                username: 'modified by update handler',
            }
        });
    },
    delete: async () => {
        await sleep(500);
        return true;
    },
    select: async (checked, current, currentArray) => {
        await sleep(500);
        return true;
    },
    //20220608
    afterSetting: (event, repeater) => {
        console.log('event', event, 'repeater', repeater);}
};

class Example extends Component {
    constructor(props, context) {
        super(props, context);
        this.core = new FormCore({
            values: {
                repeater: {
                    dataSource: repeatValues,
                    value: [repeatValues[0]]
                },
            },
            onChange: (fireKeys, values, ctx) => {
                console.log('onChange')
                console.log(values)
                const asyncHandler = {};
                if (values.enableAdd) asyncHandler.add = asyncHandlerMap['add'];
                if (values.enableUpdate) asyncHandler.update = asyncHandlerMap['update'];
                if (values.enableDelete) asyncHandler.delete = asyncHandlerMap['delete'];
                if (values.enableSelect) asyncHandler.select = asyncHandlerMap['select'];
                asyncHandler.afterSetting = asyncHandlerMap['afterSetting']; //20220608
                ctx.setProps({//mark一下：setProps应该是给repeaterc对象（core相关的那个逻辑数据对象）添加asyncHandler对象
                            //这里应该是使用一种约定/黑盒：repeater组件会自动读取约定好的上述“repeaterc对象”的命名为“asyncHandler”的成员（格式也是约定好的），作为“监听处理对象”
                    repeater: {
                        asyncHandler
                    },
                });
            }
        });

        window.core = this.core;
        this.formConfig = {
            validateConfig,
            autoValidate: true
        };
    }

    renderConfig = () => {
        const inlineLayout = { layout: { label: 12, control: 12 }, style: { width: 120, marginBottom: 12 } };
        return <div>
            <FormItem label="asyncHandler">
                <div>
                    <FormItem {...inlineLayout} inline label="add" name="enableAdd"><Checkbox /></FormItem>
                    <FormItem {...inlineLayout} inline label="update" name="enableUpdate"><Checkbox /></FormItem>
                    <FormItem {...inlineLayout} inline label="delete" name="enableDelete"><Checkbox /></FormItem>
                    <FormItem {...inlineLayout} inline label="select" name="enableSelect"><Checkbox /></FormItem>
                </div>
            </FormItem>
        </div>
    }

    render() {
        return (<Form core={this.core} layout={{ label: 6, control: 18 }} defaultMinWidth={false}>
            {this.renderConfig()}
            <div className="app-wrapper-2">
                <div className="example-item-wrapper">
                    <div className="example-title">AsyncHandler Examples</div>

                    <FormItem label="SelectTableRepeater" name="repeater">
                        <SelectTableRepeater formConfig={this.formConfig}>
                            <FormItem label="username" name="username"><Input style={{ width: '100px' }} /></FormItem>
                            <FormItem label="gender" name="gender"><RadioGroup style={{ width: 200 }} options={dataSource} /></FormItem>
                        </SelectTableRepeater>
                    </FormItem>
                </div>
            </div>
        </Form>);
    }
}

export default Example;
