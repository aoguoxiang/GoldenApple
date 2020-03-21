// 切换“登陆”和“注册”版块
function switchLoginOrRegis(){
    $(".login,.register").toggle();
}
// 加载职工，学员，物资，部门信息，存入localStorage
var prefixURL='json/';
var suffixURL='.json';
var fileNames=['userInfo','studentInfo','goodsInfo','departmentInfo'];
fileNames.forEach(function(elem){
    if(!localStorage[elem]){
        $.getJSON(prefixURL+elem+suffixURL,function(res){
            localStorage[elem]=JSON.stringify(res.data);
        });
    }
});
$("#pw").val(sessionStorage.password);

layui.use(['form','layer'],function(){
    let form=layui.form
    ,layer=layui.layer;
    // 记住密码功能
    form.on('switch(pw)',function(data){
        if(data.elem.checked){
            sessionStorage.password=$("#pw").val();
        }else{
            sessionStorage.password='';
        }
    });
    form.on('submit(logsign)',function(data){
        if(data.elem.id==="login"){
            // 监听“登陆”按钮
            if(localStorage.userInfo){
                let isExist=false;
                let userInfoArr=JSON.parse(localStorage.userInfo);
                userInfoArr.forEach(function(elem,index){
                    if(elem.userPhone===data.field.userPhone && elem.password===data.field.password){
                        userInfoArr[index].isLogin=true;
                        sessionStorage.loginUser=JSON.stringify(elem);
                        isExist=true;
                    }else{
                        userInfoArr[index].isLogin=false;
                    }
                });
                // 判断用户登陆信息在localStorage中是否存在并且密码正确
                if(isExist){
                    let jsonUserInfoStr=JSON.stringify(userInfoArr);
                    localStorage.userInfo=jsonUserInfoStr;
                    layer.msg("登陆成功");
                    location.href="html/index.html";
                }else{
                    layer.msg("用户名或密码错误");
                }
            }else{
                layer.msg("您还未注册");
            }
        }else{
            // 监听“注册”按钮
            if(localStorage.userInfo){
                // 验证确认密码
                if(data.field.comfirPassword===data.field.password){
                    let userInfoArr=JSON.parse(localStorage.userInfo);
                    let isAdd=userInfoArr.every(function(elem){
                        return elem.userPhone!==data.field.userPhone;
                    });
                    // 判断新注册的用户在localStorage是否存在
                    if(isAdd){
                        let len=userInfoArr.length;
                        data.field.id=String(+userInfoArr[len-1].id+1).padStart(4,"0");
                        let $selectedOption=$("select[name='limits'] option").filter(":selected")
                        data.field.limits=+$selectedOption.val();
                        data.field.department=$selectedOption.text();

                        userInfoArr.push(data.field);
                        let jsonUserInfoStr=JSON.stringify(userInfoArr);
                        localStorage.userInfo=jsonUserInfoStr;
                        layer.msg("注册成功");
                        switchLoginOrRegis();
                    }else{
                        layer.msg("该用户已注册");
                    }
                }else{
                    layer.msg("请检查，密码不一致");
                }
            }else{
                // 验证确认密码
                if(data.field.comfirPassword===data.field.password){
                    // 初始化localStorage的userInfo信息
                    let firstRegister=[];
                    data.field.id="0001";
                    let $selectedOption=$("select[name='limits'] option").filter(":selected")
                    data.field.limits=+$selectedOption.val();
                    data.field.department=$selectedOption.text();
                    firstRegister.push(data.field);
                    let jsonUserInfoStr=JSON.stringify(firstRegister);
                    localStorage.userInfo=jsonUserInfoStr;
                    layer.msg("注册成功");
                    switchLoginOrRegis();
                }else{
                    layer.msg("请检查，密码不一致");
                }
            }
        }
    });
    // 验证放在表单事件回调函数里，第一次点击没有验证效果
    form.verify({
        "data-username": function(value, item){ //value：表单的值、item：表单的DOM对象
            if(!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(value)){
                return '用户名不能有特殊字符';
            }
            if(/(^\_)|(\__)|(\_+$)/.test(value)){
                return '用户名首尾不能出现下划线\'_\'';
            }
            if(/^\d+\d+\d$/.test(value)){
                return '用户名不能全为数字';
            }
        },
        "data-pass": [
            /^[\S]{6,16}$/
            ,'密码必须6到16位，且不能出现空格'
        ],
        "data-acceptProtocal": function(value,item){
            if(!item.checked){
                return '请勾选同意服务条款';
            }
        }
    }); 
});