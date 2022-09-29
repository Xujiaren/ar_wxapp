import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Input, Text } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../../util/connect'
import IconFont from '../../../components/iconfont'

import VodCell from '../../../components/course/vod'
import ArticleCell from '../../../components/course/article'
import NewsCell from '../../../components/news/index'
import SpecialCell from '../../../components/discovery/special'
import AskCell from '../../../components/ask/ask'


import './user.less'

class Collect extends Component {

    state = {
		refresh: false,
        type: 0,
		keyword: '',
    }

	page = 0
	pages = 1
	total = 0
	category = ['视频', '音频', '直播', '回播', '图文', '资讯', '专题', '问答']
    items = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {collect_course, collect_item} = nextProps;

        if (collect_course !== this.props.collect_course) {
            this.page = collect_course.page;
            this.pages = collect_course.pages;
            this.total = collect_course.total;
            this.items = this.items.concat(collect_course.items);
        }

        if (collect_item !== this.props.collect_item) {
            this.page = collect_item.page;
            this.pages = collect_item.pages;
            this.total = collect_item.total;
            this.items = this.items.concat(collect_item.items);
        }

        this.setState({
			refresh: false,
		})
    }

	onHeaderRefresh = () => {
        const {actions} = this.props;
        const {type, keyword} = this.state;

        this.page = 0;
        this.pages = 0;
        this.total = 0;
        this.items = [];

        if (type < 5) {
            let status = 0;
            let _type = type;

            if (_type == 3) {
                _type = 2;
                status = 1;
            } else if (_type == 4) {
                _type = 3;
            }

            actions.user.collectCourse(keyword, _type, status, this.page);
        } else if (type == 5) {
            actions.user.collectItem(keyword, 11, this.page);
        } else if (type == 6) {
            actions.user.collectItem(keyword, 15, this.page);
        } else if (type == 7) {
            actions.user.collectItem(keyword, 10, this.page);
        }

		this.setState({
			refresh: true,
		})
    }

	onFooterRefresh = () => {
		const {actions} = this.props;
        const {type, keyword} = this.state;

        if (this.page < this.pages) {
            this.page = this.page + 1;

            if (type < 5) {
                let status = 0;
                let _type = type;

                if (_type == 3) {
                    _type = 2;
                    status = 1;
                } else if (_type == 4) {
                    _type = 3;
                }

                actions.user.collectCourse(keyword, _type, status, this.page);
            } else if (type == 5) {
                actions.user.collectItem(keyword, 11, this.page);
            } else if (type == 6) {
                actions.user.collectItem(keyword, 15, this.page);
            } else if (type == 7) {
                actions.user.collectItem(keyword, 10, this.page);
            }
        }
	}

	render () {
        const {refresh, type, keyword} = this.state

		return (
			<View className={'collect container row col'}>
                <View>
                    <ScrollView
						scrollX
						className={'border_bottom'}
					>
						<View className={'row pt_10 nowrap'}>
						{this.category.map((category, cindex) => {
							return (
								<View className={classNames('row col ai_ct', 'pl_15 pr_15', 'label_light', {'label_gray' : type == cindex})} onClick={() => {
									this.setState({
										type: cindex
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
					</ScrollView>
					<View className={'bg_white row ai_ct jc_sb p_5 pl_40 pr_40'}>
						<View className={'bg_light circle_10 p_5 search row ai_ct'}>
							<IconFont name={'search'} size={24}/>
							<Input className={'col_1 ml_10'} placeholder={'请输入关键词'} value={keyword} onInput={(e) => this.setState({keyword: e.detail.value})}/>
						</View>
						<View className={'ml_10'} onClick={() => this.onHeaderRefresh()}>
							<Text>搜索</Text>
						</View>
					</View>
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
						{this.items.map((data, index) => {
							let ctype = 3;
							let content_id = 0;
							if (type < 5) {
								content_id = data.courseId;
							} else if (type == 5) {
								ctype = 11;
								content_id = data.articleId;
							} else if (type == 6) {
								ctype = 15;
								content_id = data.articleId;
							} else if (type == 7) {
								ctype = 10;
								content_id = data.askId;
							}

							if (type == 1) {
								return (
									<VodCell className={'mb_30'} course={data} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/course/audio?courseId=' + content_id
										})
									}}/>
								)
							}

							if (type == 2) {
								return (
									<VodCell className={'mb_30'} course={data} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/course/live?courseId=' + content_id
										})
									}}/>
								)
							}

							if (type == 3) {
								return (
									<VodCell className={'mb_30'} course={data} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/course/vod?courseId=' + content_id
										})
									}}/>
								)
							}

							if (type == 4) {
								return (
									<ArticleCell ttype={data.ttype} className={'mb_30'} course={data} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/course/article?courseId=' + content_id
										})
									}}/>
								)
							}

							if (type == 5) {
								return (
									<NewsCell ttype={data.ttype} className={'mb_30'} news={data} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/news/news?articleId=' + content_id
										})
									}}/>
								)
							}

							if (type == 6) {
								return (
									<SpecialCell className={'mb_30'} special={data} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/discovery/special?articleId=' + content_id
										})
									}}/>
								)
							}

							if (type == 7) {
								return (
									<AskCell className={'mb_30'} ask={data} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/ask/ask?askId=' + content_id
										})
									}}/>
								)
							}

							return (
								<VodCell className={'mb_30'} course={data} onClick={() => {
									Taro.navigateTo({
										url: '/v2/pages/course/vod?courseId=' + content_id
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

const LayoutComponent = Collect;

function mapStateToProps(state) {
	return {
		collect_course: state.user.collect_course,
        collect_item: state.user.collect_item,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})