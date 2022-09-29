import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView,  Swiper, SwiperItem, Image, Button, Text } from '@tarojs/components'
import classNames from 'classnames'
import qs from 'query-string'

import connectComponent from '../../../util/connect'
import * as tool from '../../../util/tool'
import './group.less'

const status = ['审核中', '退群', '已踢出'];

class GroupChannel extends Component {

    state = {
        refresh: false,
        type: 0,
        canPub: false,
        adIndex: 0,
    }

	ads = [];
    page = 0;
    pages = 1;
    total = 0;
    items = []

    componentDidShow() {
		const {actions} = this.props;
		actions.user.user();

		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {user, group_ad, index, user_group} = nextProps;

        if (user !== this.props.user) {
            this.setState({
                canPub: user.canPubGroup,
            })
        }

        if (group_ad !== this.props.group_ad) {
            this.ads = group_ad;
        }

        if (index !== this.props.index) {
            this.items = this.items.concat(index.items);
            this.total = index.total;
            this.pages = index.pages;
            this.page = index.page;
        }

        if (user_group !== this.props.user_group) {
            this.items = this.items.concat(user_group.items);
            this.total = user_group.total;
            this.pages = user_group.pages;
            this.page = user_group.page;
        }

        this.setState({
			refresh: false,
		})
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        const {type} = this.state;

        this.page = 0;
        this.pages = 1;
        this.total = 0;
        this.items = [];

        actions.config.groupAd();

        if (type == 0) {
            actions.group.index(0);
        } else {
            actions.group.user(1, 0);
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
                actions.group.index(this.page);
            } else {
                actions.group.user(-1, this.page);
            }
        }
	}

    onJump = (link) => {
		let data = qs.parseUrl(link);

		if (link.substring(0, 4) === 'http') {
			Taro.navigateTo({
				url: '/v2/pages/base/web?link=' + encodeURIComponent(link)
			})
		} else if (data.url.indexOf('courseDesc') !== -1) {
            const courseId = data.query['course_id'];
            Taro.navigateTo({
				url: '/v2/pages/course/vod?courseId=' + courseId
			})
        } else if (data.url.indexOf('liveDesc') !== -1) {
            const courseId = data.query['course_id'];
            Taro.navigateTo({
				url: '/v2/pages/course/live?courseId=' + courseId
			})
        } else if (data.url.indexOf('consultDesc') !== -1) {
            const courseId = data.query['course_id'];
            Taro.navigateTo({
				url: '/v2/pages/course/article?courseId=' + courseId
			})
        } else if (data.url.indexOf('audioDeSC') !== -1) {
            const courseId = data.query['course_id'];
            Taro.navigateTo({
				url: '/v2/pages/course/audio?courseId=' + courseId
			})
        } else if (data.url.indexOf('groupDeSC') !== -1) {
            const activityId = data.query['group_id'];
            Taro.navigateTo({
				url: '/v2/pages/group/group?activityId=' + activityId
			})
        } else if (data.url.indexOf('articleDeSC') !== -1) {
            const articleId = data.query['article_id'];
            Taro.navigateTo({
				url: '/v2/pages/news/news?articleId=' + articleId
			})
        } else if (data.url.indexOf('activityDeSC') !== -1) {
            const activityId = data.query['activity_id'];
            Taro.navigateTo({
				url: '/v2/pages/discovery/activity/activity?activityId=' + activityId
			})
        }
	}

    onExit = (activity_id) => {
        const {actions} = this.props;

        Taro.showModal({
            title: '打卡社区',
            content: '确定退出该活动？',
            success: function (res) {
                if (res.confirm) {
                    actions.group.exit({
                        activity_id: activity_id,
                        resolved: (data) => {
                            this.onHeaderRefresh()
                        },
                        rejected: (msg) => {
                            
                        },
                    })
                }
            }
        })

    }

	render () {
        const {user} = this.props;
        const {refresh, type, canPub} = this.state;

		return (
			<View className={'group container row col'}>
                <View className={'p_40'}>
                    <Swiper 
                        className={'ad_thumb'}
                        indicatorColor='rgba(255, 255, 255, 0.3)'
                        indicatorActiveColor='white'
                        circular
                        indicatorDots
                        autoplay
                    >
                        {this.ads.map((ad, index) => {
                            return (
                            <SwiperItem>
                                <Image src={ad.fileUrl} className={'ad_thumb bg_light circle_10'} onClick={() => this.onJump(ad.link)} mode={'aspectFill'}/>
                            </SwiperItem>
                            )
                        })}
                    </Swiper>
                    <View className={'row ai_ct jc_ad mt_30'}>
                        <View className={'row col ai_ct'} onClick={() => {
                            this.setState({
                                type: 0
                            }, () => {
                                this.onHeaderRefresh()
                            })
                        }}>
                            <Text className={classNames({'label_light': type == 1})}>推荐活动</Text>
                            <View className={classNames('dot  mt_5', {'bg_blue': type == 0})}/>
                        </View>
                        <View className={'row col ai_ct'} onClick={() => {
                            this.setState({
                                type: 1
                            }, () => {
                                this.onHeaderRefresh()
                            })
                        }}>
                            <Text className={classNames({'label_light': type == 0})}>我的打卡</Text>
                            <View className={classNames('dot  mt_5', {'bg_blue': type == 1})}/>
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
                            {this.items.map((group, index) => {
                                if (type == 1) {
                                    return (
                                        <View className={'citem mb_30 pb_10 bottom_light'}>
                                            <View className={'row ai_fs mt_10'} onClick={() => {
                                                Taro.navigateTo({
                                                    url: '/v2/pages/group/group?activityId=' + group.activityId
                                                })
                                            }}>
                                                <Image src={group.activityImg} className={'thumb bg_light'}  mode={'aspectFill'}/>
                                                <View className={'info row col jc_sb ml_10'}>
                                                    <Text>{group.title}</Text>
                                                    <Text className={'row label_light label_12 content'}>{group.content}</Text>
                                                    <Text className={'row label_light label_12'}>{tool.ts2dt(group.beginTime)}-{tool.ts2dt(group.endTime)}</Text>
                                                </View>
                                            </View>
                                            <View className={'row ai_ct jc_sb mt_10'}>
                                                <Text className={'label_gray'}>{group.commentNum}人打卡</Text>
                                                {user.userId != group.userId ?
                                                <Button size={'mini'} className={'bg_blue label_white mr_0'} disabled={group.menberStatus != 1} onClick={() => this.onExit(group.activityId)}>{status[group.menberStatus]}</Button>
                                                : null}
                                            </View>
                                        </View>
                                    )
                                }

                                return (
                                    <View className={'citem mb_30 row ai_fs pb_10 bottom_light'}>
                                        <Image src={group.avatar} className={'avatar bg_light'}/>
                                        <View className={'ml_10 col_1 pt_10'}>
                                            <View className={'row ai_ct jc_sb'}>
                                                <Text>{group.userName}</Text>
                                                <Text className={'label_light'}>{group.commentNum}人打卡</Text>
                                            </View>
                                            <View className={'row ai_fs mt_10'} onClick={() => {
                                                Taro.navigateTo({
                                                    url: '/v2/pages/group/group?activityId=' + group.activityId
                                                })
                                            }}>
                                                <Image src={group.activityImg} className={'thumb bg_light'}/>
                                                <View className={'info row col jc_sb ml_10'}>
                                                    <Text>{group.title}</Text>
                                                    <Text className={'row label_light label_12 content'}>{group.content}</Text>
                                                    <Text className={'row label_light label_12'}>{tool.ts2dt(group.beginTime)}-{tool.ts2dt(group.endTime)}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                )
                            })}
						</View>
					</ScrollView>
				</View>
                {canPub ?
                <View className={'p_10 bg_white top_light safe'}>
                    <Button className={'col_1 bg_blue label_white'} onClick={() => {
                        Taro.navigateTo({
                            url: '/v2/pages/group/publish'
                        })
                    }}>发布打卡活动</Button>
                </View>
                : null}
			</View>
		)
	}
}


const LayoutComponent = GroupChannel;

function mapStateToProps(state) {
	return {
		group_ad: state.config.group_ad,
        index: state.group.index,
        user_group: state.group.user_group,
        user: state.user.user,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})