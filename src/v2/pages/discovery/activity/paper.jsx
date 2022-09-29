import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Textarea, Button, Text } from '@tarojs/components'
import _ from 'lodash'
import IconFont from '../../../../components/iconfont'
import connectComponent from '../../../../util/connect'
import './activity.less'

class Paper extends Component {

    state = {
        loaded: false,
        answer: {},
    }

    activityId = getCurrentInstance().router.params.activityId || 0
    items = []

    componentDidShow() {
		this.onHeaderRefresh()
	}

    componentWillReceiveProps(nextProps) {
        const {paper} = nextProps;

        if (paper !== this.props.paper) {

            this.items = paper;
            this.setState({
                loaded: true,
            })
        }
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.activity.paper(this.activityId);
    }

    onOption = (ttype, topicId, optionId) => {
        let answer = this.state.answer;
        
        if (answer[topicId] && ttype == 3) {
            let optionIds = answer[topicId];

            if (_.indexOf(optionIds, optionId) >= 0) {
                _.pull(optionIds, optionId);
            } else {
                optionIds.push(optionId);
            }
            
            if (optionIds.length > 0) {
                answer[topicId] = optionIds;
            } else {
                delete answer[topicId];
            }
        } else {
            answer[topicId] = [optionId];
        }

        this.setState({
            answer: answer,
        })
    }

    onAnswer = () => {
        const {actions} = this.props;
        const {answer} = this.state;

        actions.activity.answer({
            activity_id: this.activityId,
            answer: JSON.stringify(answer),
            resolved: (data) => {
                Taro.showToast({
                    title: '提交成功!',
                    icon: 'success',
                    duration: 3000,
                    success: () => {
                        this.setState({
                            title: '',
                            content: '',
                            gallery: [],
                        }, () => Taro.navigateBack());
                    }
                })
            },
            rejected: (msg) => {
                Taro.showToast({
                    title: '提交失败',
                    icon: 'none'
                })
            }
        })
    }

	render () {
        const {loaded, answer, tip} = this.state;
        const enable = this.items.length == Object.keys(answer).length;

        if (!loaded) return null

        let datas = [];
        this.items.map((item, index) => {
            datas.push({
                item: item,
                data: item.optionList,
            })
        })
        
		return (
			<View className={'activity container row col'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        {datas.map((topic, index) => {
                            return (
                                <View>
                                    <View className={'p_40 bg_light'}>
                                        <Text>{index + 1}.{topic.item.title}</Text>
                                    </View>
                                    {topic.data.map((option, oindex) => {
                                        const optionIds = answer[topic.item.topicId] || [];
                                        const on = _.indexOf(optionIds, option.optionId) >= 0;

                                        if (topic.item.ttype == 4) {

                                            let val = '';
                                            if (optionIds.length > 0) {
                                                val = optionIds[0];
                                            }

                                            return (
                                                <View className={'p_40'}>
                                                    <Textarea placeholder={option.optionLabel} className={'bg_light content circle_5 p_20'} value={val} onInput={(e) => {
                                                        this.onOption(topic.item.ttype, topic.item.topicId, e.detail.value)
                                                    }}/>
                                                </View>
                                            )
                                        }

                                        if (topic.item.ttype == 3) {
                                            return (
                                                <View className={'p_30 row ai_ct border_bottom'} onClick={() => this.onOption(topic.item.ttype, topic.item.topicId, option.optionId)}>
                                                    <IconFont name={on ? 'checked' : 'uncheck'} size={32}/>
                                                    <Text className={'row ml_10'}>{option.optionLabel}</Text>
                                                </View>
                                            )
                                        }

                                        return (
                                            <View className={'p_30 row ai_ct border_bottom'} onClick={() => this.onOption(topic.item.ttype, topic.item.topicId, option.optionId)}>
                                                <IconFont name={on ? 'selected' : 'unselect'} size={32}/>
                                                <Text className={'row ml_10'}>{option.optionLabel}</Text>
                                            </View>
                                        )
                                    })}
                                    
                                </View>
                            )
                        })}
                        
                    </ScrollView>
                </View>
                <View className={'p_10 bg_white safe'}>
                    <Button className={'col_1 bg_blue label_white'} disabled={!enable} onClick={this.onAnswer}>提交</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Paper;

function mapStateToProps(state) {
	return {
		paper: state.activity.paper,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})