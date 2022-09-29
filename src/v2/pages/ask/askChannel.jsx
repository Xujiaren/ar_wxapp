import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView,  Button, Text } from '@tarojs/components'
import classNames from 'classnames'

import connectComponent from '../../../util/connect'
import AskCell from '../../../components/ask/ask'

import './ask.less'

class AskChannel extends Component {

    state = {
		refresh: false,
		index: 0,
	}

    category = []
	total = 0
    page = 0
    pages = 1
	items = []

	componentDidShow() {
		const {actions} = this.props;
		actions.config.categoryAsk();

		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {category, index} = nextProps;

        if (category !== this.props.category) {
            this.category = category;
        }

        if (index !== this.props.index && index.items) {
            this.items = this.items.concat(index.items);
            this.total = index.total;
            this.pages = index.pages;
        }

		this.setState({
			refresh: false,
		})
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;
        const {index} = this.state;

        this.total = 0;
        this.page = 0;
        this.pages = 1;

        this.items = [];

        let category_id = 0;

        if (index > 0) {
            category_id = this.category[index - 1].categoryId;
        }

        actions.ask.index(category_id, '', 0, 0);

		this.setState({
			refresh: true,
		})
    }

	onFooterRefresh = () => {
		const {actions} = this.props;
        const {index} = this.state;

        let category_id = 0;

        if (index > 0) {
            category_id = this.category[index - 1].categoryId;
        }

        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.ask.index(category_id, '', 0, this.page);
        }
	}

	render () {
        const {index, refresh} = this.state;

		let citems = ['全部'];
        this.category.map((category, index) => {
            citems.push(category.categoryName);
        });

		return (
			<View className={'ask container row col'}>
                <View>
                    <ScrollView
						scrollX
						className={'border_bottom'}

						refresherEnabled={true}
						refresherTriggered={refresh}

						onRefresherRefresh={(e) => {
							this.onHeaderRefresh()
						}}

						onScrollToLower={(e) => {
							this.onFooterRefresh()
						}}
					>
						<View className={'row pt_10 nowrap'}>
						{citems.map((category, cindex) => {
							return (
								<View className={classNames('row col ai_ct', 'pl_15 pr_15', 'label_light', {'label_gray' : index == cindex})} onClick={() => {
									this.setState({
										index: cindex
									}, () => {
										this.onHeaderRefresh();
									})
								}}>
									<Text>{category}</Text>
									<View className={classNames('dot circle_10 mt_5', {'bg_blue': index == cindex})}/>
								</View>
							)
						})}
						</View>
					</ScrollView>
                </View>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
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
                <View className={'p_10 row ai_ct bg_white top_light safe'}>
                    <Button className={'col_1 bg_blue label_white'} size={'mini'} onClick={() => {
						Taro.navigateTo({
							url: '/v2/pages/user/ask'
						})
					}}>我的问答</Button>
					<Button className={'col_1 bg_blue label_white ml_10'} size={'mini'} onClick={() => {
						Taro.navigateTo({
							url: '/v2/pages/ask/publish'
						})
					}}>我要提问</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = AskChannel;

function mapStateToProps(state) {
	return {
		category: state.config.category_ask,
        index: state.ask.index,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})