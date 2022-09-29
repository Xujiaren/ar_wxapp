import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Slider, Swiper, SwiperItem, Image, Button, Text } from '@tarojs/components'
import classNames from 'classnames'
import IconFont from '../../../components/iconfont'
import connectComponent from '../../../util/connect'

import Rank from '../../../components/base/rank'
import Modal from '../../../components/base/modal'
import Chapter from '../../../components/course/chapter'
import RecommComment from '../../../components/comment/recomm'
import Gift from '../../../components/base/gift'
import VVodCell from '../../../components/course/vvod'
import * as tool from '../../../util/tool'
import './course.less'
import '@tarojs/taro/html5.css'

class Audio extends Component {

    state = {
        loaded: false,
        sv: '',

        index: 0,
        comment_index: 0,
        currentPage: 0,

        cindex: 0,
        ccindex: 0,
        mediaId: '',
        playUrl: '',

        play: false,
        current: 0,
        duration: 0,

        user_integral: 0,

        canReward: true,
        canBuy: true,

        score: false,
        avgScore: 0,
        courseScore: 4,
        teacherScore: 4,
        isScore: false,

        preview: false,
        preview_index: 0,
        preview_imgs: [],

        isFollow: false,

        collectNum: 0,
        collect: false,

        like: false,
        likeNum: 0,

        clist: false,
        showProgress:1,
    }

    am = Taro.getBackgroundAudioManager()
    fromuid = getCurrentInstance().router.params.fromuid || 0
    levelId = getCurrentInstance().router.params.levelId || 0
    courseId = getCurrentInstance().router.params.courseId || 0
    comments = []
    gift = []
    chapters = []
    related = []
    coursewareList = []
    sync = 0

    componentDidMount() {
        this.am.onPlay(() => {
            this.setState({
                play: true
            })
        })

        this.am.onPause(() => {
            this.setState({
                play: false
            })
        })

        this.am.onStop(() => {
            this.setState({
                play: false
            })
        })

        this.am.onEnded(() => {
            this.setState({
                play: false
            })

            this.onNext()
        })

        this.am.onTimeUpdate(() => {
            this.onSync(parseInt(this.am.currentTime))

            this.setState({
                current: this.am.currentTime,
            })
        })
    }

    componentDidShow() {
        this.fromuid = getCurrentInstance().router.params.fromuid || 0
        if (this.fromuid > 0) {
            global.fromuid = this.fromuid
        }
        this.onHeaderRefresh();
    }

    componentWillUnmount() {
        this.am.stop();
    }

