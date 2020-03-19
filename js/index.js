/* 不能修改手机号
*  将登陆用户的信息存放在currentUser临时变量中，在退出时把之前的用户替换掉 
*  layui的element模块自动为导航菜单项添加layui-this选中状态，因此在a标签的伪协议执行的函数必须放置layui.use()外面
*/
// 清除layui-nav选中状态
function removeClickState(){
    $("a[href*='removeClickState']").parent().removeClass("layui-this");
}
layui.use(['layer','element'],function(){
    var layer=layui.layer
    ,element=layui.element;
    let currentUser;
    // 根据登陆用户显示该用户的名字
    function showUsername(){
        let userInfoArr=JSON.parse(localStorage.userInfo);
        userInfoArr.some(function(elem,index){
            if(elem.isLogin===true){
                currentUser=elem;
                $("#username").text(elem.username);
                return true;
            }else{
                return false;
            }
        });
    }
    showUsername();
    // “退出”按钮和“注销”功能函数
    function quitOrDelete(isQuit){
        let userInfoArr=JSON.parse(localStorage.userInfo);
        userInfoArr.some(function(elem,index){
            if(currentUser.userPhone===elem.userPhone){
                if(isQuit){
                    currentUser.isLogin=false;
                    userInfoArr.splice(index,1,currentUser);
                }else{
                    userInfoArr.splice(index);
                }
                localStorage.userInfo=JSON.stringify(userInfoArr);
                location.href="../login.html";
                return true;
            }else{
                return false;
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