import React, { Component } from 'react'
import { View, Image, Text } from '@tarojs/components'

import './index.less'

export default class NewsCell extends Component {
	render () {
        const {className = '', ttype = 0, news = {}} = this.props;

        if (ttype == 0) {
            return (
                <View className={'news ' + className} onClick={() => this.props.onClick && this.props.onClick()}>
                    <View className={'thumb'}>
                        <Image src={news.articleImg} className={'news_thumb bg_light circle_10'} mode={'aspectFill'}/>
                        <View className={'title p_5'}>
                            <Text className={'label_white'}>{news.title}</Text>
                        </View>
                    </View>
                    <Text className={'label_12 label_light mt_10 row'}>{news.comment}评论 · {news.pubTimeFt}</Text>
                </View>
            )
        }

        if (ttype == 1) {
            return (
                <View className={'news ' + className} onClick={() => this.props.onClick && this.props.onClick()}>
                    <Text className={'label_16'}>{news.title}</Text>
                    <View className={'row ai_ct jc_sb mt_10'}>
                    {news.gallery && news.gallery.map((img, index) => {
                        return <Image src={img.fpath} className={'news_sthumb bg_light circle_10'} mode={'aspectFill'}/>
                    })}
                    </View>
                    <Text className={'label_12 label_light mt_10 row'}>{news.comment}评论 · {news.pubTimeFt}</Text>
                </View>
            )
        }

		return (
			<View className={'news ' + className + ' row ai_fs jc_sb'} onClick={() => this.props.onClick && this.props.onClick()}>
                <View className={'news_title'}>
                    <Text>{news.title}</Text>
                    <Text className={'label_12 label_light mt_10 row'}>{news.comment}评论 · {news.pubTimeFt}</Text>
                </View>
				<Image src={news.gallery && news.gallery.length > 0 ? news.gallery[0].fpath : ''} className={'news_sthumb bg_light circle_10'} mode={'aspectFill'}/>
			</View>
		)
	}
}
