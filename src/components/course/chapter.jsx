import React, { Component } from 'react'
import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import * as tool from '../../util/tool'

export default class Chapter extends Component {

    state = {
        cindex: this.props.cindex || 0,
        ccindex: this.props.ccindex || 0,
    }

    componentWillReceiveProps(nextProps) {
        const {cindex, ccindex} = nextProps;

        if (cindex !== this.props.cindex) {
            this.setState({
                cindex: cindex,
            })
        }

        if (ccindex !== this.props.ccindex) {
            this.setState({
                ccindex: ccindex
            })
        }
    }

	render () {
        const {className = '', items = []} = this.props;

        let total = 0;
        items.map((chapter, index) => {
            total += chapter.child.length;  
        })

		return (
			<View className={'chapter ' + className}>
                <View className={'pl_10 left_blue'}>
                    <Text className={'label_16'}>详情目录 <Text className={'label_12 label_gray'}>共{total}节</Text></Text>
                </View>
                {items.map((chapter, cindex) => {
                    return (
                        <View className={'mt_30'}>
                            {total > 1 ?
                            <View className={'bg_light p_10 pl_20 pr_20'}>
                                <Text><Text className={'label_gray'}>第{cindex + 1}章</Text> {chapter.chapterName}</Text>
                            </View>
                            : null}
                            {chapter.child.map((cchapter, ccindex) => {
                                const on = cindex == this.state.cindex && ccindex == this.state.ccindex;

                                return (
                                    <View className={'row ai_ct p_10'} onClick={() => this.props.onSelected && this.props.onSelected(cindex, ccindex)}>
                                        <Text className={'col_1'}></Text>
                                        <Text className={classNames('col_10', {'label_blue' : on})}>第{ccindex + 1}节 {cchapter.chapterName}</Text>
                                        <Text className={'col_5 label_12 label_gray'}>时长：{tool.forTime(cchapter.duration)}</Text>
                                    </View>
                                )
                            })}
                        </View>
                    )
                })}
                
			</View>
		)
	}
}
