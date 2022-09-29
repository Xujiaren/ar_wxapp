import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Swiper, SwiperItem, Image, Button, Text } from '@tarojs/components'
import qs from 'query-string'
import IconFont from '../../components/iconfont'
import connectComponent from '../../util/connect'
import NewsCell from '../../components/news'
import ArticleCell from '../../components/course/article'
import VodCell from '../../components/course/vod'
import VVodCell from '../../components/course/vvod'
import ActivityCell from '../../components/discovery/activity'
import SpecialCell from '../../components/discovery/special'

import Modal from '../../components/base/modal'

import asset from '../../config/asset'
import config from '../../config/param'

import './index.less'

class Index extends Component {

	state = {
		pop: false,
		unread: 0,
		keyword: '',
		refresh: false,

		live_index: 0,
	}

	index = []
	live = []
	teacher = []
	ad = []
	pop_ads = []
	recomm = []
	

	componentDidMount() {
		// Taro.navigateTo({
		// 	url: '/v2/pages/course/livePay?x=1&b=2&c=4',
		// })

		// Taro.switchTab({
		// 	url: '/pages/discovery/discovery',
		// })

	}

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
		const {config, index, live, ad, pop_ad, recomm, unread} = nextProps;

		if (config !== this.props.config) {
            this.setState({
                keyword: config.search_def,
            })
        }

		if (index !== this.props.index) {
            this.index = index;
        }

		if (live !== this.props.live && live.items) {
            this.live = live.items;
        }

		if (ad !== this.props.ad) {
            this.ad = ad;
        }

		if (pop_ad !== this.props.pop_ad) {
            this.pop_ads = pop_ad;

            this.onPop();
        }

		if (recomm !== this.props.recomm) {
            this.recomm = recomm;
        }

		if (unread !== this.props.unread) {
            this.setState({
                unread: unread.message + unread.remind,
            })
        }

