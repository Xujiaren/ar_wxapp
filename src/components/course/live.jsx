import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import classNames from 'classnames'
import {textToEmoji} from '../../util/emoji'
import './course.less'

export default class LiveCell extends Component {

    renderMsg = (msg, owner) => {

        if (msg.mtype == 'img') {
            return (
                <Image src={msg.msg} className={'thumb circle_10'} mode={'aspectFill'} onClick={() => {
                    Taro.previewImage({
                        urls: [msg.msg]
                    })
                }}/>
            )
        }

        const replys = textToEmoji(msg.msg)

        return (
            <View className={'row ai_ct wrap'}>
                {
                    replys.map((rpy, index) => {
                        if (rpy.msgType == 'text') {
                            return <Text className={classNames({'label_white': owner})}>{rpy.msgCont}</Text>
                        }
                        return <Image src={rpy.msgImage} className={'emo'}/>
                    })
                }
            </View>
        )
    }

	render () {
        const {id = '', className = '', msg = {}, user = {}, owner = false} = this.props;

        if (owner) {
            return (
                <View id={id} className={'livecell row ai_ct jc_end p_10 ' + className}>
                    <View className={'avatar_small'}/>
                    <View className={'mr_10 col_1'}>
                        <View className={'row ai_ct jc_end mt_5'}>
                            <View className={'bg_blue p_5 circle_10 pl_10 pr_10'}>
                                {this.renderMsg(msg, owner)}
                            </View>
                            <View className='rtri_box'/>
                        </View>
                    </View>
                    <Image src={user.avatar} className={'avatar_small'} mode={'aspectFill'}/>
                </View>
            )
        }

		return (
			<View className={'livecell row ai_ct jc_fs p_10 ' + className}>
                <Image src={user.avatar} className={'avatar_small'}/>
                <View className={'ml_10 col_1'}>
                    <Text className={classNames('label_12 ', {'label_gray': user.admin == 0, 'label_blue': user.admin == 1})}>{user.name}</Text>
                    <View className={'row ai_ct jc_fs mt_5 msg'}>
                        <View className='tri_box'/>
                        <View className={'bg_white p_5 circle_10 pl_10 pr_10'}>
                            {this.renderMsg(msg, owner)}
                        </View>
                    </View>
                    
                </View>
			</View>
		)
	}
}
