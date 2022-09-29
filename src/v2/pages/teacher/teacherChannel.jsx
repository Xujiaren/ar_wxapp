import React, { Component } from 'react'
import { View, ScrollView, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import connectComponent from '../../../util/connect'
import TeacherCell from '../../../components/teacher/teacher'
import './teacher.less'

class TeacherChannel extends Component {

	state = {
		refresh: false,
	}

	total = 0
	page = 0
	pages = 1
	items = []

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {index} = nextProps;

        if (index !== this.props.index) {
            this.items = this.items.concat(index.items);
            this.total = index.total;
            this.pages = index.pages;
            this.page = index.page;
        }

        this.setState({
			refresh: false,
		})
    }

	onHeaderRefresh = () => {
		const {actions} = this.props;

        this.page = 0;
        this.pages = 1;
        this.total = 0;
        this.items = [];

        actions.teacher.index(0);

		this.setState({
			refresh: true,
		})
	}

	onFooterRefresh = () => {
		const {actions} = this.props;
        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.teacher.index(this.page);
        }
	}

	onFollow = (index) => {
		const {actions, user} = this.props;

        if (!user.userId) {
            Taro.navigateTo({
                url: '/pages/user/passport'
            })
        } else {
            let teacher = this.items[index];

            if (teacher.isFollow) {
                teacher.isFollow = false;
                actions.user.unfollowTeacher({
                    teacher_id: teacher.teacherId,
                    resolved: (data) => {
						Taro.showToast({
                            title: '取消关注',
                            icon: 'none'
                        })
                    },
                    rejected: (res) => {
                        
                    },
                });

            } else {
                teacher.isFollow = true;
                actions.user.followTeacher({
                    teacher_id: teacher.teacherId,
                    resolved: (data) => {
						Taro.showToast({
                            title: '关注成功',
                            icon: 'none'
                        })
                    },
                    rejected: (res) => {
                        
                    },
                });
            }

            this.items[index] = teacher;

            this.setState({
                index: index
            })
        }
	}

	render () {
		const {refresh} = this.state;

		return (
			<View className={'teacher container row col'}>
				<View className={'col_1 h_100'}>
					<ScrollView
						scrollY 
						className={'h_full'}

						refresherEnabled={true}
						refresherTriggered={refresh}

						onScrollToLower={(e) => {
							this.onFooterRefresh()
						}}

						onRefresherRefresh={(e) => {
							this.onHeaderRefresh()
						}}
					>
						<View className={'p_40 bg_white'}>
                        {this.items.map((teacher, index) => {
                            return (
                                <TeacherCell className={'mb_30'} teacher={teacher} onFollow={()=> this.onFollow(index)} onClick={() => {
									Taro.navigateTo({
										url: '/v2/pages/teacher/teacher?teacherId=' + teacher.teacherId,
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

const LayoutComponent = TeacherChannel;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        index: state.teacher.index,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})