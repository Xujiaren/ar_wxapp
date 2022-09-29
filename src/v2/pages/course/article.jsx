import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Swiper, SwiperItem, Button, Image, Text } from '@tarojs/components'
import classNames from 'classnames'
import IconFont from '../../../components/iconfont'
import connectComponent from '../../../util/connect'
import RecommComment from '../../../components/comment/recomm'
import Gift from '../../../components/base/gift'
import ArticleCell from '../../../components/course/article'
import * as tool from '../../../util/tool'
import './course.less'
import '@tarojs/taro/html5.css'

class Article extends Component {

    state = {
        loaded: false,

        user_integral: 0,
        collectNum: 0,
        collect: false,
        currentPage: 0,

        like: false,
        likeNum: 0,
        canReward: true,
    }

    levelId = 0
    fromuid = getCurrentInstance().router.params.fromuid || 0
    courseId = getCurrentInstance().router.params.courseId || 0
    comments = []
    gift = []
    related = []
    coursewareList = []
    ts = null
    sync = 0

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

    componentWillUnmount() {
        this.ts && clearInterval(this.ts)
    }

    componentWillReceiveProps(nextProps) {
        const { user, course, comment, gift, related } = nextProps;

        if (user !== this.props.user) {
            this.setState({
                user_integral: user.integral,
            })

            global.uid = user.userId;
        }

        if (course !== this.props.course) {
            this.course = course;
            this.coursewareList = course.coursewareList;

            Taro.setNavigationBarTitle({
                title: this.course.courseName,
            })

            this.setState({
                loaded: true,
                collectNum: course.collectNum,
                collect: course.collect,
                like: course.like,
                likeNum: course.likeNum,
                canReward: course.canReward == 1,
            }, () => {

                if (course.canShare == 0) {
                    Taro.hideShareMenu()
                }

                this.ts = setInterval(() => {
                    this.onSync()
                }, 1000)
            })
        }
        if (related !== this.props.related) {
            this.related = related
        }
        if (comment !== this.props.comment) {
            this.comments = comment.items;
        }

        if (gift !== this.props.gift) {
            this.gift = gift;
        }
    }

    onShareAppMessage = (res) => {
        const { actions } = this.props;
        actions.user.shareVod({ course_id: this.courseId })
        return {
            title: this.course.courseName,
            path: '/v2/pages/course/article?courseId=' + this.courseId + '&fromuid=' + global.uid + '&utype=' + global.utype,
            imageUrl: this.course.courseImg + '?x-oss-process=image/resize,w_500,h_380,m_pad'
        }

    }

    onHeaderRefresh = () => {
        const { actions } = this.props;
        actions.user.user();
        actions.course.info(this.courseId);
        actions.course.comment(this.courseId, 2, 0);
        actions.config.gift(0);
        actions.course.getRelated(4, this.courseId);
    }

