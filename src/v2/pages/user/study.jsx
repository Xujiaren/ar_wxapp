import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Text } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../../util/connect'
import StudyCell from '../../../components/study/study'

import './user.less'

class Study extends Component {

    state = {
        refresh: false,
        ctype: 0
    }

    tab = ['在学资源', '已学资源']
    page = 0
    pages = 1
    total = 0
    items = []

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {study} = nextProps;

        if (study !== this.props.study) {
            this.pages = study.pages;
            this.total = study.total;
            this.items = this.items.concat(study.items);
        }

        this.setState({
            refresh: false
        })
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        const {ctype} = this.state;

        this.page = 0;
        this.pages = 1;
        this.total = 0;
        this.items = [];

        actions.user.study(ctype, 0);

        this.setState({
            refresh: true
        })
    }

    onFooterRefresh = () => {
        const {actions} = this.props;
        const {ctype} = this.state;

        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.user.study(ctype, this.page);
        }
    }

	render () {
        const {refresh, ctype} = this.state

		return (
			<View className={'study container row col'}>
                <View className={'row ai_ct jc_ad pt_10 nowrap'}>
                {this.tab.map((tab, cindex) => {
                    return (
                        <View className={classNames('row col ai_ct', 'pl_15 pr_15', 'label_light', {'label_gray' : ctype == cindex})} onClick={() => {
                            this.setState({
                                ctype: cindex
                            }, () => {
                                this.onHeaderRefresh()
                            })
                        }}>
                            <Text>{tab}</Text>
                            <View className={classNames('dot circle_10 mt_5', {'bg_blue': ctype == cindex})}/>
                        </View>
                    )
                })}
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
                            {this.items.map((course, index) => {

                                let page = 'vod';

                                if (course.ctype == 1) {
                                    page = 'audio';
                                } else if (course.ctype == 3) {
                                    page = 'article';
                                }

                                return (
                                    <StudyCell className={'mb_30'} course={course} progress={ctype == 0 ? 0 : 100} onClick={() => {
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


const LayoutComponent = Study;

function mapStateToProps(state) {
	return {
		study: state.user.study,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})