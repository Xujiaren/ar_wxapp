import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, ScrollView,Textarea, Button, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import './ask.less'


class Reply extends Component {

    state = {
        content: '',
    }

    title = getCurrentInstance().router.params.title || ''
    askId = getCurrentInstance().router.params.askId || 0

    onAnswer = () => {
        const {actions} = this.props;
        const {content} = this.state;

        if (content.length < 1) {
            Taro.showToast({
                title: '提交失败，请写下您的回答。',
                icon: 'none'
            })
            return;
        }

        actions.ask.answer({
            ask_id: this.askId,
            fuser_id: 0,
            content: content,
            pics: '',
            resolved: (data) => {

                Taro.showToast({
                    title: '提交成功!将由工作人员筛选审核后公开显示。',
                    icon: 'success',
                    duration: 1500,
                    success: () => {
                        this.setState({
                            content: '',
                        }, () => Taro.navigateBack());
                    }
                })
            },
            rejected: (msg) => {
                Taro.showToast({
                    title: '提交失败，请检查您的输入。',
                    icon: 'none'
                })
            },
        })
    }

	render () {
        const {content} = this.state;
        
		return (
			<View className={'ask container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'p_30 row ai_ct jc_sb bg_white'}>
                            <Text className={'label_16'}>{this.title}</Text>
                        </View>
                        <View className={'p_30'}>
                            <Textarea placeholder={'写下你的回答，5个字以上'} className={'bg_light content circle_5 p_20'} value={content} onInput={(e) => {
                                this.setState({
                                    content: e.detail.value
                                })
                            }}/>
                        </View>
                    </ScrollView>
                </View>
                <View className={'p_10 bg_white safe'}>
                    <Button className={'col_1 bg_blue label_white'} onClick={this.onAnswer}>回答问题</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Reply;

function mapStateToProps(state) {
	return {

	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})
