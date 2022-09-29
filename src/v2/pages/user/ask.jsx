import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../../util/connect'
import AskCell from '../../../components/ask/ask'
import './user.less'

class Ask extends Component {

    state = {
        type: 0,
        refresh: false,
    }

	category = ['提问', '问答']

    page = 0
	pages = 1
	total = 0
    items = []

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {user_answer, user_ask} = nextProps;
        
        if (user_ask !== this.props.user_ask) {
            this.items = this.items.concat(user_ask.items);
            this.total = user_ask.total;
            this.pages = user_ask.pages;
        }

        if (user_answer !== this.props.user_answer) {
            this.items = this.items.concat(user_answer.items);
            this.total = user_answer.total;
            this.pages = user_answer.pages;
        }

        this.setState({
			refresh: false,
		})
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        const {type} = this.state;

        this.page = 0;
        this.pages = 0;
        this.total = 0;
        this.items = [];

        if (type == 0) {
            actions.ask.userAsk(0);
        } else {
            actions.ask.userAnswer(0);
        }

		this.setState({
			refresh: true,
		})
    }

    onFooterRefresh = () => {
		const {actions} = this.props;
        const {type} = this.state;

        if (this.page < this.pages) {
            this.page = this.page + 1;
            
            if (type == 0) {
                actions.ask.userAsk(this.page);
            } else {
                actions.ask.userAnswer(this.page);
            }
        }
	}

	render () {
        const {refresh, type} = this.state

		return (
			<View className={'ask container row col'}>
                <View className={'row pt_10 nowrap'}>
                {this.category.map((category, cindex) => {
                    return (
                        <View className={classNames('col_1 row col ai_ct', 'pl_15 pr_15', 'label_light', {'label_gray' : type == cindex})} onClick={() => {
                            this.setState({
                                type: cindex,
                            }, () => {
                                this.onHeaderRefresh()
                            })
                        }}>
                            <Text>{category}</Text>
                            <View className={classNames('dot circle_10 mt_5', {'bg_blue': type == cindex})}/>
                        </View>
                    )
                })}
                </View>
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
							{this.items.map((ask, index) => {
                                return (
                                    <AskCell ask={ask} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/ask/ask?askId=' + ask.askId
										})
									}}/>
                                )
                            })}
						</View>
					</ScrollView>
				</View>
			</View>
		)
	}
}

const LayoutComponent = Ask;

function mapStateToProps(state) {
	return {
		user_ask: state.ask.user_ask,
        user_answer: state.ask.user_answer,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})