    componentWillReceiveProps(nextProps) {
        const { user, course, comment, gift,related } = nextProps;

        if (user !== this.props.user) {
            this.setState({
                user_integral: user.integral,
            })

            global.uid = user.userId;
        }

        if (course !== this.props.course) {
            this.course = course;
            this.chapters = course.chapterList;
            this.coursewareList = course.coursewareList;

            Taro.setNavigationBarTitle({
                title: this.course.courseName,
            })

            this.setState({
                loaded: true,

                canReward: course.canReward == 1,
                canBuy: course.canBuy,
                isScore: course.isScore == 1,

                isFollow: course.teacherId > 0 ? course.teacher.isFollow : false,
                collectNum: course.collectNum,
                collect: course.collect,
                like: course.like,
                likeNum: course.likeNum,
                avgScore: course.score,
                showProgress:course.showProgress,
            });

            if (course.canShare == 0) {
                Taro.hideShareMenu()
            }
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
        actions.user.shareVod({course_id:this.courseId})
        return {
            title: this.course.courseName,
            path: '/v2/pages/course/audio?courseId=' + this.courseId + '&fromuid=' + global.uid + '&utype=' + global.utype,
            imageUrl: this.course.courseImg + '?x-oss-process=image/resize,w_500,h_380,m_pad'
        }

    }

    onHeaderRefresh = () => {
        const { actions } = this.props;

        this.comments = []
        actions.user.user();
        actions.course.info(this.courseId);
        actions.course.comment(this.courseId, 2, 0);
        actions.config.gift(0);
        actions.course.getRelated(4, this.courseId);
    }

    onAction = (action, args) => {
        const { actions, user } = this.props;
        const { isFollow, collect, collectNum, like, likeNum, courseScore, teacherScore, canBuy, play, current } = this.state;

        if (!user.userId) {

            Taro.navigateTo({
                url: '/pages/user/passport'
            })

        } else {
            if (action == 'Ctrl') {
                if (canBuy) {
                    Taro.navigateTo({
                        url: '/v2/pages/course/order?courseId=' + this.courseId,
                    })
                } else {
                    if (current > 0) {
                        if (play) {
                            this.am.pause()
                        } else {
                            this.am.play()
                        }
                    } else {
                        this.onPlay()
                    }
                }

            } else if (action == 'Score') {
                this.setState({
                    score: true,
                })

            } else if (action == 'PubScore') {

                actions.course.score({
                    course_id: this.course.courseId,
                    score: courseScore,
                    teacher_score: teacherScore,
                    resolved: (data) => {
                        Taro.showToast({
                            title: '评分成功',
                            icon: 'success',
                            success: (res) => {
                                actions.course.info(this.courseId);
                            }
                        })

                        this.setState({
                            score: false,
                            isScore: true,
                        })
                    },
                    rejected: (res) => {
                        Taro.showToast({
                            title: '系统错误，请稍后再试。',
                            icon: 'success'
                        })
                    },
                })

            } else if (action == 'Buy') {
                Taro.navigateTo({
                    url: '/v2/pages/course/order?courseId=' + this.courseId,
                })
            } else if (action == 'Gift') {
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

            } else if (action == 'Follow') {

                if (isFollow) {
                    actions.user.unfollowTeacher({
                        teacher_id: this.course.teacherId,
                        resolved: (data) => {
                            this.setState({
                                isFollow: false,
                            });

                        },
                        rejected: (res) => {

                        },
                    });
                } else {
                    actions.user.followTeacher({
                        teacher_id: this.course.teacherId,
                        resolved: (data) => {
                            this.setState({
                                isFollow: true,
                            });

                        },
                        rejected: (res) => {

                        },
                    });
                }

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
                    comment_index: args.index
                })
            }
        }
    }

    onSync = (duration) => {
        const { actions } = this.props;
        const { cindex, ccindex } = this.state;

        if (this.course.chapterList[cindex] && this.course.chapterList[cindex].child[ccindex]) {
            if (this.sync % 16 == 0) {
                actions.user.studySync({
                    levelId: this.levelId,
                    course_id: this.course.courseId,
                    chapter_id: this.course.chapterList[cindex].chapterId,
                    cchapter_id: this.course.chapterList[cindex].child[ccindex].chapterId,
                    duration: duration,
                    resolved: (data) => {
                        if(data){
                            Taro.showToast({
                                title:data,
                                icon:'none',
                                duration:2000,
                            })
                        }
                    },
                    rejected: (res) => {

                    },
                })
            }

            this.sync++;
        }
    }

    onPlay = () => {
        const { actions } = this.props;

        const { canBuy, cindex, ccindex } = this.state;

        if (canBuy) {
            return;
        }

        this.sync = 0;

        if (this.chapters[cindex] && this.chapters[cindex].child[ccindex]) {
            const chapter = this.chapters[cindex].child[ccindex];

            if (chapter.coursewarePageStart > 0) {
                this.setState({
                    currentPage: chapter.coursewarePageStart,
                })
            }

            actions.course.verify({
                media_id: chapter.mediaId,
                resolved: (data) => {
                    this.setState({
                        mediaId: chapter.mediaId,
                        duration: data.duration,
                        playUrl: data.m38u,
                    }, () => {
                        this.am.stop()
                        this.am.title = chapter.chapterName
                        this.am.epname = chapter.chapterName
                        this.am.singer = this.course.teacherName
                        this.am.src = data.m38u
                        this.am.play()
                    })
                },
                rejected: (res) => {

                },
            })
        }
    }

    onPrev = () => {
        let cindex = this.state.cindex;
        let ccindex = this.state.ccindex;

        if (ccindex > 0) {
            ccindex--;
        } else if (cindex > 0) {
            cindex--;
            const chapter = this.chapters[cindex];
            ccindex = chapter.child.length - 1;
        }

        this.setState({
            cindex: cindex,
            ccindex: ccindex,
        }, () => {
            this.onPlay()
        })
    }

    onNext = () => {
        const { actions } = this.props;

        let cindex = this.state.cindex;
        let ccindex = this.state.ccindex;

        const chapter = this.chapters[cindex];

        if (ccindex < chapter.child.length - 1) {
            ccindex++;
        } else if (cindex < this.chapters.length - 1) {
            cindex++;
            ccindex = 0;
        } else {
            cindex = 0;
            ccindex = 0;
        }

        this.setState({
            cindex: cindex,
            ccindex: ccindex,
        }, () => {
            if (ccindex === 0 && cindex === 0) {

                if (this.levelId > 0) {
                    actions.course.levelStatus({
                        level_id: this.levelId,
                        resolved: (data) => {
                            if (data.finishStatus == 1) {
                                Taro.showModal({
                                    title: '学习地图',
                                    content: '恭喜您完成学习',
                                    success: function (res) {
                                        if (res.confirm) {
                                            Taro.navigateBack()
                                        }
                                    }
                                })
                            }
                        },
                        rejected: (res) => {

                        },
                    })
                }
            } else {
                this.onPlay();
            }
        })
    }

    render() {
        const { loaded, sv, cindex, ccindex, play, current, duration, playUrl, canReward, canBuy, isScore, index, currentPage, clist, user_integral, collect, collectNum, likeNum, like, isFollow, score, avgScore, courseScore, teacherScore,showProgress } = this.state;
        if (!loaded) return null;

        return (
            <View className='audio container row col bg_light'>
                <View className={'bg_white'}>
                    <View className={'player p_40'}>
                        <View className={'row col ai_ct'}>
                            <Image src={this.course.courseImg} className={'thumb bg_light'} mode={'heightFix'} />
                        </View>
                        {showProgress?
                            <View className={'row ai_ct'}>
                            <Slider className={'col_1'} value={current} disabled={showProgress==0?true:false} min={0} max={duration} backgroundColor={'#00B8F8'} activeColor={'#00A6F6'} blockColor={'#00A6F6'} blockSize={12} onChange={(e) => {
                                this.setState({
                                    current: e.detail.value
                                }, () => {
                                    this.am.seek(e.detail.value)
                                })
                            }} />
                            <Text className={'label_12 label_light row mr_5'}>{tool.formatSTime(current)}/{tool.formatSTime(duration)}</Text>
                        </View>:null}
                        <View className={'row ai_ct mt_30'}>
                            <View className={'col_1'}></View>
                            <View className={'col_5 row ai_ct jc_ad'}>
                                <View onClick={this.onPrev}>
                                    <IconFont name={'shangyishou'} size={36} />
                                </View>
                                <View onClick={() => this.onAction('Ctrl')}>
                                    <IconFont name={play ? 'zanting' : 'bofang'} size={68} />
                                </View>
                                <View onClick={this.onNext}>
                                    <IconFont name={'xiayishou'} size={36} />
                                </View>
                            </View>
                            <View className={'col_1'} onClick={() => {
                                this.setState({
                                    clist: true,
                                })
                            }}>
                                <IconFont name={'bofangliebiao'} size={36} color={'#999999'} />
                            </View>
                        </View>
                    </View>
                    <View className={'row ai_ct jc_ad pt_10 bg_white bottom_light'}>
                        <View className={'row col ai_ct'} onClick={() => {
                            this.setState({
                                index: 0
                            })
                        }}>
                            <Text className={classNames({ 'label_light': index != 0 })}>简介</Text>
                            <View className={classNames('dot mt_5', { 'bg_blue': index == 0 })} />
                        </View>
                        <View className={'row col ai_ct'} onClick={() => {
                            this.setState({
                                index: 1
                            })
                        }}>
                            <Text className={classNames({ 'label_light': index != 1 })}>资料</Text>
                            <View className={classNames('dot mt_5', { 'bg_blue': index == 1 })} />
                        </View>
                        <View className={'row col ai_ct'} onClick={() => {
                            this.setState({
                                index: 2,
                                sv: 'comment',
                            })
                        }}>
                            <Text className={classNames({ 'label_light': index != 2 })}>评论({this.course.comment})</Text>
                            <View className={classNames('dot mt_5', { 'bg_blue': index == 2 })} />
                        </View>
                    </View>
                </View>
                <View className={'col_1 h_100'}>
                    {index == 0 || index == 2 ?
                        <ScrollView
                            scrollY
                            className={'h_full'}
                            scrollIntoView={sv}
                        >
                            <View className={'p_40 bg_white'}>
                                <Text className={'label_16'}>{this.course.courseName}</Text>

                                <View className={'row ai_ct jc_sb mt_10'}>
                                    <View>
                                        <Rank value={parseInt(avgScore)} label={'综合评分' + parseFloat(avgScore).toFixed(1)} />
                                        <Text className={'label_12 label_light'}>共{this.course.chapter}讲 {this.course.learn}人已学</Text>
                                    </View>
                                    <View className={'row ai_ct'}>
                                        <View onClick={() => this.onAction('Like')} className={'row ai_ct'}>
                                            <IconFont name={like ? 'dianzan1' : 'dianzan'} color={like ? 'red' : '#999999'} />
                                            <Text className={'label_12 label_light ml_5'}>{likeNum}</Text>
                                        </View>
                                        {!isScore ?
                                            <Button size={'mini'} className={'p_5 label_blue ml_10'} onClick={(e) => {
                                                this.onAction('Score')
                                            }}>评分</Button>
                                            : null}
                                    </View>
                                </View>

                                {this.course.teacherId > 0 ?
                                    <View className={'bg_light mt_10 p_15'}>
                                        <View className={'row ai_ct jc_sb mb_30'}>
                                            <View className={'row ai_ct'}>
                                                <Image src={this.course.teacher.teacherImg} className={'teacher_avatar bg_light'} mode={'aspectFill'} />
                                                <Text className={'ml_10'}>{this.course.teacherName} {this.course.teacher.honor}</Text>
                                                <Button size={'mini'} className={'bg_white label_12 label_blue ml_10'} onClick={() => this.onAction('Follow')}>{isFollow ? '已关注' : '+ 关注'}</Button>
                                            </View>
                                            <View className={'row ai_ct'} onClick={() => {
                                                Taro.navigateTo({
                                                    url: '/v2/pages/teacher/teacher?teacherId=' + this.course.teacherId
                                                })
                                            }}>
                                                <Text className={'label_light'}>全部资源</Text>
                                                <IconFont name={'right'} color={'#999999'} />
                                            </View>
                                        </View>
                                        <Text className={'label_gray'}>{this.course.teacher.content}</Text>
                                    </View>
                                    : null}

                                <View className={'mt_30'}>
                                    <Text className={'label_16'}>要点介绍</Text>
                                </View>
                                <View className={'mt_30 taro_html'} dangerouslySetInnerHTML={{ __html: this.course.content }}></View>

                                <Chapter className={'mt_30'} items={this.chapters} cindex={cindex} ccindex={ccindex} onSelected={(cindex, ccindex) => {
                                    this.setState({
                                        cindex: cindex,
                                        ccindex: ccindex,
                                    }, () => {
                                        this.onPlay()
                                    })
                                }} />
                            </View>
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
                                    <View className={'row wrap mt_10'}>
                                        {this.related.map((course, index) => {
                                            if (index < 4) {
                                                return (
                                                    <VVodCell className={'item mt_10'} course={course} onClick={() => {
                                                        Taro.navigateTo({
                                                            url: '/v2/pages/course/audio?courseId=' + course.courseId,
                                                        })
                                                    }} />
                                                )
                                            }
                                        })}
                                    </View>
                                </View> : null}
                            <View className={'p_40 bg_white mt_10'} id={'comment'}>
                                <RecommComment comments={this.comments} onPraise={(index) => this.onAction('Praise', { index: index })} />
                            </View>
                            <View className={'row col p_15 ai_ct bg_white border_light'} onClick={() => {
                                Taro.navigateTo({
                                    url: '/v2/pages/base/comment/comment?ctype=3&content_id=' + this.courseId,
                                })
                            }}>
                                <Text className={'label_12 label_gray'}>查看全部评论</Text>
                            </View>
                        </ScrollView> :
                        <View className={'h_full row col jc_ct'}>
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
                            </Swiper>
                        </View>}
                </View>
                <View className={'row ai_ct p_5 bg_white top_light safe'}>
                    {canReward ?
                        <View className={'col_1'} onClick={() => this.onAction('Gift')}>
                            <IconFont name={'lihe'} size={40} />
                        </View>
                        : null}
                    <View className={'col_1'} onClick={() => this.onAction('PublishComment')}>
                        <IconFont name={'xiaoxi'} size={40} />
                    </View>
                    <View className={'col_1 row'} onClick={() => this.onAction('Collect')}>
                        <View className={'pr'}>
                            <IconFont name={collect ? 'aixin1' : 'aixin'} color={collect ? 'red' : '#999999'} size={40} />
                            <View className={'count bg_blue row col ai_ct jc_ct'}>
                                <Text className={'label_9 label_white'}>{collectNum > 99 ? '99+' : collectNum}</Text>
                            </View>
                        </View>
                    </View>
                    {canBuy ?
                        <Button size={'mini'} className={'bg_blue col_6 label_white'} onClick={() => this.onAction('Buy')}>购买资源</Button>
                        :
                        <Button size={'mini'} className={'bg_blue col_6 label_white'} onClick={this.onPlay}>开始学习</Button>
                    }
                </View>
                <Modal visible={score}>
                    <View className={'modal'} onClick={() => {
                        this.setState({
                            score: false,
                        })
                    }} />
                    <View className={'score bg_white pt_15'}>
                        <View className={'p_15 row col ai_ct border_bottom'}>
                            <View className={'row ai_ct p_10'}>
                                <Text className={'row mr_10'}>资源评分</Text>
                                <Rank value={courseScore} onChoose={(value) => {
                                    this.setState({
                                        courseScore: value,
                                    })
                                }} />
                            </View>
                            <View className={'row ai_ct p_10'}>
                                <Text className={'row mr_10'}>老师评分</Text>
                                <Rank value={teacherScore} onChoose={(value) => {
                                    this.setState({
                                        teacherScore: value,
                                    })
                                }} />
                            </View>
                        </View>
                        <View className={'row ai_ct p_10'}>
                            <Button size={'mini'} className={'col_1'} onClick={() => {
                                this.setState({
                                    score: false,
                                })
                            }}>取消</Button>
                            <Button size={'mini'} className={'col_1 ml_10 bg_blue label_white'} onClick={() => this.onAction('PubScore')}>提交</Button>
                        </View>
                    </View>
                </Modal>
                <Gift gift={this.gift} ref={'gift'} integral={user_integral} onSelect={(gift_id) => {
                    this.onAction('Reward', { gift_id: gift_id })
                }} onBuy={() => {
                    Taro.navigateTo({
                        url: '/v2/pages/user/recharge'
                    })
                }} />
                <Modal visible={clist}>
                    <View className={'modal'} onClick={() => {
                        this.setState({
                            clist: false,
                        })
                    }} />
                    <View className={'clist bg_white'}>
                        <View className={'p_10 bottom_light'}>
                            <Text>播放列表({this.course.chapter})</Text>
                        </View>
                        <View className={'p_10'}>
                            {this.chapters.map((chapter, ci) => {
                                return chapter.child.map((cchapter, cci) => {
                                    const on = ci == cindex && cci == ccindex;
                                    return (
                                        <View className={'pt_10 pb_10 bottom_light'} onClick={() => {
                                            this.setState({
                                                cindex: ci,
                                                ccindex: cci,
                                                clist: false,
                                            }, () => {
                                                this.onPlay()
                                            })
                                        }}>
                                            <Text className={classNames('label_14', { 'label_blue': on })}>{ci + 1}-{cci + 1} {cchapter.chapterName}</Text>
                                            <Text className={'label_12 label_gray mt_10 row'}>{tool.forTime(cchapter.duration)} {cchapter.content}</Text>
                                        </View>
                                    )
                                })
                            })}
                        </View>
                        <View className={'row p_10 bottom_light'} onClick={() => this.setState({
                            clist: false,
                        })}>
                            <Button size={'mini'} className={'col_1'}>关闭</Button>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

const LayoutComponent = Audio;

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