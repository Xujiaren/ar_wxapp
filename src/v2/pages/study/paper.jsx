import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, ScrollView, Button, Text } from '@tarojs/components'
import _ from 'lodash'
import classNames from 'classnames'
import IconFont from '../../../components/iconfont'
import connectComponent from '../../../util/connect'
import Modal from '../../../components/base/modal'
import './study.less'

const ttypes = {'t0': '单选题', 't1': '判断题', 't3': '多选题'};
const chars = ['A', 'B', 'C' , 'D', 'E', 'F', 'G', 'H'];

class Paper extends Component {

    state = {
        loaded: false,
        done: false,
        topic_index: 0,
        answer: {},
        sheet: false,
    }

    paper = {}
    paperId = getCurrentInstance().router.params.paperId || 0
    levelId = getCurrentInstance().router.params.levelId || 0
    items = []
    ts = 0
    testId = 0

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {info} = nextProps;
        
        if (info !== this.props.info) {
            this.items = info.topicList;
            this.testId = info.testId;
            this.ts = (new Date().getTime() / 1000);
            this.paper = info;

            this.setState({
                topic_index: 0,
                done: info.status == 1,
                loaded: true,
            })
        }
    }

    onHeaderRefresh = () => {
		const {actions} = this.props;
		actions.exam.info(this.paperId, this.levelId);
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

        const duration = parseInt((new Date().getTime() / 1000) - this.ts);

        actions.exam.answer({
            levelId: this.levelId,
            test_id: this.testId,
            duration: duration,
            answer: JSON.stringify(answer),
            resolved: (data) => {
                if (this.levelId > 0) {
                    actions.course.levelStatus({
                        level_id: this.levelId,
                        resolved: (data) => {
                            Taro.navigateTo({
                                url: '/v2/pages/study/paperDone?paperId=' + this.paperId + '&levelId=' + this.levelId,
                            })
                        },
                        rejected: (res) => {
                            
                        },
                    })
                } else {
                    Taro.navigateTo({
                        url: '/v2/pages/study/paperDone?paperId=' + this.paperId + '&levelId=' + this.levelId,
                    })
                }
            },
            rejected: (msg) => {
                Taro.showToast({
                    title: '交卷失败，请联系工作人员。',
                    icon: 'none'
                })
            }
        })
    }

	render () {
        const {loaded, done, topic_index, answer, sheet} = this.state;
        if (!loaded) return null;

        const topic = this.items[topic_index] ? this.items[topic_index] : {};
        if (!topic.topicId) return null;

        let coptionIds = [];
        topic.answer.split(',').map((op, index) => {
            coptionIds.push(parseInt(op));
        })

        let uoptionIds = [];
        topic.userAnswer.answer.split(',').map((op, index) => {
            uoptionIds.push(parseInt(op));
        })

        const optionIds = answer[topic.topicId] || [];

        const pre_enable = topic_index > 0;
        const enable = this.items.length == Object.keys(answer).length;
        const next_enable = topic_index < (this.items.length - 1);

		return (
			<View className={'paper container row col'}>
				<View className={'col_1 h_100'}>
                    {done ?
                    <ScrollView
                        scrollY 
                        className={'h_full'}
                    >
                        <View className={'p_40'}>
                            <View className={'row ai_ct jc_sb'}>
                                <Text className={'label_20'}>{ttypes['t' + topic.ttype]}</Text>
                                <Text className={'label_gray'}>{topic_index + 1}/{this.items.length}</Text>
                            </View>
                            <Text className={'row label_16 mt_30'}>{topic.title}</Text>
                            <View className={'mt_30'}>
                            {topic.optionList.map((option, index) => {
                                const on = _.indexOf(uoptionIds, option.optionId) >= 0;
                                const correct = _.indexOf(coptionIds, option.optionId) >= 0;

                                return (
                                    <View className={'row ai_ct pt_10 pb_10'}  onClick={() => this.onOption(topic.ttype, topic.topicId, option.optionId)}>
                                        <View className={classNames('row col ai_ct jc_ct', {'odot': !on, 'odot_uon': on, 'odot_con': correct})}>
                                            <Text className={classNames({'label_gray': !on, 'label_blue': on, 'label_white': correct})}>{chars[index]}</Text>
                                        </View>

                                        <Text className={'row ml_10'}>{option.optionLabel}</Text>
                                    </View>
                                )
                            })}
                            </View>
                        </View>
                    </ScrollView>

					:<ScrollView
						scrollY 
						className={'h_full'}
					>
						<View className={'p_40'}>
                            <View className={'row ai_ct jc_sb'}>
                                <Text className={'label_20'}>{ttypes['t' + topic.ttype]}</Text>
                                <Text className={'label_gray'}>{topic_index + 1}/{this.items.length}</Text>
                            </View>
                            <Text className={'row label_16 mt_30'}>{topic.title}</Text>
                            <View className={'mt_30'}>
                                {topic.optionList.map((option, index) => {
                                    const on = _.indexOf(optionIds, option.optionId) >= 0;

                                    return (
                                        <View className={'row ai_ct pt_10 pb_10'}  onClick={() => this.onOption(topic.ttype, topic.topicId, option.optionId)}>
                                            <View className={classNames('row col ai_ct jc_ct', {'odot': !on, 'odot_on': on})}>
                                                <Text className={classNames({'label_gray': !on, 'label_blue': on})}>{chars[index]}</Text>
                                            </View>

                                            <Text className={'row ml_10'}>{option.optionLabel}</Text>
                                        </View>
                                    )
                                })}
                            </View>
						</View>
					</ScrollView>}
				</View>
                <View className={'row ai_ct p_10 bg_white top_light safe'}>
					<View className={'col_1 row ai_ct'} onClick={() => {
                        this.setState({
                            sheet: true
                        })
                    }}>
						<IconFont name={'sheet'} size={40}/>
                        <Text className={'row ml_5'}>答题卡</Text>
					</View>
					<View className={'col_1 row ai_ct'}>
                        <View onClick={() => {
                            if (pre_enable) {
                                this.setState({
                                    topic_index: topic_index - 1
                                })
                            }
                        }}>
                            <Text className={classNames({'label_light': !pre_enable})}>上一题</Text>
                        </View>
                        <View className={'ml_10'} onClick={() => {
                            if (next_enable) {
                                this.setState({
                                    topic_index: topic_index + 1
                                })
                            }
                        }}>
                            <Text className={classNames({'label_light': !next_enable})}>下一题</Text>
                        </View>
                    </View>
                    {done ?
                    <View className={'col_1 row col ai_ct'}>
                        <Text>
                            <Text className={'label_green'}>正确{this.paper.correctNum}</Text> <Text className={'label_orange'}>错误{this.paper.topicNum - this.paper.correctNum}</Text>
                        </Text>
                    </View>:
                    <View className={'col_1 row col ai_ct'} onClick={() => {
                        if (enable) {
                            this.onAnswer()
                        }
                    }}>
                        <Text className={classNames({'label_blue': enable, 'label_light': !enable})}>交卷</Text>
                    </View>}
				</View>

                <Modal visible={sheet} >
                    <View className={'modal'} onClick={() => {
                        this.setState({
                            sheet: false,
                        })
                    }}/>

                    <View className={'sheet bg_white p_10'}>
                        <View className={'row ai_ct jc_sb p_10 border_bottom'}>
                            {done ?
                            <Text><Text className={'label_green'}>正确{this.paper.correctNum}</Text> <Text className={'label_orange'}>错误{this.paper.topicNum - this.paper.correctNum}</Text></Text>
                            :
                            <Text>已选{Object.keys(answer).length}</Text>}
                            <Text className={'label_gray'}>{topic_index + 1}/{this.items.length}</Text>
                        </View>
                        <View className={'row wrap p_10'}>
                            {this.items.map((topic, index) => {
                                let on = false;
                                if (answer[topic.topicId]) {
                                    on = true;
                                }
                                
                                const correct = topic.userAnswer.isCorrect == 1;

                                if (done) {
                                    return (
                                        <View className={'sheet_item p_10 row col ai_ct jc_ct'} onClick={() => this.setState({
                                            topic_index: index
                                        })}>
                                            <View className={classNames('row col ai_ct jc_ct', {'odot_uon': !correct, 'odot_con': correct})}>
                                                <Text className={'label_white'}>{index + 1}</Text>
                                            </View>
                                        </View>
                                    )
                                }

                                return (
                                    <View className={'sheet_item p_10 row col ai_ct jc_ct'} onClick={() => this.setState({
                                        topic_index: index
                                    })}>
                                        <View className={classNames('row col ai_ct jc_ct', {'odot': !on, 'odot_on': on})}>
                                            <Text className={classNames({'label_blue': on})}>{index + 1}</Text>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                    </View>
                </Modal>
			</View>
		)
	}
}

const LayoutComponent = Paper;

function mapStateToProps(state) {
	return {
		info: state.exam.info,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})