import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Input, Text } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import IconFont from '../../../components/iconfont'
import TeacherCell from '../../../components/teacher/teacher'
import VodCell from '../../../components/course/vod'
import NewsCell from '../../../components/news/index'
import ArticleCell from '../../../components/course/article'
import './search.less'

class Search extends Component {

    state = {
        placeholder: '',
        keyword: '',
        search: false,
    }

	keyword = []
    hot = []

    teachers = []
    vods = []
    aods = []
    cods = []
    articles = []

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {config, history, search} = nextProps;

        if (config !== this.props.config && config.search_hot) {
            this.hot = config.search_hot.split('|');
            this.setState({
                placeholder: config.search_def,
            })
        }

        if (history !== this.props.history) {
            this.keyword = history;
        }

        if (search !== this.props.search) {
            this.teachers = search.teacher.items;
            this.vods = search.vcourse.items;
            this.aods = search.acourse.items;
            this.cods = search.audiocourse.items;
            this.articles = search.article.items;
        }
    }

    onHeaderRefresh = () => {
		const {actions} = this.props;
		actions.config.config();
        actions.site.history();
	}

    onSearch = () => {
        const {actions} = this.props;
        const {placeholder} = this.state;

        let keyword = this.state.keyword;

        if (keyword == '') {
            keyword = placeholder;
        }

        this.teachers = [];
        this.vods = [];
        this.articles = [];

        this.setState({
            keyword: keyword,
            search: true,
        })

        actions.site.search(keyword);
    }

    onClear = (index) => {
        const {actions} = this.props;

        actions.site.clearHistory({
            index: index,
            resolved: (data) => {
                actions.site.history()
            },
            rejected: (msg) => {
                
            }
        })
    }

    onClearAll = () => {
        const {actions} = this.props;

        actions.site.clearAllHistory({
            resolved: (data) => {
                actions.site.history();
            },
            rejected: (msg) => {
                
            }
        })
    }

	render () {
        const {placeholder, keyword, search} = this.state;

		return (
			<View className={'search container row col bg_light'}>
                <View className={'bg_white row ai_ct jc_sb p_5 pl_40 pr_40'}>
					<View className={'bg_light circle_10 p_5 search row ai_ct'}>
						<IconFont name={'search'} size={24}/>
						<Input className={'col_1 ml_10'} placeholder={placeholder} value={keyword} onInput={(e) => this.setState({keyword: e.detail.value, search: false})}/>
					</View>
					<View className={'ml_10'} onClick={() => this.onSearch()}>
						<Text>搜索</Text>
					</View>
				</View>
				<View className={'col_1 h_100'}>
                    {search ?
                    <ScrollView
                        scrollY 
                        className={'h_full'}
                        >
                        {this.teachers.length == 0 && this.vods.length == 0 && this.articles.length == 0 ?
                        <View className={'p_40 mt_30 bg_white'}>
                            <Text>暂未找到搜索结果，试试别的关键词吧！</Text>
                        </View>
                        : null}
                        {this.teachers.length > 0 ?
                        <View className={'p_40 mt_30 bg_white'}>
                            <Text>讲师</Text>
                            {this.teachers.map((teacher, index) => {
                                return <TeacherCell teacher={teacher} className={'mt_30'} onClick={() => {
                                    Taro.navigateTo({
                                        url: '/v2/pages/teacher/teacher?teacherId=' + teacher.teacherId,
                                    })
                                }}/>
                            })}
                        </View>
                        : null}

                        {this.vods.length > 0 ?
                        <View className={'p_40 mt_30 bg_white'}>
                            <Text>资源</Text>
                            <View>
                                {this.vods.map((course, index) => {
                                    return <VodCell course={course} className={'mt_30'} onClick={() => {
                                        Taro.navigateTo({
                                            url: '/v2/pages/course/vod?courseId=' + course.courseId,
                                        })
                                    }}/>
                                })}
                            </View>
                            <View className='mt_30'>
                                {this.aods.map((course, index) => {
                                    return <ArticleCell course={course} ttype={course.ttype} className={'mt_30'} onClick={() => {
                                        Taro.navigateTo({
                                            url: '/v2/pages/course/article?courseId=' + course.courseId,
                                        })
                                    }}/>
                                })}
                            </View>
                            <View className='mt_30'>
                                {this.cods.map((course, index) => {
                                    return <VodCell course={course} className={'mt_30'} onClick={() => {
                                        Taro.navigateTo({
                                            url: '/v2/pages/course/audio?courseId=' + course.courseId,
                                        })
                                    }}/>
                                })}
                            </View>
                        </View>
                        : null}
                        {this.articles.length > 0 ?
                        <View className={'p_40 mt_30 bg_white'}>
                            <Text>资讯</Text>
                            {this.articles.map((news, index) => {
                                return <NewsCell ttype={news.ttype} className={'mt_30 border_bottom pb_10'} news={news} onClick={() => {
                                    Taro.navigateTo({
                                        url: '/v2/pages/news/news?articleId=' + news.articleId,
                                    })
                                }}/>
                            })}
                        </View>
                        : null}
                    </ScrollView>

				    :<ScrollView
						scrollY 
						className={'h_full'}
					>
						<View className={'bg_white'}>
                            <View className={'row jc_end p_15'} onClick={this.onClearAll}>
                                <Text className={'label_light'}>清除历史</Text>
                            </View>
                            {this.keyword.map((keyword, index) => {
                                return (
                                    <View className={'row ai_ct jc_sb p_15 bottom_light'} onClick={() => {
                                        this.setState({
                                            keyword: keyword
                                        }, () => {
                                            this.onSearch();
                                        })
                                    }}>
                                        <Text>{keyword}</Text>
                                        <View onClick={() => this.onClear(index)}>
                                            <IconFont name={'guanbi'} color={'#999999'}/>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                        <View className={'p_40 bg_white mt_30'}>
                            <Text className={'label_16'}>热门搜索</Text>
                            <View className={'row wrap mt_30'}>
                                {this.hot.map((hot, index) => {
                                    return (
                                        <View className={'hitem bg_light circle_25 p_5 pl_10 pr_10 mr_10 mb_10'} onClick={() => {
                                            this.setState({
                                                keyword: hot
                                            }, () => {
                                                this.onSearch();
                                            })
                                        }}>
                                            <Text className={'label_12'}>{hot}</Text>  
                                        </View>
                                    )
                                })}
                            </View>
                        </View>
					</ScrollView>}
				</View>
			</View>
		)
	}
}

const LayoutComponent = Search;

function mapStateToProps(state) {
	return {
		config: state.config.config,
        history: state.site.history,
        search: state.site.search,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})