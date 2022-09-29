import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, ScrollView, Image, Button, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import IconFont from '../../../components/iconfont'
import NewsCell from '../../../components/news'
import RecommComment from '../../../components/comment/recomm'
import * as tool from '../../../util/tool'
import './news.less'
import '@tarojs/taro/html5.css'

class News extends Component {

    state = {
        loaded: false,
        index: 0,
        isCollect: false,
        collectNum: 0,
    }

    fromuid = getCurrentInstance().router.params.fromuid || 0
    articleId = getCurrentInstance().router.params.articleId || 0
    news = {}
    comments = []
    recomms = []

    componentDidShow() {

        this.fromuid = getCurrentInstance().router.params.fromuid || 0
        if (this.fromuid > 0) {
			global.fromuid = this.fromuid
		}
		this.onHeaderRefresh();

        Taro.options.html.transformElement = (el) => {
            if (el.nodeName === 'image') {
                el.setAttribute('mode', 'widthFix')
            }
            return el
        }
	}
    
    componentWillReceiveProps(nextProps) {
        const {user, news, comment, relation} = nextProps;

        if (user != this.props.user) {
            global.uid = user.userId;
        }

        if (news !== this.props.news) {
            this.news = news;

            if (news.canShare == 0) {
                Taro.hideShareMenu()
            }

            Taro.setNavigationBarTitle({
                title: news.title,
            })

            this.setState({
                loaded: true,
                isCollect: news.isCollect,
                collectNum: news.collectNum,
            })
        }

        if (comment !== this.props.comment) {
            this.comments = comment.items;
        }

        if (relation !== this.props.relation) {
            this.recomms = relation;
        }
    }

    onShareAppMessage = (res) => {
        
        return {
            title: this.news.title,
            path: '/v2/pages/news/news?articleId=' + this.articleId + '&fromuid=' + global.uid + '&utype=' + global.utype,
            imageUrl: this.news.articleImg + '?x-oss-process=image/resize,w_500,h_380,m_pad'
        }

    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.user.user();
        actions.news.info(this.articleId);
        actions.news.comment(this.articleId, 2, 0);
        actions.news.relation(this.articleId);
    }

    onAction = (action, args) => {
        const {actions, user} = this.props;
        const {isCollect, collectNum} = this.state;

        if (!user.userId) {
            Taro.navigateTo({
				url: '/pages/user/passport'
			})
        } else {
            if (action == 'PublishComment') {
                Taro.navigateTo({
					url: '/v2/pages/base/comment/publish?ctype=11&content_id=' + this.articleId,
				})

            } else if (action == 'Collect') {
                
                if (isCollect) {
                    actions.user.uncollect({
                        ctype: 11,
                        content_id: this.news.articleId,
                        resolved: (data) => {
                            this.setState({
                                isCollect: false,
                                collectNum: collectNum - 1,
                            })
                        },
                        rejected: (msg) => {
    
                        }
                    })

                } else {
                    actions.user.collect({
                        ctype: 11,
                        content_id: this.news.articleId,
                        resolved: (data) => {
                            this.setState({
                                isCollect: true,
                                collectNum: collectNum + 1,
                            })
                        },
                        rejected: (msg) => {
    
                        }
                    })
                }

            } else if (action == 'Praise') {
                let comment = this.comments[args.index];

                if (comment.like) {
                    comment.like = false;
                    comment.praise--;

                    actions.user.unlikeComment({
                        comment_id: comment.commentId,
                        resolved: (data) => {

                        },
                        rejected: (msg) => {

                        }
                    })

                } else {
                    comment.like = true;
                    comment.praise++;

                    actions.user.likeComment({
                        comment_id: comment.commentId,
                        resolved: (data) => {

                        },
                        rejected: (msg) => {

                        }
                    })
                }

                this.comments[args.index] = comment;

                this.setState({
                    index: args.index
                })
            }
        }
    }

	render () {
        const {loaded, isCollect, collectNum} = this.state;
        if (!loaded) return null;

		return (
			<View className={'news container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <View className={'p_40 bg_white'}>
                            <Image src={this.news.articleImg} className={'thumb bg_light circle_10'}  mode={'aspectFill'}/>
                            <Text className={'row label_16 mt_10'}>{this.news.title}</Text>
                            <Text className={'row mt_30 label_light label_12'}>{this.news.comment}评论 · {this.news.pubTimeFt}</Text>
                            <View className={'mt_30 taro_html html'} dangerouslySetInnerHTML={{__html: tool.formatHtml(this.news.content)}}></View>

                            <View className={'mt_30'}>
                                <Text className={'label_16'}>相关推荐</Text>
                                {this.recomms.map((news, index) => {
                                    return (
                                        <NewsCell ttype={news.ttype} className={'mt_30 border_bottom pb_10'} news={news} onClick={() => {
                                            Taro.navigateTo({
                                                url: '/v2/pages/news/news?articleId=' + news.articleId
                                            })
                                        }}/>
                                    )
                                })}
                            </View>
                            
                        </View>
                        <View className={'p_40 bg_white mt_10'}>
							<RecommComment comments={this.comments} onPraise={(index) => this.onAction('Praise', {index: index})}/>
						</View>
                        <View className={'row col p_15 ai_ct bg_white border_light'}  onClick={() => {
							Taro.navigateTo({
								url: '/v2/pages/base/comment/comment?ctype=11&content_id=' + this.articleId,
							})
						}}>
							<Text className={'label_12 label_gray'}>查看全部评论</Text>
						</View>
                    </ScrollView>
                </View>
                <View className={'row ai_ct p_5 bg_white top_light safe'}>
                    <Button size={'mini'} className={'col_5 label_gray'} onClick={()=> this.onAction('PublishComment')}>写留言，发表看法</Button>
                    <View className={'col_1 row  col ai_ct'} onClick={() => this.onAction('Collect')}>
                        <View className={'pr'}>
                            <IconFont name={isCollect ? 'aixin1' : 'aixin'} color={isCollect ? 'red' : '#999999'} size={40}/>
                            <View className={'count bg_blue row col ai_ct jc_ct'}>
                                <Text className={'label_9 label_white'}>{collectNum > 99 ? '99+' : collectNum}</Text>
                            </View>
                        </View>
					</View>
                </View>
			</View>
		)
	}
}

const LayoutComponent = News;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        news: state.news.news,
        comment: state.news.comment,
        relation: state.news.relation,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})