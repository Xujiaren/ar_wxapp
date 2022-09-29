import React, { Component } from 'react'
import { View, Image, Text } from '@tarojs/components'

import './ask.less'

export default class AskCell extends Component {
	render () {
        const {ask = {}} = this.props;

		return (
			<View className={'ask row pt_10 pb_10 bottom_light'} onClick={() => this.props.onClick && this.props.onClick()}>
                <View className={'col_1 row col jc_sb'}>
                    <Text>{ask.title}</Text>
                    <Text className={'row label_12 label_light'}>{ask.hit}热度·{ask.replyNum}回答</Text>
                </View>
                {ask.gallery && ask.gallery.length > 0 ?
                <Image src={ask.gallery[0].fpath} className={'cover bg_light circle_5'} mode={'aspectFill'}/>
                : null}
            </View>
		)
	}
}
