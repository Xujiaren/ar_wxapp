import React, { Component } from 'react'
import Taro, {getCurrentInstance} from '@tarojs/taro'
import { View, Image, Text, Button } from '@tarojs/components'
import connectComponent from '../../../util/connect'
import './study.less'

class PaperDone extends Component {

    state = {
        loaded: false,
    }

    paper = {}
    paperId = getCurrentInstance().router.params.paperId || 0
    levelId = getCurrentInstance().router.params.levelId || 0

    componentDidShow() {
		this.onHeaderRefresh();
	}

    componentWillReceiveProps(nextProps) {
        const {info} = nextProps;
        
        if (info !== this.props.info) {
            this.paper = info;
            this.setState({
                loaded: true,
            })
        }
    }

    onHeaderRefresh = () => {
		const {actions} = this.props;
		actions.exam.info(this.paperId, this.levelId);
	}

	render () {
        const {loaded} = this.state;
        if (!loaded) return null;

		return (
			<View className={'paper container row col bg_dblue'}>
                <View className={'p_40'}>
                    <View className={'row col ai_ct'}>
                        <Image src={'https://arsxy.oss-cn-beijing.aliyuncs.com/app/study/paper.light.png'} className={'light'}/>
                    </View>
                    <View className={'bg_white circle_25 p_40'}>
                        {this.paper.isPass == 1 ?
                        <View className={'row col ai_ct'}>
                            <Text className={'label_25'}>恭喜您</Text>
                            <Text className={'label_20 row mt_10'}>顺利完成考试</Text>
                        </View>
                        : 
                        <View className={'row col ai_ct'}>
                            <Text className={'label_25'}>很遗憾</Text>
                            <Text className={'label_20 row mt_10'}>没能通过考试</Text>
                        </View>
                        }
                    
                        <View className={'row ai_ct jc_ad mt_80'}>
                            <View className={'row col ai_ct'}>
                                <Text className={'label_20'}>{this.paper.score}分</Text>
                                <Text className={'row label_gray mt_5'}>本次成绩</Text>
                            </View>
                            <View  className={'row col ai_ct'}>
                                <Text className={'label_20'}>{this.paper.correctNum}题</Text>
                                <Text className={'row label_gray mt_5'}>本次成绩</Text>
                            </View>
                            <View  className={'row col ai_ct'}>
                                <Text className={'label_20'}>{this.paper.topicNum - this.paper.correctNum}题</Text>
                                <Text className={'row label_gray mt_5'}>本次成绩</Text>
                            </View>
                        </View>

                        <Button className={'bg_blue label_white mt_80 circle_25'} onClick={() => {
                            Taro.navigateBack()
                        }}>{this.paper.isPass == 1 ? '考试回顾' : '重新考试'}</Button>
                    </View>
                    
                </View>
			</View>
		)
	}
}

const LayoutComponent = PaperDone;

function mapStateToProps(state) {
	return {
		info: state.exam.info,
	}
}

export default connectComponent({
	mapStateToProps,
	LayoutComponent,
})