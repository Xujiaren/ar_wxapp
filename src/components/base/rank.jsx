import React, { Component } from 'react'
import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import IconFont from '../iconfont'
import './base.less'

export default class Rank extends Component {

    state = {
        value: this.props.value || 0
    }

    componentWillReceiveProps(nextProps) {
        const {value} = nextProps;
        if (value !== this.props.value) {
            this.setState({
                value: value,
            })
        }
    }

    onChoose = (value) => {
        if (this.props.onChoose) {
            this.setState({
                value: value
            }, () => {
                this.props.onChoose(value);
            })
        }
    }

	render () {
        const {value} = this.state;
        const {label = ''} = this.props;

        let canChoose = false
        if (this.props.onChoose) {
            canChoose = true
        }

		return (
			<View className={'rank row ai_ct'}>
                {
                    [1, 2, 3, 4, 5].map((val, index) => {
                        const on = val <= value;

                        return (
                            <View onClick={() => this.onChoose(val)} className={canChoose? 'pr_5' : 'pr_2'}>
                                <IconFont name={'pingfen'} color={ on ? '#F0D97C' : '#999999'} size={24}/>
                            </View>
                        )
                    })
                }

                {label.length > 0 ?
                <Text className={'row ml_10 label_12 label_gray'}>{label}</Text>
                : null}
            </View>
		)
	}
}
