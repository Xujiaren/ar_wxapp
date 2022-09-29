import React, { Component } from 'react'
import { View, Image, Text } from '@tarojs/components'
import './base.less'

import emojis from '../../config/emoji'

export default class Emoji extends Component {

    state = {
        show: false,
    }

    show = () => {
        this.setState({
            show: true,
        })
    }

    hide = () => {
        this.setState({
            show: false,
        })
    }

	render () {
        const {show} = this.state
        if (!show) return null

		return (
			<View className={'emoji row wrap bg_white'}>
                {
                    Object.keys(emojis).map((key, index) => {
                        return (
                            <View className={'item row col ai_ct jc_ct'} onClick={() => {
                                this.props.onSelect && this.props.onSelect(key);
                            }}>
                                <Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/emo/' + emojis[key] + '.gif'} className={'eicon'}/>
                            </View>
                        )
                    })
                }
            </View>
		)
	}
}
