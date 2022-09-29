import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import NewsCell from '../../../components/news'
import './news.less'

class NewsChannel extends Component {

	state = {
		refresh: false
	}

	page = 0
	pages = 1
	total = 0
	news = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {index} = nextProps;

        if (index !== this.props.index) {
            this.news = this.news.concat(index.items);
            this.total = index.total;
            this.pages = index.pages;
            this.page = index.page;
        }

		this.setState({
			refresh: false,
		})

    }

	onHeaderRefresh = () => {
		const {actions} = this.props;

        this.page = 0;
        this.pages = 1;
        this.news = [];

        actions.news.index(0);

		this.setState({
			refresh: true,
		})
	}

	onFooterRefresh = () => {
		const {actions} = this.props;

        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.news.index(this.page);
        }
	}

	render () {
		const {refresh} = this.state;

		return (
			<View className={'news container row col'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}

						refresherEnabled={true}
						refresherTriggered={refresh}

						onScrollToLower={(e) => {
							this.onFooterRefresh()
						}}

						onRefresherRefresh={(e) => {
							this.onHeaderRefresh()
						}}
					>
						<View className={'p_40 bg_white'}>
                        {this.news.map((news, index) => {
                            return (
                                <NewsCell ttype={news.ttype} className={'mb_30 border_bottom pb_10'} news={news} onClick={() => {
									Taro.navigateTo({
										url: '/v2/pages/news/news?articleId=' + news.articleId,
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

const LayoutComponent = NewsChannel;

function mapStateToProps(state) {
	return {
		index: state.news.index,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})