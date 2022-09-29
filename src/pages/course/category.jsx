import React, { Component } from 'react'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { View, ScrollView, Picker, Text } from '@tarojs/components'
import classNames from 'classnames'
import connectComponent from '../../util/connect'
import IconFont from '../../components/iconfont';
import VodCell from '../../components/course/vod'
import ArticleCell from '../../components/course/article'
import './course.less'

class Category extends Component {

	state = {
		sort: 0,
		ctype: 0,
		cindex: 0,
		ccindex: 0,
		cccindex: 0,
		refresh: false,
	}

	total = 0
	page = 0
	pages = 1
	course = []
	category = []
	sort = ['默认','最新', '最热']
	type = ['全部','视频', '图文' , '音频']
	
	componentDidShow(options) {
		const {actions} = this.props;
		actions.config.categoryCourse();
		this.onHeaderRefresh();
	}
	
	componentWillReceiveProps(nextProps) {
        const {category, index} = nextProps;
        
        if (category !== this.props.category) {
            this.category = category;
        }

        if (index !== this.props.index && index.items) {
            this.course = this.course.concat(index.items);
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
        const {cindex, ccindex, cccindex, ctype, sort} = this.state;

		let _ctype = ctype;
       
		if(ctype==2){
			_ctype = 3;
		}else if(ctype==3){
			_ctype = 1;
		}else if(ctype==1){
			_ctype = 0;
		}else if(ctype==0){
			_ctype = -1;
		}

        this.page = 0;
        this.pages = 1;
        this.course = [];

        let category_id = 0;
        let ccategory_id = 0;
		let internal_category_id = 0;

        if (cindex > 0) {
            category_id = this.category[cindex - 1].categoryId;
            
            if (ccindex > 0) {
                ccategory_id = this.category[cindex - 1].child[ccindex - 1].categoryId;

				if (cccindex > 0) {
                    internal_category_id = this.category[cindex - 1].child[ccindex - 1].child[cccindex - 1].categoryId;
                }
            }
        }
        
		this.setState({
			refresh: true,
		})

        actions.course.index(category_id, ccategory_id, internal_category_id, _ctype, sort-1, this.page);
	}

	onFooterRefresh = () => {
		const {actions} = this.props;
        const {cindex, ccindex, cccindex, ctype, sort} = this.state;

        let _ctype = ctype;
		if(ctype==2){
			_ctype = 3;
		}else if(ctype==3){
			_ctype = 1;
		}else if(ctype==1){
			_ctype = 0;
		}else if(ctype==0){
			_ctype = -1;
		}
        let category_id = 0;
        let ccategory_id = 0;
		let internal_category_id = 0;

        if (cindex > 0) {
            category_id = this.category[cindex - 1].categoryId;
            
            if (ccindex > 0) {
                ccategory_id = this.category[cindex - 1].child[ccindex - 1].categoryId;

				if (cccindex > 0) {
                    internal_category_id = this.category[cindex - 1].child[ccindex - 1].child[cccindex - 1].categoryId;
                }
            }
        }

        if (this.page < this.pages) {
            this.page = this.page + 1;
            actions.course.index(category_id, ccategory_id, internal_category_id, _ctype, sort-1, this.page);
        }
	}

	render() {
		const {cindex, ccindex, cccindex, sort, ctype, refresh} = this.state;

		let citems = ['全部'];
        let ccitems = [];
		let cccitems = [];

        this.category.map((category, index) => {
            citems.push(category.categoryName);
        });

        if (cindex > 0) {
            ccitems = ['全部'];
            const category = this.category[cindex - 1];

            category.child.map((ccategory, index) => {
                ccitems.push(ccategory.categoryName);
            });

			if (ccindex > 0) {
                cccitems = ['全部'];
                const ccategory = category.child[ccindex - 1];

                ccategory.child.map((cccategory, index) => {
                    cccitems.push(cccategory.categoryName);
                });
            }
        }

		return (
			<View className={'category container row col'}>
				<View>
					<View className={'p_15'}>
						<View className={'bg_light circle_10 p_5 search row ai_ct'} onClick={() => {
							Taro.navigateTo({
								url: '/v2/pages/home/search',
							})
						}}>
							<IconFont name={'search'} size={24}/>
							<Text className={'label_gray ml_5 row'}>请输入关键词</Text>
						</View>
					</View>
					<ScrollView
						scrollX
						className={'border_bottom'}
					>
						<View className={'row pt_10 nowrap'}>
						{citems.map((category, index) => {
							return (
								<View className={classNames('row col ai_ct', 'pl_15 pr_15', 'label_light', {'label_gray' : index == cindex})} onClick={() => {
									this.setState({
										cindex: index,
										ccindex: 0,
										cccindex: 0,
									}, () => {
										this.onHeaderRefresh();
									})
								}}>
									<Text>{category}</Text>
									<View className={classNames('dot circle_10 mt_5', {'bg_blue': index == cindex})}/>
								</View>
							)
						})}
						</View>
						

					</ScrollView>
					{ccitems.length > 0 ?
					<ScrollView
						scrollX
						className={'border_bottom'}
					>
						<View className={'row pt_10 nowrap'}>
						{ccitems.map((category, index) => {
							return (
								<View className={classNames('row col ai_ct', 'pl_15 pr_15', 'label_light', {'label_gray' : index == ccindex})} onClick={() => {
									this.setState({
										ccindex: index,
										cccindex: 0,
									}, () => {
										this.onHeaderRefresh();
									})
								}}>
									<Text>{category}</Text>
									<View className={classNames('dot circle_10 mt_5', {'bg_blue': index == ccindex})}/>
								</View>
							)
						})}
						</View>
					</ScrollView>
					: null}
					{cccitems.length > 0 ?
					<ScrollView
						scrollX
						className={'border_bottom'}
					>
						<View className={'row pt_10 nowrap'}>
						{cccitems.map((ccategory, index) => {
							return (
								<View className={classNames('row col ai_ct', 'pl_15 pr_15', 'label_light', {'label_gray' : index == cccindex})} onClick={() => {
									this.setState({
										cccindex: index,
									}, () => {
										this.onHeaderRefresh();
									})
								}}>
									<Text>{ccategory}</Text>
									<View className={classNames('dot circle_10 mt_5', {'bg_blue': index == cccindex})}/>
								</View>
							)
						})}
						</View>
					</ScrollView>
					: null}
					<View className={'row ai_ct jc_sb p_10'}>
						<Text className={'label_12 label_light'}>共 {this.total} 门资源</Text>
						<View className={'row ai_ct jc_sb'}>
							<Picker mode='selector' value={sort} range={this.sort} onChange={(e) => {
								this.setState({
									sort: e.detail.value,
								}, () => {
									this.onHeaderRefresh();
								})
							}}>
							<View className={'row ai_ct'}>
								<Text className={'label_12'}>{this.sort[sort]}</Text>
								<IconFont name={'xiasanjiao1'}/>
							</View>
							</Picker>
							<Picker mode='selector' value={ctype} range={this.type} onChange={(e) => {
								this.setState({
									ctype:parseInt(e.detail.value),
								}, () => {
									this.onHeaderRefresh();
								})
							}}>
							<View className={'row ai_ct ml_10'}>
								<Text className={'label_12'}>{this.type[ctype]}</Text>
								<IconFont name={'xiasanjiao1'}/>
							</View>
							</Picker>
						</View>
					</View>
				</View>
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
						<View className={'p_40'}>
						{this.course.map((course, index) => {
							if (course.ctype == 3) {
								return (
									<ArticleCell ttype={course.ttype} className={'mb_30 border_bottom pb_10'} course={course} onClick={() => {
										Taro.navigateTo({
											url: '/v2/pages/course/article?courseId=' + course.courseId,
										})
									}}/>
								)
							}

							return (
								<VodCell course={course} className={'mb_30'} onClick={() => {
									Taro.navigateTo({
										url: '/v2/pages/course/' + (course.ctype == 0 ? 'vod' : 'audio') + '?courseId=' + course.courseId,
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


const LayoutComponent = Category;

function mapStateToProps(state) {
	return {
		category: state.config.category_course,
        index: state.course.index,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})