    onAction = (action, args) => {
        const { actions, user } = this.props;
        const { collect, collectNum, like, likeNum } = this.state;

        if (!user.userId) {
            Taro.navigateTo({
                url: '/pages/user/passport'
            })
        } else {
            if (action == 'Gift') {
                this.refs.gift.show()
            } else if (action == 'Reward') {
                const gift_id = args.gift_id;

                actions.user.reward({
                    gift_id: gift_id,
                    course_id: this.course.courseId,
                    resolved: (data) => {

                        actions.user.user();

                        Taro.showToast({
                            title: '打赏成功',
                            icon: 'success'
                        })
                    },
                    rejected: (res) => {

                    },
                })

            } else if (action == 'Collect') {

                if (collect) {
                    actions.user.uncollect({
                        ctype: 3,
                        content_id: this.course.courseId,
                        resolved: (data) => {
                            this.setState({
                                collect: false,
                                collectNum: collectNum - 1,
                            })
                        },
                        rejected: (msg) => {

                        }
                    })

                } else {
                    actions.user.collect({
                        ctype: 3,
                        content_id: this.course.courseId,
                        resolved: (data) => {
                            this.setState({
                                collect: true,
                                collectNum: collectNum + 1,
                            })
                        },
                        rejected: (msg) => {

                        }
                    })
                }

            } else if (action == 'Like') {

                if (like) {
                    actions.user.unlikeCourse({
                        course_id: this.course.courseId,
                        resolved: (data) => {
                            this.setState({
                                like: false,
                                likeNum: likeNum - 1,
                            })
                        },
                        rejected: (msg) => {

                        }
                    })
                } else {
                    actions.user.likeCourse({
                        course_id: this.course.courseId,
                        resolved: (data) => {
                            this.setState({
                                like: true,
                                likeNum: likeNum + 1,
                            })
                        },
                        rejected: (msg) => {

                        }
                    })
                }

            } else if (action == 'PublishComment') {

                Taro.navigateTo({
                    url: '/v2/pages/base/comment/publish?ctype=3&content_id=' + this.courseId,
                })

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

    onSync = () => {
        const { actions, user } = this.props;

        this.sync++;
        if (user.userId) {
            actions.user.studySync({
                levelId: this.levelId,
                course_id: this.courseId,
                chapter_id: 0,
                cchapter_id: 0,
                duration: this.sync,
                resolved: (data) => {

                },
                rejected: (res) => {

                },
            })
        }
    }

    render() {
        const { loaded, canReward, user_integral, like, likeNum, collect, collectNum, currentPage } = this.state;
        if (!loaded) return null;

        return (
            <View className='article container row col bg_light'>
                <View className={'col_1 h_100'}>
                    <ScrollView
                        scrollY
                        className={'h_full'}
                    >
                        <View className={'p_40 bg_white'}>
                            <Image src={this.course.courseImg} className={'thumb bg_light circle_10'} mode={'aspectFill'} />
                            <Text className={'label_16 mt_10 row'}>{this.course.courseName}</Text>
                            <View className={'row ai_ct jc_sb mt_30'}>
                                <View className={'row ai_ct'}>
                                    {this.course.teacherId > 0 ?
                                        <Image src={this.course.teacher.teacherImg} className={'teacher_avatar bg_light mr_10'} mode={'aspectFill'} />
                                        : null}
                                    <Text className={'label_12'}>{this.course.teacherName} <Text className={'label_light label_12'}>{this.course.pubTimeFt}</Text></Text>
                                </View>
                                <View className={'row ai_ct'} onClick={() => this.onAction('Like')}>
                                    <IconFont name={like ? 'dianzan1' : 'dianzan'} color={like ? 'red' : '#999999'} />
                                    <Text className={classNames('label_12 ml_5 ', { 'label_light': !like, 'label_red': like })}>{likeNum}</Text>
                                </View>
                            </View>
                            <View className={'mt_30 taro_html html'} dangerouslySetInnerHTML={{ __html: tool.formatHtml(this.course.content) }}></View>
                        </View>
                        {this.coursewareList.length>0? 
                           <Swiper
                            className={'ware_thumb'}
                            indicatorColor='rgba(255, 255, 255, 0.3)'
                            indicatorActiveColor='white'
                            circular
                            indicatorDots
                            current={currentPage}
                            onChange={(e) => {
                                this.setState({
                                    currentPage: e.detail.current,
                                })
                            }}
                        >
                            {this.coursewareList.map((ware, index) => {
                                return (
                                    <SwiperItem>
                                        <Image src={ware.fpath} className={'ware_thumb'} />
                                    </SwiperItem>
                                )
                            })}
                        </Swiper>:null}
                        {this.related.length > 0 ?
                            <View className='laner bg_white mt_10 p_20'>
                                <View className='row jc_sb ai_ct'>
                                    <Text className='label_16'>关联资源</Text>
                                    <View className='row ai_ct'>
                                        <Text className={'label_light label_14'} onClick={() => {
                                            Taro.navigateTo({ url: '/v2/pages/course/related?courseId=' + this.courseId })
                                        }}>查看全部</Text>
                                        <IconFont name={'right'} color={'#999999'} />
                                    </View>
                                </View>
                                <View className={'row col mt_10'}>
                                    {this.related.map((course, index) => {
                                        if (index < 4) {
                                            return (
                                                <ArticleCell ttype={course.ttype} className={'mb_30 border_bottom pb_10'} course={course} onClick={() => {
                                                    Taro.navigateTo({
                                                        url: '/v2/pages/course/article?courseId=' + course.courseId,
                                                    })
                                                }} />
                                            )
                                        }
                                    })}
                                </View>
                            </View> : null}
                        <View className={'p_40 bg_white mt_10'}>
                            <RecommComment comments={this.comments} onPraise={(index) => this.onAction('Praise', { index: index })} />
                        </View>
                        <View className={'row col p_15 ai_ct bg_white border_light'} onClick={() => {
                            Taro.navigateTo({
                                url: '/v2/pages/base/comment/comment?ctype=3&content_id=' + this.courseId,
                            })
                        }}>
                            <Text className={'label_12 label_gray'}>查看全部评论</Text>
                        </View>
                    </ScrollView>
                </View>
                <View className={'row ai_ct p_5 bg_white top_light safe'}>
                    {canReward ?
                        <View className={'col_1'} onClick={() => this.onAction('Gift')}>
                            <IconFont name={'lihe'} size={40} />
                        </View>
                        : null}
                    <View className={'col_1 row'} onClick={() => this.onAction('Collect')}>
                        <View className={'pr'}>
                            <IconFont name={collect ? 'aixin1' : 'aixin'} color={collect ? 'red' : '#999999'} size={40} />
                            <View className={'count bg_blue row col ai_ct jc_ct'}>
                                <Text className={'label_9 label_white'}>{collectNum > 99 ? '99+' : collectNum}</Text>
                            </View>
                        </View>
                    </View>
                    <Button size={'mini'} className={'col_6 label_gray'} onClick={() => this.onAction('PublishComment')}>写留言，发表看法</Button>
                </View>

                <Gift gift={this.gift} ref={'gift'} integral={user_integral} onSelect={(gift_id) => {
                    this.onAction('Reward', { gift_id: gift_id })
                }} onBuy={() => {
                    Taro.navigateTo({
                        url: '/v2/pages/user/recharge'
                    })
                }} />
            </View>
        )
    }
}

const LayoutComponent = Article;

function mapStateToProps(state) {
    return {
        user: state.user.user,
        course: state.course.course,
        comment: state.course.comment,
        gift: state.config.gift,
        related: state.course.related
    }
}

export default connectComponent({
    mapStateToProps,
    LayoutComponent,
})