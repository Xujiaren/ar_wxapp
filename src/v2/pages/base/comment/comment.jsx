import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, ScrollView, Button, Text } from '@tarojs/components'
import classNames from 'classnames'

import connectComponent from '../../../../util/connect'
import CommentCell from '../../../../components/comment/cell'
import './comment.less'

class Comment extends Component {

	state = {
		refresh: false,
		index: 0,
        sort: 0
    }

	ctype = getCurrentInstance().router.params.ctype || 0
	content_id = getCurrentInstance().router.params.content_id || 0
    category = ['最新', '最热']
	comments = []
	total = 0
    page = 1
    pages = 1

	componentDidShow() {
		this.onHeaderRefresh();
	}

	componentWillReceiveProps(nextProps) {
        const {comment, course_comment, news_comment} = nextProps;

        if (comment !== this.props.comment) {
            this.pages = comment.pages;
            this.total = comment.total;
            this.comments = this.comments.concat(comment.items);
        }

        if (course_comment !== this.props.course_comment){
            this.pages = course_comment.pages;
            this.total = course_comment.total;
            this.comments = this.comments.concat(course_comment.items);
        }

        if (news_comment !== this.props.news_comment) {
            this.pages = news_comment.pages;
            this.total = news_comment.total;
            this.comments = this.comments.concat(news_comment.items);
        }

		this.setState({
			refresh: false,
		})
    }

	onHeaderRefresh = () => {

		const {actions} = this.props;
        const {sort} = this.state;

        actions.user.user();
        
        this.comments = [];
        this.total = 0;
		this.page = 1;
        this.pages = 1;
        
        if (this.ctype == 3) {
            actions.course.comment(this.content_id, sort, this.page);
        } else if (this.ctype == 11) {
            actions.news.comment(this.content_id, sort, this.page);
        } else {
            actions.site.comment(this.content_id, this.ctype, sort, this.page);
        }

		this.setState({
			refresh: true,
		})
	}

	onFooterRefresh = () => {
		const {actions} = this.props;
        const {sort} = this.state;

		if (this.page < this.pages) {
            this.page++;

			if (this.ctype == 3) {
                actions.course.comment(this.content_id, sort, this.page);
            } else if (this.ctype == 11 || this.ctype == 15) {
                actions.news.comment(this.content_id, sort, this.page);
            } else {
                actions.site.comment(this.content_id, this.ctype, sort, this.page);
            }
		}
	}

	onAction = (action, args) => {
		const {actions, user} = this.props;

        if (!user.userId) {
            
			Taro.navigateTo({
				url: '/pages/user/passport'
			})

        } else if (action == 'PublishComment') {

			Taro.navigateTo({
				url: '/v2/pages/base/comment/publish?ctype=' + this.ctype + '&content_id=' + this.content_id,
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

	render () {
		const {refresh, sort} = this.state

		return (
			<View className='comment container row col'>
				<View className={'row pt_10 nowrap'}>
                {this.category.map((category, cindex) => {
                    return (
                        <View className={classNames('col_1 row col ai_ct', 'pl_15 pr_15', 'label_light', {'label_gray' : sort == cindex})} onClick={() => {
							this.setState({
								sort: cindex,
							}, () => {
								this.onHeaderRefresh()
							})
						}}>
                            <Text>{category}</Text>
                            <View className={classNames('dot circle_10 mt_5', {'bg_blue': sort == cindex})}/>
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
                            {this.comments.map((comment, index) => {
								return (
                                    <CommentCell comment={comment} onPraise={() => this.onAction('Praise', {index: index})}/>
                                )
							})}
						</View>
					</ScrollView>
				</View>
				<View className={'row ai_ct p_10 bg_white top_light'}>
                    <Button size={'mini'} className={'col_1 label_gray'} onClick={() => this.onAction('PublishComment')}>写留言，发表看法</Button>
                </View>
			</View>
		)
	}
}

const LayoutComponent = Comment;

function mapStateToProps(state) {
	return {
		user: state.user.user,
        comment: state.site.comment,
        course_comment: state.course.comment,
        news_comment: state.news.comment,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})