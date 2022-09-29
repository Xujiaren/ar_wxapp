import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, ScrollView, Swiper, SwiperItem, Image, Button, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import NewsCell from '../../../components/news'
import VodCell from '../../../components/course/vod'
import Rank from '../../../components/base/rank'
import './teacher.less'

class Teacher extends Component {

    state = {
        loaded: false,
        isFollow: false,
    }

    teacherId = getCurrentInstance().router.params.teacherId || 0
    teacher = {}
    gallery = []
	news = []
    recomm = []

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {info} = nextProps;

        if (info !== this.props.info) {
            this.teacher = info.teacher;
            this.recomm = info.course;
            this.gallery = this.teacher.galleryList;
            this.news = info.article ? info.article.items : [];

            this.setState({
                loaded: true,
                isFollow: this.teacher.isFollow,
            })
        }
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        actions.teacher.info(this.teacherId);
    }

    onFollow = () => {
        const {actions, user} = this.props;
        const {isFollow} = this.state;


        if (!user.userId) {
            Taro.navigateTo({
                url: '/pages/user/passport'
            })
        } else {
            if (isFollow) {
                actions.user.unfollowTeacher({
                    teacher_id: this.teacher.teacherId,
                    resolved: (data) => {
                        Taro.showToast({
                            title: '取消关注',
                            icon: 'none'
                        })
    
                        this.setState({
                            isFollow: false,
                        });
        
                    },
                    rejected: (res) => {
                        
                    },
                });
    
            } else {

                actions.user.followTeacher({
                    teacher_id: this.teacher.teacherId,
                    resolved: (data) => {
                        Taro.showToast({
                            title: '关注成功',
                            icon: 'success'
                        })
    
                        this.setState({
                            isFollow: true,
                        });
        
                    },
                    rejected: (res) => {
                        
                    },
                });
            }
        }
    }

	render () {
        const {isFollow} = this.state;

		return (
			<View className={'teacher container row col bg_light'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}
					>
                        <Swiper 
                            className={'gallery'}
                            indicatorColor='rgba(255, 255, 255, 0.3)'
                            indicatorActiveColor='white'
                            circular
                            indicatorDots
                            autoplay
                        >
                            {this.gallery.map((g, index) => {
                                return (
                                    <SwiperItem>
                                        <Image src={g.fpath} className={'gallery bg_light'} mode={'aspectFill'}/>
                                    </SwiperItem>
                                )
                            })}
                        </Swiper>
						<View className={'p_40 bg_white'}>
                            <View className={'row ai_ct jc_sb'}>
                                <Text className={'label_16'}>{this.teacher.teacherName}</Text>
                                <Button className={'label_blue mr_0'} size={'mini'} onClick={this.onFollow}>{isFollow ? '取消关注' : '+ 关注'}</Button>
                            </View>
                            <Rank value={parseInt(this.teacher.score)} label={parseFloat(this.teacher.score).toFixed(1)}/>
                            <Text className={'row mt_10'}>{this.teacher.content}</Text>
						</View>
                        {this.news.length > 0 ?
                        <View className={'p_40 bg_white mt_30'}>
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
                        : null}
                        <View className={'p_40 bg_white mt_30'}>
                            {this.recomm.map((course, index) => {
								return (
                                    <VodCell className={'mb_30'} course={course} onClick={() => {
                                        let page = 'vod'
                                        if (course.ctype == 1) {
                                            page = 'audio'
                                        } else if (course.ctype == 3) {
                                            page = 'article'
                                        }

                                        Taro.navigateTo({
                                            url: '/v2/pages/course/' + page + '?courseId=' + course.courseId,
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

const LayoutComponent = Teacher;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        info: state.teacher.info,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})