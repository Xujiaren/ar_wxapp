import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, ScrollView, Image, Button, Text } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../../../util/connect'

import './test.less'

const status = ['进行中', '未开始', '已结束'];

class Test extends Component {

    state = {
        refresh: false,
        type: 0
    }

    category = ['待考', '历史考试']

    page = 0
    pages = 0
    total = 0
    items = []

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {paper, must} = nextProps;

        if (paper !== this.props.paper) {
            this.page = paper.page;
            this.pages = paper.pages;
            this.total = paper.total;
            this.items = this.items.concat(paper.items);
        }

        if (must !== this.props.must) {
            this.items = must;
        }

        this.setState({
            refresh: false
        })
    }

    onHeaderRefresh = () => {
        const {actions} = this.props;
        const {type} = this.state;

        this.page = 0;
        this.pages = 0;
        this.total = 0;
        this.items = [];

        if (type == 0) {
            actions.exam.must();
        } else {
            actions.exam.userPaper(1, 0);
        }

        this.setState({
            refresh: true,
        })
    }

    onFooterRefresh = () => {
        const {actions} = this.props;
        const {type} = this.state;

        if (type == 0) {
            actions.exam.must();  
        } else {
            if (this.page < this.pages) {
                this.page = this.page + 1;
                actions.exam.userPaper(1, this.page);
            }
        }
    }

	render () {
        const {refresh, type} = this.state

		return (
			<View className={'test container row col'}>
                <View className={'row pt_10 nowrap'}>
                {this.category.map((category, cindex) => {
                    return (
                        <View className={classNames('col_1 row col ai_ct', 'pl_15 pr_15', 'label_light', {'label_gray' : type == cindex})} onClick={() => {
                            this.setState({
                                type: cindex,
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
                            {this.items.map((paper, index) => {

                                if (type == 0) {
                                    return (
                                        <View className={'item row mb_30'} onClick={() => {
                                            if (paper.astatus == 0) {
                                                Taro.navigateTo({
                                                    url: '/v2/pages/study/paper?paperId=' + paper.paperId
                                                })
                                            }
                                        }}>
                                            <Image src={paper.coverImg} className={'thumb bg_light'}/>
                                            <View className={'col_1 ml_10 row ai_ct jc_sb'}>
                                                <View className={'info row col jc_sb'}>
                                                    <Text>[{status[paper.astatus]}] {paper.paperName} - {paper.paperTitleName}</Text>
                                                    <Text className={'row label_12 label_light'}>{paper.beginTimeFt} - {paper.endTimeFT}</Text>
                                                </View>
                                                <Text></Text>
                                            </View>
                                        </View>
                                    )
                                }

                                if (!paper.paperDTO) return null;

								return (
                                    <View className={'item row mb_30'} onClick={() => {
                                        Taro.navigateTo({
                                            url: '/v2/pages/study/paper?paperId=' + paper.paperId
                                        })
                                    }}>
                                        <Image src={paper.paperDTO.coverImg} className={'thumb bg_light'}/>
                                        <View className={'col_1 ml_10 row ai_ct jc_sb'}>
                                            <View className={'info row col jc_sb'}>
                                                <Text>{paper.paperName} - {paper.paperDTO.paperTitleName}</Text>
                                                <Text className={'row label_12 label_light'}>{paper.paperDTO.pubTimeFt}</Text>
                                            </View>
                                            <Text>{paper.status == 0 ? '未完成' : '成绩 ' + paper.score}</Text>
                                        </View>
                                    </View>
                                )
							})}
						</View>
					</ScrollView>
				</View>
                <View className={'row p_10 bg_white top_light'}>
                    <Button className={'col_1 mr_10'} size={'mini'} onClick={() => {
                        Taro.navigateTo({
                            url: '/v2/pages/user/exam/wrong'
                        })
                    }}>错题集</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Test;

function mapStateToProps(state) {
	return {
		must: state.exam.must,
        paper: state.exam.paper,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})