		this.setState({
			refresh: false,
		})
	}

	onShareAppMessage(res) {
		return {
			title: '纳视界',
			path : '/pages/home/index'
		}
	}

	onHeaderRefresh = () => {
		const {actions} = this.props;
		actions.user.user();
		actions.config.config();
		actions.config.ad(1);
		actions.config.podAd();
		actions.site.index();
        actions.course.live(0, 0, 0);
        actions.course.recomm();
		actions.user.unread();

		this.setState({
			refresh: true,
		})
	}

	
	onJump = (link) => {

		this.onExitPop();
		
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

	onPop = () => {
		if (this.pop_ads.length > 0) {
            const lastPopId = this.pop_ads[this.pop_ads.length - 1].billboardId;
			const popId = Taro.getStorageSync('pop') || 0;

			if (lastPopId != popId) {
				this.setState({
					pop: true,
				})
			}
        }
	}

	onExitPop = () => {
		this.setState({
            pop: false,
        }, () => {
            if (this.pop_ads.length > 0) {
                const lastPopId = this.pop_ads[this.pop_ads.length - 1].billboardId;
				Taro.setStorageSync('pop', lastPopId);
            }
        })
	}

	onAction = (action, args) => {
		const {actions, user} = this.props;

		if (!user.userId) {
            Taro.navigateTo({
				url: '/pages/user/passport'
			})

        } else if (action == 'Book') {
            
            let live = this.live[args.index];

            if (live.book) {
                actions.user.unbook({
                    course_id: live.courseId,
                    resolved: (data) => {    
                        live.book = false;
                        live.bookNum--;
                        this.live[args.index] = live;
    
                        this.setState({
                            live_index: args.index,
                        })
                    },
                    rejected: (msg) => {
    
                    }
                })
            } else {
				Taro.requestSubscribeMessage({
					tmplIds: [config.live_notify],
					success: (res) => {
						if (res[config.live_notify] == 'accept') {
							actions.user.book({
								course_id: live.courseId,
								resolved: (data) => {
			
									live.book = true;
									live.bookNum++;
									this.live[args.index] = live;
				
									this.setState({
										live_index: args.index,
									})
								},
								rejected: (msg) => {
				
								}
							})
						}
					}
				})
            }
        } else  if (action == 'message') {
            Taro.navigateTo({
				url: '/v2/pages/user/message/message'
			})
        }
	}

	renderLive = () => {
		return this.live.map((live, index) => {
			const on = live.liveStatus == 1;

			return (
				<View className={'bg_white p_30 mt_30 circle_10 shadow_bottom'}>
					{index == 0 ?
					<View className={'row ai_ct jc_sb pb_10'}>
						<Text className={'label_bold'}>直播资源</Text>
						<View className={'row ai_ct'} onClick={() => {
							Taro.navigateTo({
								url: '/v2/pages/course/liveChannel'
							})
						}}>
							<Text className={'label_12 label_light'}>查看全部</Text>
							<IconFont name={'right'} size={24} color={'#999999'}/>
						</View>
					</View>
					: null}
					<View className={'row ai_ct jc_sb pb_10 border_bottom'}>
						<Text className={'label_12'}>{on ? '正在直播中' : live.beginTimeFt}</Text>
						<Text className={'label_12 label_light'}>{live.liveStatus == 0 ? live.bookNum + '人已预约' : live.onlineNum + '人正在上课'}</Text>
					</View>
					<View className={'pt_10'} onClick={() => {
						Taro.navigateTo({
							url: '/v2/pages/course/live?courseId=' + live.courseId,
						})
					}}>
						<Text>{live.courseName}</Text>
						<View className={'row ai_ct jc_sb'}>
							<Text className={'label_12 label_gray summary'}>{live.summary}</Text>
							<Button size='mini' className={'label_blue mr_0'} onClick={(e) => {
								e.stopPropagation()
								this.onAction('Book', {index: index})
							}}>{live.book ? '取消预约' : '预约'}</Button>
						</View>
					</View>
				</View>
			)
		})
	}

	renderVod = (channel) => {
		if (channel.courseList.length == 0) return null;

		return (
			<View className={'vod bg_white p_30 mt_30 circle_10 shadow_bottom'}>
				<View className={'row ai_ct jc_sb'}>
					<Text className={'label_bold'}>{channel.channelName}</Text>
					<View className={'row ai_ct'} onClick={() => {
						Taro.navigateTo({
							url: '/v2/pages/course/channel?channelId=' + channel.channelId +'&ctype=0',
						})
					}}>
						<Text className={'label_12 label_light'}>查看全部</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
				</View>
				<View className={'row wrap'}>
					{channel.courseList.map((course, index) => {
						return (
							<VVodCell className={'item mt_10'} course={course} onClick={() => {
								Taro.navigateTo({
									url: '/v2/pages/course/vod?courseId=' + course.courseId,
								})
							}}/>
						)
					})}
				</View>
			</View>
		)
	}

	renderAudio = (channel) => {
		if (channel.courseList.length == 0) return null;

		return (
			<View className={'audio bg_white p_30 mt_30 circle_10 shadow_bottom'}>
				<View className={'row ai_ct jc_sb'}>
					<Text className={'label_bold'}>{channel.channelName}</Text>
					<View className={'row ai_ct'} onClick={() => {
						Taro.navigateTo({
							url: '/v2/pages/course/channel?channelId=' + channel.channelId +'&ctype=1',
						})
					}}>
						<Text className={'label_12 label_light'}>查看全部</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
				</View>
				<View className={'audio'}>
					{channel.courseList.map((course, index) => {
						return (
							<VodCell className={'mt_30'} course={course} onClick={() => {
								Taro.navigateTo({
									url: '/v2/pages/course/audio?courseId=' + course.courseId,
								})
							}}/>
						)
					})}
				</View>
			</View>
		)
	}

	renderArticle = (channel) => {
		if (channel.courseList.length == 0) return null;

		return (
			<View className={'bg_white p_30 mt_30 circle_10 shadow_bottom'}>
				<View className={'row ai_ct jc_sb'}>
					<Text className={'label_bold'}>{channel.channelName}</Text>
					<View className={'row ai_ct'} onClick={() => {
						Taro.navigateTo({
							url: '/v2/pages/course/articleChannel?channelId=' + channel.channelId,
						})
					}}>
						<Text className={'label_12 label_light'}>查看全部</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
				</View>
				<View>
					{channel.courseList.map((course, index) => {
						return (
							<ArticleCell ttype={course.ttype} className={'mt_30 border_bottom pb_10'} course={course} onClick={() => {
								Taro.navigateTo({
									url: '/v2/pages/course/article?courseId=' + course.courseId,
								})
							}}/>
						)
					})}
				</View>
			</View>
		)
	}

	renderSpecial = (channel) => {
		if (channel.length == 0) return null;

		return (
			<View className={'special bg_white p_30 mt_30 circle_10 shadow_bottom'}>
				<View className={'row ai_ct jc_sb'}>
					<Text className={'label_bold'}>专题</Text>
					<View className={'row ai_ct'} onClick={() => {
						Taro.setStorageSync('dtype', 1)

						Taro.switchTab({
							url: '/pages/discovery/discovery'
						})
					}}>
						<Text className={'label_12 label_light'}>查看全部</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
				</View>
				<View>
					{channel.map((special, index) => {
						return <SpecialCell className={'mt_30'} special={special} onClick={() => {
							Taro.navigateTo({
								url: '/v2/pages/discovery/special?articleId=' + special.articleId,
							})
						}}/>
					})}
				</View>
			</View>
		)
	}

	renderActivity = (channel) => {
		if (channel.length == 0) return null;

		return (
			<View className={'activity bg_white p_30 mt_30 circle_10 shadow_bottom'}>
				<View className={'row ai_ct jc_sb'}>
					<Text className={'label_bold'}>活动</Text>
					<View className={'row ai_ct'} onClick={() => {
						Taro.setStorageSync('dtype', 0)
						
						Taro.switchTab({
							url: '/pages/discovery/discovery'
						})
					}}>
						<Text className={'label_12 label_light'}>查看全部</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
				</View>
				<View>
					{channel.map((activity, index) => {
						return <ActivityCell className={'mt_30'} activity={activity} onClick={() => {
							Taro.navigateTo({
								url: '/v2/pages/discovery/activity/activity?activityId=' + activity.activityId,
							})
						}}/>
					})}
				</View>
			</View>
		)
	}

	renderNews = (channel) => {
		if (channel.length == 0) return null;
        const data = channel.slice(0, 3);

		return (
			<View className={'bg_white p_30 mt_30 circle_10 shadow_bottom'}>
				<View className={'row ai_ct jc_sb'}>
					<Text className={'label_bold'}>资讯</Text>
					<View className={'row ai_ct'} onClick={() => {
						Taro.navigateTo({
							url: '/v2/pages/news/newsChannel',
						})
					}}>
						<Text className={'label_12 label_light'}>查看全部</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
				</View>
				<View>
					{data.map((news, index) => {
						return (
							<NewsCell ttype={news.ttype} className={'mt_30 border_bottom pb_10'} news={news} onClick={() => {
								Taro.navigateTo({
									url: '/v2/pages/news/news?articleId=' + news.articleId,
								})
							}}/>
						)
					})}
				</View>
			</View>
		)
	}
	
	renderTeacher = (teachers) => {
		if (teachers.length == 0) return null;

		return (
			<View className={'teacher bg_white p_30 mt_30 circle_10 shadow_bottom'}>
				<View className={'row ai_ct jc_sb'}>
					<Text className={'label_bold'}>名师专区</Text>
					<View className={'row ai_ct'} onClick={() => {
						Taro.navigateTo({
							url: '/v2/pages/teacher/teacherChannel',
						})
					}}>
						<Text className={'label_12 label_light'}>查看全部</Text>
						<IconFont name={'right'} size={24} color={'#999999'}/>
					</View>
				</View>
				<ScrollView
					className={'mt_30'}
					scrollX
				>
					<View className={'row'}>
						{teachers.map((teacher, index) => {
							return (
								<View className={'row col item mr_20 ai_ct jc_ct'} onClick={() => {
									Taro.navigateTo({
										url: '/v2/pages/teacher/teacher?teacherId=' + teacher.teacherId,
									})
								}}>
									<Image src={teacher.teacherImg} className={'teacher_thumb bg_light circle_10'} mode={'aspectFill'}/>
									<Text className={'row mt_5'}>{teacher.teacherName}</Text>
									<View className={'border_light circle_25 mt_5 pl_5 pr_5'}>
										<Text className={'label_12 label_light'}>{teacher.follow}人关注</Text>
									</View>
								</View>
							)
						})}
					</View>
				</ScrollView>
			</View>
		)
	}

	render () {
		const {pop, keyword, refresh, unread} = this.state;

		return (
			<View className={'index container row col bg_light'}>
				<View className={'bg_white row ai_ct jc_sb p_5 pl_40 pr_40'}>
					<View className={'bg_light circle_10 p_5 search row ai_ct'} onClick={() => {
						Taro.navigateTo({
							url: '/v2/pages/home/search',
						})
					}}>
						<IconFont name={'search'} size={24}/>
						<Text className={'label_gray ml_5 row'}>{keyword}</Text>
					</View>
					<View onClick={() => this.onAction('message')} className={'pr'}>
						<IconFont name={'xiaoxi'} size={36}/>
						{unread ?
						<View className={'count bg_red row col ai_ct jc_ct'}>
							<Text className={'label_9 label_white'}>{unread}</Text>
						</View>
						: null}
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
					>
						<View className={'p_40'}>
							<Swiper 
								className={'ad_thumb'}
								indicatorColor='rgba(255, 255, 255, 0.3)'
								indicatorActiveColor='white'
								circular
								indicatorDots
								autoplay
							>
								{this.ad.map((ad, index) => {
									return (
										<SwiperItem>
											<Image src={ad.fileUrl} className={'ad_thumb circle_10'} onClick={() => this.onJump(ad.link)} mode={'aspectFill'}/>
										</SwiperItem>
									)
									
								})}
							</Swiper>

							<View className={'bg_white p_30 mt_30 circle_10 shadow_bottom row ai_ct jc_sb'}>
								<Image src={asset.home.live} className={'liveback'}/>
								<View className={'row ai_ct'} onClick={() => {
									Taro.navigateTo({
										url: '/v2/pages/course/liveChannel',
									})
								}}>
									<Text className={'label_12 label_light'}>查看全部</Text>
									<IconFont name={'right'} size={24} color={'#999999'}/>
								</View>
							</View>

							{this.renderLive()}
							{this.index.map((channel ,index) => {
								if (channel.type == 'channel' && channel.data) {
									if (channel.data.ctype == 0) {
										return this.renderVod(channel.data);
									} else if (channel.data.ctype == 1) {
										return this.renderAudio(channel.data);
									} else if (channel.data.ctype == 2) {
										
									} else if (channel.data.ctype == 3) {
										return this.renderArticle(channel.data);
									}
								} else if (channel.type == 'activity') {
									return this.renderActivity(channel.data);
								} else if (channel.type == 'column') {
									return this.renderSpecial(channel.data);
								} else if (channel.type == 'article') {
									return this.renderNews(channel.data);
								} else if (channel.type == 'teacher') {
									return this.renderTeacher(channel.data);
								}
							})}

							<Text className={'label_bold row mt_30'}>猜你喜欢</Text>
							<View className={'recomm'}>
							{this.recomm.map((course, index) => {
								return (
									<VodCell className={'mt_30'} course={course} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/course/vod?courseId=' + course.courseId,
										})
									}}/>
								)
							})}
							</View>
						</View>
					</ScrollView>
				</View>

				<Modal visible={pop}>
					<View className={'modal'} onClick={this.onExitPop}/>
					<View className={'pop circle_10 bg_white'}>
						<Swiper 
							className={'pop_thumb'}
							indicatorColor='rgba(255, 255, 255, 0.3)'
							indicatorActiveColor='white'
							circular
							indicatorDots
							autoplay
						>
							{this.pop_ads.map((ad, index) => {
								return (
									<SwiperItem>
										<Image src={ad.fileUrl} className={'pop_thumb circle_10'} mode={'aspectFill'} onClick={() => this.onJump(ad.link)} />
									</SwiperItem>
								)
								
							})}
						</Swiper>
						<View className={'p_30 row ai_ct jc_ct'} onClick={this.onExitPop}>
							<Text>关闭</Text>
						</View>
					</View>
				</Modal>
			</View>
		)
	}
}

const LayoutComponent = Index;

function mapStateToProps(state) {
	return {
		ad: state.config.ad,
        pop_ad: state.config.pop_ad,
        config: state.config.config,
        index: state.site.index,
        live: state.course.live,
        recomm: state.course.recomm,
        user: state.user.user,
        unread: state.user.unread,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})