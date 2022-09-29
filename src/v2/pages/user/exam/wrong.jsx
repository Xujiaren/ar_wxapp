import React, { Component } from 'react'
import { View, ScrollView, Button, Text } from '@tarojs/components'
import _ from 'lodash'
import classNames from 'classnames'
import connectComponent from '../../../../util/connect'
import Modal from '../../../../components/base/modal'
import './test.less'

const chars = ['A', 'B', 'C' , 'D', 'E', 'F', 'G', 'H'];

class Wrong extends Component {

	state = {
		topic_preview: false,
        topic_index: 0,
		refresh: false,
	}

    page = 0
    pages = 0
    total = 0
    items = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {wtest} = nextProps;
        if (wtest !== this.props.wtest) {
            this.pages = wtest.pages;
            this.total = wtest.total;
            this.items = this.items.concat(wtest.items);
        }

		this.setState({
            refresh: false,
        })
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;

        this.page = 1;
        this.pages = 1;
        this.total = 0;
        this.items = [];

        actions.exam.wrongTest(0);

        this.setState({
            refresh: true,
        })
    }

    onFooterRefresh = () => {
        const {actions} = this.props;

        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.exam.wrongTest(this.page);
        }
    }

	onPreview = (index) => {
		this.setState({
            topic_preview: true,
            topic_index: index,
        })
	}

	render () {
		const {topic_preview, topic_index, refresh} = this.state

		const topic = this.items[topic_index] ? this.items[topic_index] : {};

        let optionList = [];
        let coptionIds = [];
        let uoptionIds = [];
        if (topic.topicId) {

            optionList = topic.optionList;
            topic.answer.split(',').map((op, index) => {
                coptionIds.push(parseInt(op));
            })

            topic.userAnswer.answer.split(',').map((op, index) => {
                uoptionIds.push(parseInt(op));
            })
        }

		return (
			<View className={'wrong container row col bg_white'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}

						refresherEnabled={true}
						refresherTriggered={refresh}

						onRefresherRefresh={(e) => {
							this.onHeaderRefresh()
						}}

						onScrollToLower={(e) => {
							this.onFooterRefresh()
						}}
					>
						<View className={'p_40'}>
                            {this.items.map((topic, index) => {
								return (
                                    <View className={'pt_10 pb_10 bottom_light'} onClick={() => this.onPreview(index)}>
                                        <Text>[{topic.paperName}]{topic.title}</Text>
                                    </View>
                                )
							})}
						</View>
					</ScrollView>
				</View>

				<Modal visible={topic_preview}>
					<View className={'modal'} onClick={() => this.setState({topic_preview:false})}/>
					<View className={'preview row col bg_white circle_5'}>
						<View className={'col_1'}>
							<ScrollView
								scrollY
								className={'h_full'}
							>
								<View className={'p_10'}>
									<Text className={'label_16'}>{topic.title}</Text>
									<View className={'mt_30'}>
										{optionList.map((option, index) => {
											const on = _.indexOf(uoptionIds, option.optionId) >= 0;
											const correct = _.indexOf(coptionIds, option.optionId) >= 0;

											return (
												<View  className={'mt_10 mb_10 row ai_ct'}>
													<View className={classNames('odot row col ai_ct jc_ct mr_10', {'odot_user_on': on}, {'odot_correct_on': correct})}>
														<Text className={classNames('label_gray', {'label_white': on || correct})}>{chars[index]}</Text>
													</View>
													<Text>{option.optionLabel}</Text>
												</View>
											)
										})}
									</View>
									<Text className={'label_16 row mt_30'}>解析</Text>
									<Text className={'label_gray row mt_5'}>{topic.analysis}</Text>
									<Text className={'label_gray row mt_5'}>题目来源：{topic.paperName}</Text>
								</View>
							</ScrollView>
						</View>
						
						<View className={'p_10 row'}>
							<Button className={'col_1'} size={'mini'} onClick={()=> this.setState({topic_preview:false})}>关闭</Button>
						</View>
					</View>
				</Modal>
			</View>
		)
	}
}

const LayoutComponent = Wrong;

function mapStateToProps(state) {
	return {
		wtest: state.exam.wtest,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})