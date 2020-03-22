/* 不能修改手机号
*  用户入口为登陆页面，出口“安全退出”，“注销账号”，“关闭窗口”
*  用户登陆成功后将该用户存放在sessionStorage中，供其他页面使用
*  将登陆用户的信息存放在currentUser临时变量中，在退出时把之前的用户替换掉 
*  layui的element模块自动为导航菜单项添加layui-this选中状态，因此在a标签的伪协议执行的函数必须放置layui.use()外面
*  注销账号的用户也要同步更新到departmentInfo
*/
// 清除layui-nav选中状态
function removeClickState(){
    $("a[href*='removeClickState']").parent().removeClass("layui-this");
}

layui.use(['layer','element'],function(){
    var layer=layui.layer
    ,element=layui.element;
    // 根据登陆用户显示该用户的名字
    let currentUser=JSON.parse(sessionStorage.loginUser);
    $("#username").text(currentUser.username);
    // 封装删除用户时更新departmentInfo
    function updateRemove(data){
        let departmentArr=JSON.parse(localStorage.departmentInfo);
        departmentArr.some(function(elem,index){
            if(data.limits===elem.limits){
                departmentArr[index].nums--;
                if(!data.isLeader){
                    // 删除普通员工
                    localStorage.departmentInfo=JSON.stringify(departmentArr);
                    return true;
                }else{
                    // 删除领导
                    departmentArr[index].leader='';
                    departmentArr[index].leaderPhone='';
                    localStorage.departmentInfo=JSON.stringify(departmentArr);
                    return true;
                }
            }else{
                return false;
            }
        });
    }
    // “退出”按钮和“注销”功能函数
    function quitOrDelete(isQuit){
        let userInfoArr=JSON.parse(localStorage.userInfo);
        // layer.confirm()是异步方法，因此这样some()依然会把userInfoArr遍历完，相比不做提示框，性能要做妥协
        // 如果坚持要用some()遍历，不用layer.confirm()，自己做一个提示框，根据提示框的按钮确定isQuit
        // 如果坚持用layer.confirm()，用forEach()遍历效果比some()好
        userInfoArr.forEach(function(elem,index){
            if(currentUser.userPhone===elem.userPhone){
                if(isQuit){
                    layer.confirm("确定要退出吗？",function(i){
                        currentUser.isLogin=false;
                        userInfoArr.splice(index,1,currentUser);
                        sessionStorage.loginUser=null;
                        layer.close(i);
                        localStorage.userInfo=JSON.stringify(userInfoArr);
                        location.href="../login.html";
                    });
                }else{
                    layer.confirm("确定要注销吗？",function(i){
                        updateRemove(currentUser);
                        userInfoArr.splice(index,1);
                        sessionStorage.loginUser=null;
                        layer.close(i);
                        localStorage.userInfo=JSON.stringify(userInfoArr);
                        location.href="../login.html";
                    });
                }
            }
        });
    }
    /* 
    *用事件委托机制去处理“修改信息”，“注销账号”，“安全退出”的点击功能 
    * elemState=0代表注销，1代表退出
    */
    $("dl.hover-bg").click(function(e){
        let elemState=+e.target.getAttribute("data-state");
        switch(elemState) {
            case 0:
            case 1:
                quitOrDelete(elemState);
                break;
        }
    });
    /* 用事件委托机制去处理各个部门页面跳转的点击功能
     */
    $("#pageLink").click(function(e){
        let src=$(e.target).data("src");
        $("#pages").attr("src",src);
    });
    // 更改导航的主题色
    $("dl.nav-bgcolor a").each(function(index){
        $(this).click(function(e){
            let bgcolor=["#D87093","#1E9FFF","#FFB800","#393D49"];
            $(".layui-nav").css({"background-color":bgcolor[index]});
            $("dl.nav-bgcolor a").not(this).css({"background-color":"#fff"});
            $(".layui-this a",$("dl.nav-bgcolor")).css({"background-color":bgcolor[index]});
        });
    });
});