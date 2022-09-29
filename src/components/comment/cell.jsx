import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import IconFont from '../iconfont'
import {textToEmoji} from '../../util/emoji'
import * as tool from '../../util/tool'
import './comment.less'

export default class CommentCell extends Component {
	render () {
        const {className = '', comment = {}} = this.props;

        const replys = textToEmoji(comment.content)

		return (
			<View className={'comment row ai_fs pb_10 bottom_light ' + className}>
                <Image src={comment.avatar} className={'avatar bg_light'}/>
                <View className={'ml_10 col_1'}>
                    <View className={'row ai_fs jc_sb'}>
                        <View>
                            <Text>{comment.username}</Text>
                            <Text className={'row label_12 label_light'}>{comment.pubTimeFt}</Text>
                        </View>
                        <View className={'row ai_ct'} onClick={() => this.props.onPraise && this.props.onPraise()}>
                            <IconFont name={comment.like ? 'dianzan1' : 'dianzan'} color={comment.like ? 'red' : '#999999'}/>
                            <Text className={'label_12 label_light ml_5'}>{comment.praise}</Text>
                        </View>
                    </View>
                    <View className={'mt_10'}>
                        <View className={'row ai_ct wrap'}>
                            {
                                replys.map((rpy, index) => {
                                    if (rpy.msgType == 'text') {
                                        return <Text>{rpy.msgCont}</Text>
                                    }
                                    return <Image src={rpy.msgImage} className={'emo'}/>
                                })
                            }
                        </View>
                        {comment.galleryList && comment.galleryList.length > 0 ?
                        <View className={'gallerys row wrap mt_5'}>
                            {comment.galleryList.map((img, index) => {
                                return (
                                    <Image src={img.fpath} className={'gallery bg_light'} mode={'aspectFill'} onClick={() => {
                                        Taro.previewImage({
                                            urls: tool.gurls(comment.galleryList)
                                        })
                                    }}/>
                                )
                            })}
                        </View>
                        : null}
                        {comment.childList && comment.childList.length > 0 ?
                        <View className={'bg_light p_10 mt_10'}>
                            {comment.childList.map((ccoment, index) => {
                                return (
                                    <Text className={'label_gray'}>小精灵：{ccoment.content}</Text>
                                )
                            })}
                        </View>
                        : null}
                    </View>
                </View>
			</View>
		)
	}
}
