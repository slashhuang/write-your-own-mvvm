/**
 * Created by slashhuang on 16/10/26.
 */
import $ from 'jquery';
const reg =/@(.*)/i; //事件正则
const musReg = /{{(.*)}}/i; //模板绑定
class mvvm {
    constructor(config,target){
        this.target = target;
        this.config =config;
        this.virtualDom={};
        //主逻辑入口
        this.logic()
    }
    logic(){
        this.parser(this.config);//解析模板
        this.addEvent(this.virtualDom); //挂载事件
        this.render();//渲染到dom节点
    }
    parser(domConfig) {
        let { template,data} =domConfig;
        //初始化的数据
        let $data =data();
        //存储dom节点对应的指令
        let cmdList=[];
        //生成dom节点 createDocumentFragment
        let fragment = $(template);
        //解析dom节点的属性
        let $attributes = [].slice.call(fragment[0].attributes);
        $attributes && $attributes.forEach((attr)=>{
            //存储指令列表
            cmdList.push({
                event:reg.exec(attr.name)[1],
                callbackName:attr.value
            });
        });
        //解析dom节点的innerHTML对应的key值
        let keyName=musReg.exec(fragment.html())[1];
        fragment.html($data[keyName]);
        //生成虚拟dom结构
        let fragVdom= {
            fragment:fragment, //dom
            cmdList:cmdList,  //指令
            data:$data,//数据
            children:[]
        };
        //这里只是个简单演示,并未做遍历dom结构处理
        this.virtualDom = fragVdom;
    }
    addEvent(vDom){
        let {fragment,cmdList} = vDom;
        cmdList && cmdList.forEach((cmd)=>{
            let {
                event,callbackName
            } = cmd;
            fragment.on(event,this.getMethod(callbackName))
        });
    }
    getMethod(name){
        let { methods }= this.config;
        return ()=>methods[name].apply(this.config); //保证引用中的this指向config文件
    }
    render() {
        let {fragment} = this.virtualDom;
        this.target.empty().append($(fragment));
    }
};
let config = {
    template : '<div @click="changeTest">{{test}}</div>',
    data(){
        return {
            test:'您初始化了所有的dom节点'
        }
    },
    methods:{
        changeTest:function(e){
            this.test = '点击了'
        }
    }
};
setTimeout(()=>new mvvm(config,$('#app')),0);
